import { InjectQueue } from '@nestjs/bullmq';
import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { Queue } from 'bullmq';
import { I18nService } from 'nestjs-i18n';
import { PREFIX_PHONE_NUMBER_VI } from 'src/common/constants/phone-number.dto';
import { CustomLogger } from 'src/common/logger/custom-logger.service';
import { getRemainingTime } from 'src/common/utils/date.util';
import { PrismaService } from 'src/prisma/prisma.service';
import { SmsEvent } from './constants/sms-event.enum';
import { ConfirmBookingSmsPayload } from './dto/requests/confirm-booking-sms-payload';
import { SmsSendPayloadDto } from './dto/requests/sms-send-payload';

@Injectable()
export class SmsListener {
  constructor(
    @InjectQueue('sms') private readonly queue: Queue,
    private readonly prismaService: PrismaService,
    private readonly i18nService: I18nService,
    private readonly loggerService: CustomLogger,
  ) {}
  @OnEvent(SmsEvent.CONFIRMED_BOOKING)
  async handleBookingConfirmed(payload: ConfirmBookingSmsPayload) {
    try {
      const userDetail = await this.prismaService.profile.findUnique({
        where: {
          userId: payload.userId,
        },
      });
      if (!userDetail || !userDetail?.phone) {
        this.loggerService.log(
          `User ID (${payload.userId}) No profile or No phone number`,
        );
        return;
      }
      const phoneNumber = userDetail.phone;
      const phoneFormarted = phoneNumber?.replace('0', PREFIX_PHONE_NUMBER_VI);
      const expiredAt = getRemainingTime(payload.expiredAt);
      const text = this.i18nService.translate(
        'common.sms.message.confirmedBooking',
        {
          args: {
            bookingId: payload.bookingId,
            spaceName: payload.nameSpace,
            expiredAt: expiredAt,
          },
        },
      );
      const smsPayload: SmsSendPayloadDto = {
        to: phoneFormarted,
        text,
      };
      await this.queue.add(SmsEvent.CONFIRMED_BOOKING, smsPayload);
    } catch (error) {
      this.logErrorAddQueue(SmsEvent.CONFIRMED_BOOKING, error as Error);
    }
  }
  private logErrorAddQueue(eventName: SmsEvent, error: Error) {
    this.loggerService.error(
      `ADD QUEUE EVENT [${eventName}] FAILED`,
      `Caused by: ${error.stack}`,
    );
  }
}
