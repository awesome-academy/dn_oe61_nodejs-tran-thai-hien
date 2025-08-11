import { InjectQueue } from '@nestjs/bullmq';
import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { NotificationType, VenueStatus } from '@prisma/client';
import { Queue } from 'bullmq';
import { I18nService } from 'nestjs-i18n';
import { BookingService } from 'src/booking/booking.service';
import {
  CREATE_VENUE_TITLE,
  TITLE_NEW_MESSAGE,
} from 'src/common/constants/notification.constant';
import { QUEUE_NOTIFICATION } from 'src/common/constants/queue.constant';
import { CustomLogger } from 'src/common/logger/custom-logger.service';
import { formatDateTime, formatTime } from 'src/common/utils/date.util';
import { AdminModeratorSummaryResponseDto } from 'src/user/dto/responses/admin-moderator-summary-response.dto';
import { UserService } from 'src/user/user.service';
import {
  MessageKeyStatusBooking,
  PartialBookingNotificationMap,
  PartialBookingStatus,
} from './constants/status-booking.constant';
import {
  MessageKeyStatusPayment,
  PartialPaymentNotificationMap,
  PartialPaymentStatus,
} from './constants/status-payment.constant';
import {
  MessageKeyStatusVenue,
  venueNotificationMap,
} from './constants/status-venue.constant';
import { BookingStatusNotiPayload } from './dto/payloads/create-booking-noti-payload';
import { CreateVenuePayload } from './dto/payloads/create-venue-payload';
import { NewMessageNotiPayload } from './dto/payloads/new-message-noti-payload';
import { StatusPaymentNotiPayload } from './dto/payloads/status-payment-noti-payload';
import { VenueStatusNotiPayload } from './dto/payloads/status-venue-payload';
import { NotificationCreationRequestDto } from './dto/requests/notification-creation-request.dto';
import { NotificationEvent } from './enums/notification-event.enum';

@Injectable()
export class NotificationListener {
  constructor(
    @InjectQueue(QUEUE_NOTIFICATION) private readonly notificationQueue: Queue,
    private readonly loggerService: CustomLogger,
    private readonly userService: UserService,
    private readonly bookingService: BookingService,
    private readonly i18nService: I18nService,
  ) {}
  @OnEvent(NotificationEvent.VENUE_CREATED)
  async handleNotifiCreateVenue(payload: CreateVenuePayload): Promise<void> {
    try {
      const admins: AdminModeratorSummaryResponseDto[] =
        await this.userService.findAllAdminsAndModerators();
      const receiverIds = admins.map((admin) => admin.id);
      await this.addNotificationJobs(
        NotificationEvent.VENUE_CREATED,
        receiverIds,
        (receiverId) => this.buildNotiCreatVenueData(receiverId, payload),
      );
    } catch (error) {
      const exception = error as Error;
      this.logErrorAddQueue(NotificationEvent.VENUE_CREATED, exception);
    }
  }
  @OnEvent(NotificationEvent.VENUE_REJECTED)
  async handleNotifiRejectedVenue(
    payload: VenueStatusNotiPayload,
  ): Promise<void> {
    try {
      const dataPayload = this.buildNotiStatusVenueData(
        payload,
        VenueStatus.REJECTED,
      );
      await this.addNotificationJobSingle(
        NotificationEvent.VENUE_REJECTED,
        dataPayload,
      );
    } catch (error) {
      const exception = error as Error;
      this.logErrorAddQueue(NotificationEvent.VENUE_REJECTED, exception);
    }
  }
  @OnEvent(NotificationEvent.VENUE_APPROVED)
  async handleNotifiApproveddVenue(
    payload: VenueStatusNotiPayload,
  ): Promise<void> {
    try {
      const dataPayload = this.buildNotiStatusVenueData(
        payload,
        VenueStatus.APPROVED,
      );
      await this.addNotificationJobSingle(
        NotificationEvent.VENUE_APPROVED,
        dataPayload,
      );
    } catch (error) {
      const exception = error as Error;
      this.logErrorAddQueue(NotificationEvent.VENUE_APPROVED, exception);
    }
  }
  @OnEvent(NotificationEvent.VENUE_BLOCKED)
  async handleNotifiBlockedVenue(
    payload: VenueStatusNotiPayload,
  ): Promise<void> {
    try {
      const dataPayload = this.buildNotiStatusVenueData(
        payload,
        VenueStatus.BLOCKED,
      );
      await this.addNotificationJobSingle(
        NotificationEvent.VENUE_BLOCKED,
        dataPayload,
      );
    } catch (error) {
      const exception = error as Error;
      this.logErrorAddQueue(NotificationEvent.VENUE_BLOCKED, exception);
    }
  }
  @OnEvent(NotificationEvent.BOOKING_CREATED)
  async handleNotifiBookingCreated(
    payload: BookingStatusNotiPayload,
  ): Promise<void> {
    try {
      const ownerIds = await this.bookingService.getOwnersAndManagersId(
        payload.bookingId,
      );
      if (!ownerIds) return;
      await this.addNotificationJobs(
        NotificationEvent.BOOKING_CREATED,
        ownerIds,
        (receiverId) => this.buildNotiBookingStatus(receiverId, payload),
      );
    } catch (error) {
      const exception = error as Error;
      this.logErrorAddQueue(NotificationEvent.BOOKING_CREATED, exception);
    }
  }
  @OnEvent(NotificationEvent.BOOKING_CANCELED)
  async handleNotifiBookingCanceled(
    payload: BookingStatusNotiPayload,
  ): Promise<void> {
    try {
      const ownerIds = await this.bookingService.getOwnersAndManagersId(
        payload.bookingId,
      );
      if (!ownerIds) return;
      await this.addNotificationJobs(
        NotificationEvent.BOOKING_CANCELED,
        ownerIds,
        (receiverId) => this.buildNotiBookingStatus(receiverId, payload),
      );
    } catch (error) {
      const exception = error as Error;
      this.logErrorAddQueue(NotificationEvent.BOOKING_CANCELED, exception);
    }
  }
  @OnEvent(NotificationEvent.NEW_MESSAGE)
  async handleNotiNewMessage(payload: NewMessageNotiPayload) {
    const title = TITLE_NEW_MESSAGE;
    const type = NotificationType.NEW_MESSAGE;
    const time = formatTime(payload.sentAt);
    const message = this.i18nService.translate(
      'common.notification.message.newMessage',
      {
        args: {
          name: payload.senderName,
          time,
        },
      },
    );
    const notificationData: NotificationCreationRequestDto = {
      receiverId: payload.receiverId,
      title,
      type,
      message,
    };
    try {
      await this.addNotificationJobSingle(
        NotificationEvent.NEW_MESSAGE,
        notificationData,
      );
    } catch (error) {
      const exception = error as Error;
      this.logErrorAddQueue(NotificationEvent.NEW_MESSAGE, exception);
    }
  }
  @OnEvent(NotificationEvent.PAYMENT_SUCCESS)
  async handleNotiPaymentSuccess(payload: StatusPaymentNotiPayload) {
    try {
      const ownerIds = await this.bookingService.getOwnersAndManagersId(
        payload.bookingId,
      );
      if (!ownerIds) return;
      await this.addNotificationJobs(
        NotificationEvent.PAYMENT_SUCCESS,
        ownerIds,
        (receiverId) => this.buildNotiPaymentStatus(receiverId, payload),
      );
    } catch (error) {
      const exception = error as Error;
      this.logErrorAddQueue(NotificationEvent.PAYMENT_SUCCESS, exception);
    }
  }
  @OnEvent(NotificationEvent.PAYMENT_FAILED)
  async handleNotiPaymentFailed(payload: StatusPaymentNotiPayload) {
    try {
      const ownerIds = await this.bookingService.getOwnersAndManagersId(
        payload.bookingId,
      );
      if (!ownerIds) return;
      await this.addNotificationJobs(
        NotificationEvent.PAYMENT_FAILED,
        ownerIds,
        (receiverId) => this.buildNotiPaymentStatus(receiverId, payload),
      );
    } catch (error) {
      const exception = error as Error;
      this.logErrorAddQueue(NotificationEvent.PAYMENT_FAILED, exception);
    }
  }
  private buildNotiCreatVenueData(
    receiverId: number,
    payload: CreateVenuePayload,
  ): NotificationCreationRequestDto {
    const typeNotification = NotificationType.VENUE_CREATED;
    const title = CREATE_VENUE_TITLE;
    const createdAt = formatDateTime(payload.createdAt);
    const message = this.i18nService.translate(
      'common.notification.message.createVenue',
      {
        args: {
          venueName: payload.venueName,
          venueId: payload.id,
          creatorName: payload.ownerName,
          createdAt,
        },
      },
    );
    return {
      receiverId,
      title,
      type: typeNotification,
      message,
    };
  }
  private buildNotiStatusVenueData(
    payload: VenueStatusNotiPayload,
    type: VenueStatus,
  ): NotificationCreationRequestDto {
    const {
      type: typeNotification,
      title,
      messageKey,
    } = venueNotificationMap[type];
    const time = formatDateTime(payload.updatedAt);
    const reason = payload.reason;
    const message = this.getMessageByStatusVenue(
      messageKey,
      payload,
      time,
      reason,
    );
    return {
      receiverId: payload.ownerId,
      title,
      type: typeNotification,
      message,
    };
  }
  private buildNotiBookingStatus(
    receiverId: number,
    payload: BookingStatusNotiPayload,
  ): NotificationCreationRequestDto {
    const { type, messageKey, title } =
      PartialBookingNotificationMap[payload.type as PartialBookingStatus];
    const message = this.getMessageByStatusBooking(messageKey, payload);
    return {
      receiverId,
      title: title,
      type: type,
      message,
    };
  }
  private buildNotiPaymentStatus(
    receiverId: number,
    payload: StatusPaymentNotiPayload,
  ): NotificationCreationRequestDto {
    const { type, messageKey, title } =
      PartialPaymentNotificationMap[payload.type as PartialPaymentStatus];
    const message = this.getMessageByStatusPayment(messageKey, payload);
    return {
      receiverId,
      title: title,
      type: type,
      message,
    };
  }
  private getMessageByStatusVenue(
    key: MessageKeyStatusVenue,
    payload: VenueStatusNotiPayload,
    time: string,
    reason?: string,
  ): string {
    switch (key) {
      case MessageKeyStatusVenue.APPROVED:
        return this.i18nService.translate(
          'common.notification.message.approvedVenue',
          {
            args: {
              venueName: payload.venueName,
              venueId: payload.venueId,
              actionBy: payload.actionBy,
              time,
            },
          },
        );
      case MessageKeyStatusVenue.REJECTED:
        return this.i18nService.translate(
          'common.notification.message.rejectedVenue',
          {
            args: {
              venueName: payload.venueName,
              venueId: payload.venueId,
              actionBy: payload.actionBy,
              reason,
              time: time,
            },
          },
        );
      case MessageKeyStatusVenue.BLOCKED:
        return this.i18nService.translate(
          'common.notification.message.blockedVenue',
          {
            args: {
              venueName: payload.venueName,
              venueId: payload.venueId,
              actionBy: payload.actionBy,
              reason,
              time: time,
            },
          },
        );
      default:
        return 'none-status';
    }
  }
  private getMessageByStatusBooking(
    key: MessageKeyStatusBooking,
    payload: BookingStatusNotiPayload,
  ): string {
    const startDate = formatDateTime(payload.startDate);
    const endDate = formatDateTime(payload.endDate);
    switch (key) {
      case MessageKeyStatusBooking.CREATED:
        return this.i18nService.translate(
          'common.notification.message.createdBooking',
          {
            args: {
              ownerName: payload.ownerName,
              spaceName: payload.spaceName,
              bookingId: payload.bookingId,
              startDate,
              endDate,
            },
          },
        );
      case MessageKeyStatusBooking.CANCELED:
        return this.i18nService.translate(
          'common.notification.message.canceledBooking',
          {
            args: {
              ownerName: payload.ownerName,
              spaceName: payload.spaceName,
              bookingId: payload.bookingId,
              startDate,
              endDate,
            },
          },
        );
      default:
        return 'Non Message';
    }
  }
  private getMessageByStatusPayment(
    key: MessageKeyStatusPayment,
    payload: StatusPaymentNotiPayload,
  ): string {
    const time = formatDateTime(payload.paidAt);
    switch (key) {
      case MessageKeyStatusPayment.SUCCESS:
        return this.i18nService.translate(
          'common.notification.message.paymentSuccess',
          {
            args: {
              bookingId: payload.bookingId,
              payerName: payload.payerName,
              amount: payload.amount,
              time,
              method: payload.method,
            },
          },
        );
      case MessageKeyStatusPayment.FAILED:
        console.log('Payload:: ', JSON.stringify(payload));
        return this.i18nService.translate(
          'common.notification.message.paymentFailed',
          {
            args: {
              bookingId: payload.bookingId,
              payerName: payload.payerName,
              reason: payload.reason,
              time,
            },
          },
        );
      default:
        return 'Non Message';
    }
  }

  private async addNotificationJobs(
    eventName: string,
    receiverIds: number[],
    buildFn: (receiverId: number) => NotificationCreationRequestDto,
  ): Promise<void> {
    const jobs = receiverIds.map((receiverId) => ({
      name: eventName,
      data: buildFn(receiverId),
      options: {
        jobId: `${eventName}-${receiverId}-${Date.now()}`,
        attempts: 3,
        backoff: { type: 'exponential', delay: 5000 },
        removeOnComplete: true,
        removeOnFail: false,
      },
    }));
    await this.notificationQueue.addBulk(jobs);
  }
  private async addNotificationJobSingle(
    eventName: string,
    data: NotificationCreationRequestDto,
  ): Promise<void> {
    await this.notificationQueue.add(eventName, data, {
      attempts: 3,
      backoff: { type: 'exponential', delay: 5000 },
      removeOnComplete: true,
      removeOnFail: false,
    });
  }
  private logErrorAddQueue(eventName: NotificationEvent, error: Error) {
    this.loggerService.error(
      `ADD QUEUE EVENT [${eventName}] FAILED`,
      `Caused by: ${error.stack}`,
    );
  }
}
