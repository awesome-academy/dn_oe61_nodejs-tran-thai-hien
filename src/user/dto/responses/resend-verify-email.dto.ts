import { ApiProperty } from '@nestjs/swagger';
import {
  SEND_MAIL_STATUS,
  SendMailStatus,
} from 'src/user/constant/email.constant';

export class ResendVerifyEmailResponseDto {
  @ApiProperty({
    enum: SEND_MAIL_STATUS,
    description: 'Kết quả gửi email xác thực',
    example: SEND_MAIL_STATUS.SENT,
  })
  sendMailStatus: SendMailStatus;
  @ApiProperty({
    example: '2025-08-08T10:00:00.000Z',
  })
  expiresAt: string | null;
}
