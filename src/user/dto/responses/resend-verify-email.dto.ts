import { SendMailStatus } from 'src/user/constant/email.constant';

export class ResendVerifyEmailResponseDto {
  sendMailStatus: SendMailStatus;
  expiresAt: string | null;
}
