// export class SignupResponseDto {
//   id: number;
//   name: string;
//   email: string;
//   userName: string;
//   status: string;
//   isVerified: boolean;
//   messageSendMail: string;

import {
  SEND_MAIL_STATUS,
  SendMailStatus,
} from 'src/user/constant/email.constant';
import { UserSummaryDto } from './user-summary.dto';
import {
  REGISTER_TYPE,
  RegisterType,
} from 'src/user/constant/register.constant';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
export class SignupResponseDto {
  @ApiProperty({ enum: REGISTER_TYPE })
  type: RegisterType;
  @ApiProperty({ enum: SEND_MAIL_STATUS })
  sendMailStatus?: SendMailStatus;
  @ApiPropertyOptional({ example: '2025-08-10T12:00:00Z' })
  expiresAt?: string;
  @ApiPropertyOptional({ example: 'https://29spacing.com/verify/z12412a' })
  verificationLink?: string;
  @ApiPropertyOptional({
    type: () => UserSummaryDto,
    description: 'User information summary',
  })
  user?: UserSummaryDto;
}
