import { InjectQueue } from '@nestjs/bullmq';
import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OnEvent } from '@nestjs/event-emitter';
import { BookingStatus, PaymentStatus } from '@prisma/client';
import { Queue } from 'bullmq';
import { I18nService } from 'nestjs-i18n';
import { REMINDER_BEFORE_EXPIRED_DEFAULT } from 'src/common/constants/time.constant';
import { StatusKey } from 'src/common/enums/status-key.enum';
import { logAndThrowPrismaClientError } from 'src/common/helpers/catch-error.helper';
import { CustomLogger } from 'src/common/logger/custom-logger.service';
import { parseExpireTime } from 'src/common/utils/date.util';
import { BookingCanceledPayloadDto } from 'src/mail/dto/booking-canceled-payload.dto';
import { BookingStatusPayloadDto } from 'src/mail/dto/booking-confirmed-payload.dto';
import { BookingPaymentExpiredPayloadDto } from 'src/mail/dto/booking-payment-expired-payload.dto';
import { BookingPaymentSuccessPayloadDto } from 'src/mail/dto/booking-payment-success.dto';
import { MailService } from 'src/mail/mail.service';
import { StatusPaymentNotiPayload } from 'src/notification/dto/payloads/status-payment-noti-payload';
import { JobNotificationKey } from 'src/notification/enums/job-notification-key';
import { NotificationPublisher } from 'src/notification/notification-publisher';
import { PrismaService } from 'src/prisma/prisma.service';
import { BookingEvent } from './constants/booking-event.enum';
import { INCLUDE_PAYLOAD_EMAIL_BOOKING } from './constants/include.constant';
import { BookingCancelPayloadDto } from './dto/requests/booking-cancel-payload';
import { BookingConfirmEventPayloadDto } from './dto/requests/booking-confirm-event-payload.dto';
import { PaymentPaidPayloadDto } from './dto/requests/payment-paid-payload';

@Injectable()
export class BookingListener {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly loggerService: CustomLogger,
    private readonly i18nService: I18nService,
    private readonly mailService: MailService,
    private readonly configService: ConfigService,
    private readonly notificationPublisher: NotificationPublisher,
    @InjectQueue('booking') private readonly queue: Queue,
  ) {}
  @OnEvent(BookingEvent.BOOKING_CONFIRMED)
  async handleBookingConfirmed(payload: BookingConfirmEventPayloadDto) {
    this.loggerService.debug('Call booking confirmed !!!');
    this.loggerService.debug(`Payload:: ' ${JSON.stringify(payload)}`);
    const now = Date.now();
    const reminderBeforeExpire = this.configService.get<string>(
      'payOS.reminderBeforeExpire',
      REMINDER_BEFORE_EXPIRED_DEFAULT,
    );
    this.loggerService.debug(`[Reminder ms:: ] ${reminderBeforeExpire}`);
    const reminderBeforeExpireId = `reminder-payment-${payload.bookingId}`;
    const expiredId = `expired-${payload.bookingId}`;
    const nowSec = Math.floor(now / 1000);
    const reminderBeforeExpireSec = parseExpireTime(reminderBeforeExpire); // trả về giây
    const delayReminder =
      (payload.expiredAt - nowSec - reminderBeforeExpireSec) * 1000;
    const delayExpired = (payload.expiredAt - nowSec) * 1000;
    try {
      if (delayReminder > 0) {
        await this.queue.add(JobNotificationKey.PAYMENT_REMINDER, payload, {
          delay: delayReminder,
          jobId: reminderBeforeExpireId,
        });
      }
      if (delayExpired > 0) {
        await this.queue.add(JobNotificationKey.PAYMENT_EXPIRED, payload, {
          delay: delayExpired,
          jobId: expiredId,
        });
      }
    } catch (exception) {
      this.loggerService.error(
        `[Schedule Payment Notification]:: ${JSON.stringify(exception)}`,
      );
    }
  }
  @OnEvent(BookingEvent.BOOKING_REJECTED)
  async handleBookingRejected(bookingId: number) {
    await this.clearScheduleBooking(bookingId);
  }
  @OnEvent(BookingEvent.BOOKING_PAID)
  async handleBookingPaid(payload: PaymentPaidPayloadDto) {
    const bookingDetail = await this.prismaService.booking.findUnique({
      where: {
        id: payload.bookingId,
        status: BookingStatus.CONFIRMED,
      },
    });
    if (!bookingDetail)
      throw new BadRequestException(
        this.i18nService.translate('common.booking.notFound'),
      );
    const { bookingUpdated, paymentUpdated } =
      await this.prismaService.$transaction(async (tx) => {
        await this.clearScheduleBooking(payload.bookingId);
        const bookingUpdated = await tx.booking.update({
          where: { id: bookingDetail.id },
          data: { status: BookingStatus.COMPLETED },
          include: INCLUDE_PAYLOAD_EMAIL_BOOKING,
        });
        const paymentUpdated = await tx.payment.update({
          where: {
            bookingId: bookingDetail.id,
          },
          data: {
            status: PaymentStatus.PAID,
            paidAt: new Date(),
          },
        });
        return { bookingUpdated, paymentUpdated };
      });
    const bookingPaymentSucessPayload: BookingPaymentSuccessPayloadDto = {
      to: bookingUpdated.user.email,
      booking: bookingUpdated,
      payment: paymentUpdated,
    };
    const notifiPaymentSuccessPayload: StatusPaymentNotiPayload = {
      bookingId: bookingUpdated.id,
      paymentId: paymentUpdated.id,
      amount: paymentUpdated.amount,
      method: paymentUpdated.method,
      payerName: bookingUpdated.user.name,
      paidAt: paymentUpdated.paidAt ?? new Date(),
      type: PaymentStatus.PAID,
    };
    this.notificationPublisher.publishStatusPayment(
      notifiPaymentSuccessPayload,
    );
    await this.mailService.sendBookingPaymentSuccess(
      bookingPaymentSucessPayload,
    );
    this.loggerService.debug(
      `Send email payment success:: ${JSON.stringify(paymentUpdated)}`,
    );
  }
  @OnEvent(BookingEvent.BOOKING_REMINDER)
  async handleBookingReminder(payload: BookingConfirmEventPayloadDto) {
    const bookingDetail = await this.prismaService.booking.findUnique({
      where: {
        id: payload.bookingId,
      },
      include: INCLUDE_PAYLOAD_EMAIL_BOOKING,
    });
    if (!bookingDetail) {
      this.loggerService.error(
        `Booking by id [${payload.bookingId}] not found - not send reminder email`,
      );
      return;
    }
    const emailPayload: BookingStatusPayloadDto = {
      to: bookingDetail.user.email,
      booking: bookingDetail,
      expiredAt: payload.expiredAt,
      paymentLink: payload?.paymentLink ?? '',
    };
    await this.mailService.sendReminderBookingMail(emailPayload);
  }
  @OnEvent(BookingEvent.BOOKING_EXPIRED)
  async handleBookingExpired(payload: BookingConfirmEventPayloadDto) {
    await this.clearScheduleBooking(payload.bookingId);
    let emailPayload: BookingPaymentExpiredPayloadDto;
    try {
      const { bookingUpdated } = await this.prismaService.$transaction(
        async (tx) => {
          const bookingUpdated = await tx.booking.update({
            where: {
              id: payload.bookingId,
            },
            data: {
              status: BookingStatus.CANCELED,
            },
            include: INCLUDE_PAYLOAD_EMAIL_BOOKING,
          });
          await tx.payment.update({
            where: {
              bookingId: payload.bookingId,
            },
            data: {
              status: PaymentStatus.FAILED,
            },
          });
          return { bookingUpdated };
        },
      );
      this.loggerService.debug(
        `Booking updated:: ${JSON.stringify(bookingUpdated)}`,
      );
      const reason = this.i18nService.translate(
        'common.notification.message.expiredPayment',
        {
          args: {
            bookingId: bookingUpdated.id,
          },
        },
      );
      const notifyPaymentFailed: StatusPaymentNotiPayload = {
        bookingId: bookingUpdated.id,
        payerName: bookingUpdated.user.name,
        reason,
        paidAt: bookingUpdated.updatedAt,
        type: PaymentStatus.FAILED,
      };
      this.notificationPublisher.publishStatusPayment(notifyPaymentFailed);
      emailPayload = {
        to: bookingUpdated.user.email,
        userName: bookingUpdated.user.name,
        spaceName: bookingUpdated.space.name,
        startTime: new Date(bookingUpdated.startTime),
        endTime: new Date(bookingUpdated.endTime),
      };
    } catch (error) {
      logAndThrowPrismaClientError(
        error as Error,
        BookingListener.name,
        'booking',
        'handleBookingExpired',
        StatusKey.FAILED,
        this.loggerService,
        this.i18nService,
      );
    }
    if (emailPayload) {
      await this.mailService.sendBookingPaymentExpired(emailPayload);
    }
  }
  @OnEvent(BookingEvent.BOOKING_CANCELED)
  async handleCancelBooking(payload: BookingCancelPayloadDto) {
    await this.clearScheduleBooking(payload.bookingId);
    const emailPayload: BookingCanceledPayloadDto = {
      to: payload.userEmail,
      startTime: payload.startTime,
      endTime: payload.endTime,
      spaceName: payload.spaceName,
      name: payload.name,
    };
    await this.mailService.sendBookingCanceled(emailPayload);
  }
  async clearScheduleBooking(bookingId: number) {
    await this.queue.remove(`reminder-payment-${bookingId}`);
    await this.queue.remove(`expired-${bookingId}`);
  }
}
