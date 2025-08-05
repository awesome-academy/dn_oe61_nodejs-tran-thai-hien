import { ApiProperty } from '@nestjs/swagger';
import {
  VERIFY_USER_STATUS,
  VerifyUserStatus,
} from 'src/user/constant/verify-email.constant';
import { UserSummaryDto } from './user-summary.dto';

export class VerifyUserResponseDto {
  @ApiProperty({
    enum: VERIFY_USER_STATUS,
    description: 'Trạng thái xác minh của người dùng',
    example: VERIFY_USER_STATUS.SUCCESS,
  })
  verifyStatus: VerifyUserStatus;
  @ApiProperty()
  user?: UserSummaryDto;
}
