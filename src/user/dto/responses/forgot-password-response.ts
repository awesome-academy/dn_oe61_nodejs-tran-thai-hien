import { SendMailStatus } from 'src/user/constant/email.constant';
import { UserSummaryDto } from './user-summary.dto';
// }
export class ForgotPasswordResponse {
  sendMailStatus?: SendMailStatus;
  user?: UserSummaryDto;
}
