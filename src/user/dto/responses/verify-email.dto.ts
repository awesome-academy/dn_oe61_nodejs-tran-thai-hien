import { VerifyUserStatus } from 'src/user/constant/verify-email.constant';
import { UserSummaryDto } from './user-summary.dto';

export class VerifyUserResponseDto {
  verifyStatus: VerifyUserStatus;
  user?: UserSummaryDto;
}
