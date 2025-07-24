import { VerifyEmailStatus } from 'src/user/constant/verify-email.constant';
import { UserSummaryDto } from './user-summary.dto';

export class VerifyEmailResponseDto {
  verifyStatus: VerifyEmailStatus;
  user?: UserSummaryDto;
}
