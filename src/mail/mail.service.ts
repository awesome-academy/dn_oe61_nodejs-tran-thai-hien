import { MailerService } from '@nestjs-modules/mailer';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SUBJECT_COFINRM_EMAIL } from './constants/subject-email.constant';
import { VerifyEmailPayload } from './interfaces/verify-email-payload.interface';

@Injectable()
export class MailService {
  constructor(
    private readonly mailerService: MailerService,
    private readonly configService: ConfigService,
  ) {}
  async sendVerifyEmail(to: string, payload: VerifyEmailPayload) {
    const appUrl = this.configService.get<string>('app.url');
    const appName = this.configService.get<string>('app.name');
    const verificationLink = `${appUrl}/users/verify-email?token=${payload.token}`;
    try {
      await this.mailerService.sendMail({
        to: to,
        subject: SUBJECT_COFINRM_EMAIL,
        template: 'verify-email',
        context: {
          appName: appName,
          userName: payload.recipientUserName,
          name: payload.recipientName ?? 'GUEST',
          verificationLink: verificationLink,
          expiresAt: payload.expiresAt,
        },
      });
    } catch (error) {
      console.error('Failed to send verification email', error);
      throw new InternalServerErrorException(
        'Unable to send verification email',
      );
    }
  }
}
