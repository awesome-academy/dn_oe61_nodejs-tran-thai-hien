import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { validateOrReject, ValidationError } from 'class-validator';
import { I18nService } from 'nestjs-i18n';
import { MailErrorCode } from './constants/mail-error.constant';
import { MAIL_TYPE, MailType } from './constants/mail-type.constant';
import {
  BOOKING_REQUEST,
  SUBJECT_BOOKING_CANCELED,
  SUBJECT_BOOKING_PAYMENT_EXPIRED,
  SUBJECT_BOOKING_PAYMENT_SUCCESS,
  SUBJECT_COFINRM_EMAIL,
  SUBJECT_COFIRMED_BOOKING,
  SUBJECT_FORGOT_PASSWORD,
  SUBJECT_REJECTED_BOOKING,
  SUBJECT_REMINDER_BOOKING,
} from './constants/subject-email.constant';
import { MailPayloadDto } from './dto/mail-payload.dto';
import { MailException } from './exceptions/mail.exception';
import { MailerError } from './interfaces/mailer-error.interface';
import { BookingRequestPayloadDto } from './dto/booking-request-payload.dto';
import { formatDateTime, getRemainingTime } from 'src/common/utils/date.util';
import { BookingStatusPayloadDto } from './dto/booking-confirmed-payload.dto';
import { BookingRejectedPayloadDto } from './dto/booking-rejected-payload.dto';
import { BookingPaymentSuccessPayloadDto } from './dto/booking-payment-success.dto';
import { BookingPaymentExpiredPayloadDto } from './dto/booking-payment-expired-payload.dto';
import { BookingCanceledPayloadDto } from './dto/booking-canceled-payload.dto';
import { AuthService } from 'src/auth/auth.service';
import { ViewBookingTokenPayload } from 'src/auth/interfaces/view-booking-token.payload';
import { CustomLogger } from 'src/common/logger/custom-logger.service';

@Injectable()
export class MailService {
  constructor(
    private readonly mailerService: MailerService,
    private readonly configService: ConfigService,
    private readonly i18nService: I18nService,
    private readonly authService: AuthService,
    private readonly loggerService: CustomLogger,
  ) {}
  async sendUserMail(mailPayload: MailPayloadDto) {
    try {
      const dto = Object.assign(new MailPayloadDto(), mailPayload);
      await validateOrReject(dto);
    } catch (error) {
      const details = this.formatValidationErrors(error as ValidationError[]);
      throw new MailException(MailErrorCode.INVALID_PAYLOAD, details);
    }
    const appUrl = this.configService.get<string>('app.url');
    const appName = this.configService.get<string>('app.name');
    const path = this.getPath(mailPayload.type);
    const subject = this.getSubject(mailPayload.type);
    const verificationLink = `${appUrl}${path}?token=${mailPayload.token}`;
    try {
      await this.mailerService.sendMail({
        to: mailPayload.to,
        subject: subject,
        template: this.getTempalte(mailPayload.type),
        context: {
          appName: appName,
          userName: mailPayload.recipientUserName,
          name: mailPayload.recipientName ?? 'GUEST',
          verificationLink: verificationLink,
          expiresAt: mailPayload.expiresAt,
        },
      });
    } catch (error) {
      const err = error as MailerError;
      this.throwErrorMailer(err.code);
    }
  }
  async sendBookingRequest(payload: BookingRequestPayloadDto) {
    try {
      const dto = Object.assign(new BookingRequestPayloadDto(), payload);
      await validateOrReject(dto);
    } catch (error) {
      const details = this.formatValidationErrors(error as ValidationError[]);
      throw new MailException(MailErrorCode.INVALID_PAYLOAD, details);
    }
    try {
      const subject = `${BOOKING_REQUEST} for ${payload.booking.space.name}`;
      const startTime = formatDateTime(payload.booking.startTime);
      const endTime = formatDateTime(payload.booking.endTime);
      const bookingLink = await this.generateLinkViewBooking(
        payload.booking.id,
        payload.booking.userId,
      );
      await this.mailerService.sendMail({
        to: payload.to,
        subject: subject,
        template: 'request-booking',
        context: {
          name: payload.booking.user.name,
          spaceName: payload.booking.space.name,
          startTime: startTime,
          endTime: endTime,
          bookingLink,
        },
      });
    } catch (error) {
      const err = error as MailerError;
      this.throwErrorMailer(err.code);
    }
  }
  async sendBookingConfirmedMail(payload: BookingStatusPayloadDto) {
    try {
      const dto = Object.assign(new BookingRequestPayloadDto(), payload);
      await validateOrReject(dto);
    } catch (error) {
      const details = this.formatValidationErrors(error as ValidationError[]);
      throw new MailException(MailErrorCode.INVALID_PAYLOAD, details);
    }
    try {
      const subject = `${SUBJECT_COFIRMED_BOOKING} for ${payload.booking.space.name}`;
      const startTime = formatDateTime(payload.booking.startTime);
      const endTime = formatDateTime(payload.booking.endTime);
      const expiredAt = payload?.expiredAt
        ? formatDateTime(new Date(payload.expiredAt * 1000))
        : null;
      const bookingLink = await this.generateLinkViewBooking(
        payload.booking.id,
        payload.booking.userId,
      );
      await this.mailerService.sendMail({
        to: payload.to,
        subject: subject,
        template: 'booking-confirmed',
        context: {
          name: payload.booking.user.name,
          spaceName: payload.booking.space.name,
          startTime: startTime,
          endTime: endTime,
          checkoutUrl: payload.paymentLink,
          bookingLink,
          expiredAt: expiredAt ?? 'Không xác định',
        },
      });
    } catch (error) {
      const err = error as MailerError;
      this.throwErrorMailer(err.code);
    }
  }
  async sendBookingRejectedMail(payload: BookingRejectedPayloadDto) {
    try {
      const dto = Object.assign(new BookingRejectedPayloadDto(), payload);
      await validateOrReject(dto);
    } catch (error) {
      const details = this.formatValidationErrors(error as ValidationError[]);
      throw new MailException(MailErrorCode.INVALID_PAYLOAD, details);
    }
    try {
      const subject = `${SUBJECT_REJECTED_BOOKING} for ${payload.booking.space.name}`;
      const startTime = formatDateTime(payload.booking.startTime);
      const endTime = formatDateTime(payload.booking.endTime);
      await this.mailerService.sendMail({
        to: payload.to,
        subject: subject,
        template: 'booking-rejected',
        context: {
          name: payload.booking.user.name,
          spaceName: payload.booking.space.name,
          startTime: startTime,
          endTime: endTime,
          reason: payload?.reason,
        },
      });
    } catch (error) {
      const err = error as MailerError;
      this.throwErrorMailer(err.code);
    }
  }
  async sendReminderBookingMail(payload: BookingStatusPayloadDto) {
    try {
      const dto = Object.assign(new BookingRequestPayloadDto(), payload);
      await validateOrReject(dto);
    } catch (error) {
      const details = this.formatValidationErrors(error as ValidationError[]);
      throw new MailException(MailErrorCode.INVALID_PAYLOAD, details);
    }
    try {
      const subject = `${SUBJECT_REMINDER_BOOKING} for ${payload.booking.space.name}`;
      const startTime = formatDateTime(payload.booking.startTime);
      const endTime = formatDateTime(payload.booking.endTime);
      const expiredAt = formatDateTime(new Date(payload.expiredAt * 1000));
      const bookingLink = await this.generateLinkViewBooking(
        payload.booking.id,
        payload.booking.userId,
      );
      const remainingTime = getRemainingTime(payload.expiredAt);
      await this.mailerService.sendMail({
        to: payload.to,
        subject: subject,
        template: 'reminder-booking',
        context: {
          name: payload.booking.user.name,
          spaceName: payload.booking.space.name,
          startTime: startTime,
          endTime: endTime,
          expiredAt: expiredAt,
          remainingTime: remainingTime,
          checkoutUrl: payload.paymentLink,
          bookingLink,
        },
      });
    } catch (error) {
      const err = error as MailerError;
      this.throwErrorMailer(err.code);
    }
  }
  async sendBookingPaymentSuccess(payload: BookingPaymentSuccessPayloadDto) {
    try {
      const dto = Object.assign(new BookingPaymentSuccessPayloadDto(), payload);
      await validateOrReject(dto);
    } catch (error) {
      const details = this.formatValidationErrors(error as ValidationError[]);
      throw new MailException(MailErrorCode.INVALID_PAYLOAD, details);
    }
    try {
      const subject = `${SUBJECT_BOOKING_PAYMENT_SUCCESS} for ${payload.booking.space.name}`;
      const startTime = formatDateTime(payload.booking.startTime);
      const endTime = formatDateTime(payload.booking.endTime);
      const method = payload.payment.method.replace('_', ' ');
      const bookingLink = await this.generateLinkViewBooking(
        payload.booking.id,
        payload.booking.userId,
      );
      await this.mailerService.sendMail({
        to: payload.to,
        subject: subject,
        template: 'booking-payment-success',
        context: {
          name: payload.booking.user.name,
          spaceName: payload.booking.space.name,
          startTime: startTime,
          endTime: endTime,
          amount: payload.payment.amount,
          method: method,
          bookingLink,
        },
      });
    } catch (error) {
      const err = error as MailerError;
      this.throwErrorMailer(err.code);
    }
  }
  async sendBookingPaymentExpired(payload: BookingPaymentExpiredPayloadDto) {
    try {
      const dto = Object.assign(new BookingPaymentExpiredPayloadDto(), payload);
      await validateOrReject(dto);
    } catch (error) {
      const details = this.formatValidationErrors(error as ValidationError[]);
      throw new MailException(MailErrorCode.INVALID_PAYLOAD, details);
    }
    try {
      const subject = `${SUBJECT_BOOKING_PAYMENT_EXPIRED} for ${payload.spaceName}`;
      const startTime = formatDateTime(payload.startTime);
      const endTime = formatDateTime(payload.endTime);
      await this.mailerService.sendMail({
        to: payload.to,
        subject: subject,
        template: 'booking-payment-expired',
        context: {
          name: payload.userName,
          spaceName: payload.spaceName,
          startTime: startTime,
          endTime: endTime,
        },
      });
    } catch (error) {
      const err = error as MailerError;
      this.throwErrorMailer(err.code);
    }
  }
  async sendBookingCanceled(payload: BookingCanceledPayloadDto) {
    try {
      const dto = Object.assign(new BookingCanceledPayloadDto(), payload);
      await validateOrReject(dto);
    } catch (error) {
      const details = this.formatValidationErrors(error as ValidationError[]);
      throw new MailException(MailErrorCode.INVALID_PAYLOAD, details);
    }
    try {
      const subject = `${SUBJECT_BOOKING_CANCELED} for ${payload.spaceName}`;
      const startTime = formatDateTime(payload.startTime);
      const endTime = formatDateTime(payload.endTime);
      await this.mailerService.sendMail({
        to: payload.to,
        subject: subject,
        template: 'booking-canceled',
        context: {
          name: payload.name,
          spaceName: payload.spaceName,
          startTime: startTime,
          endTime: endTime,
        },
      });
    } catch (error) {
      const err = error as MailerError;
      this.throwErrorMailer(err.code);
    }
  }
  private getSubject(type: MailType): string {
    switch (type) {
      case MAIL_TYPE.VERIFY_EMAIL:
        return SUBJECT_COFINRM_EMAIL;
      case MAIL_TYPE.FORGOT_PASWORD:
        return SUBJECT_FORGOT_PASSWORD;
    }
  }
  private getPath(type: MailType): string {
    switch (type) {
      case MAIL_TYPE.VERIFY_EMAIL:
        return '/users/verify-email';
      case MAIL_TYPE.FORGOT_PASWORD:
        return '/users/forgot-password';
    }
  }
  private getTempalte(type: MailType): string {
    switch (type) {
      case MAIL_TYPE.VERIFY_EMAIL:
        return 'verify-email';
      case MAIL_TYPE.FORGOT_PASWORD:
        return 'forgot-password';
    }
  }
  private throwErrorMailer(errorCode: string) {
    switch (errorCode) {
      case 'ENOENT':
        throw new MailException(MailErrorCode.TEMPLATE_ERROR);
      case 'ETIMEDOUT':
        throw new MailException(MailErrorCode.TIME_OUT);
      case 'EENVELOPE':
        throw new MailException(MailErrorCode.INVALID_RECIPIENT);
      default:
        throw new MailException(MailErrorCode.SERVER_ERROR);
    }
  }
  private formatValidationErrors(errors: ValidationError[]) {
    const result: { field: string; messages: unknown[] }[] = [];
    for (const err of errors) {
      const translatedMessages: unknown[] = [];
      for (const msg of Object.values(err.constraints || {})) {
        translatedMessages.push(this.i18nService.translate<string>(msg));
      }
      result.push({
        field: err.property,
        messages: translatedMessages,
      });
    }
    return result;
  }
  private async generateLinkViewBooking(
    bookingId: number,
    userId: number,
  ): Promise<string> {
    const payload: ViewBookingTokenPayload = {
      bookingId,
      userId,
    };
    try {
      const baseUrl = this.configService.get<string>('app.url');
      const token = await this.authService.generateViewBookingToken(payload);
      return `${baseUrl}/bookings/${bookingId}?token=${token}`;
    } catch (error) {
      this.loggerService.error(
        `Failed to generate view booking link (Booking ID: ${bookingId})`,
        (error as Error).stack,
      );
      return '';
    }
  }
}
