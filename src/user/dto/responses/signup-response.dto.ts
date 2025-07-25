// export class SignupResponseDto {
//   id: number;
//   name: string;
//   email: string;
//   userName: string;
//   status: string;
//   isVerified: boolean;
//   messageSendMail: string;

import { SendMailStatus } from 'src/user/constant/email.constant';
import { UserSummaryDto } from './user-summary.dto';
import { RegisterType } from 'src/user/constant/register.constant';
// }
export class SignupResponseDto {
  type: RegisterType;
  sendMailStatus?: SendMailStatus;
  expiresAt?: string;
  verficationLink?: string;
  user?: UserSummaryDto;
}
