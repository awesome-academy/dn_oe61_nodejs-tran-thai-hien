import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { validateOrReject, ValidationError } from 'class-validator';
import { I18nService } from 'nestjs-i18n';
import { MailErrorCode } from './constants/mail-error.constant';
import { MAIL_TYPE, MailType } from './constants/mail-type.constant';
import {
  SUBJECT_COFINRM_EMAIL,
  SUBJECT_FORGOT_PASSWORD,
} from './constants/subject-email.constant';
import { MailPayloadDto } from './dto/mail-payload.dto';
import { MailException } from './exceptions/mail.exception';
import { MailerError } from './interfaces/mailer-error.interface';

@Injectable()
export class MailService {
  constructor(
    private readonly mailerService: MailerService,
    private readonly configService: ConfigService,
    private readonly i18nService: I18nService,
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
}
