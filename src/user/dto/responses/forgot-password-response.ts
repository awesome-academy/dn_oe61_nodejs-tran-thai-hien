import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  SEND_MAIL_STATUS,
  SendMailStatus,
} from 'src/user/constant/email.constant';
import { UserSummaryDto } from './user-summary.dto';

export class ForgotPasswordResponse {
  @ApiPropertyOptional({
    enum: SEND_MAIL_STATUS,
    description: 'Status of the password reset email sending process',
    example: SEND_MAIL_STATUS.SENT,
  })
  sendMailStatus?: SendMailStatus;
  @ApiPropertyOptional({
    type: () => UserSummaryDto,
    description: 'Basic information of the user requesting the password reset',
  })
  user?: UserSummaryDto;
}
