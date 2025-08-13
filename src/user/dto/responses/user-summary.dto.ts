import { ApiProperty } from '@nestjs/swagger';

export class UserSummaryDto {
  @ApiProperty({ example: 1, description: 'Unique ID of the user' })
  id: number;
  @ApiProperty({ example: 'Tran A', description: 'Full name of the user' })
  name: string;
  @ApiProperty({ example: 'tran@example.com', description: 'Email address' })
  email: string;
  @ApiProperty({ example: 'trana', description: 'Username of the user' })
  userName: string;
  @ApiProperty({ example: 'ACTIVE', description: 'Account status' })
  status: string;
  @ApiProperty({ example: true, description: 'Indicates if email is verified' })
  isVerified: boolean;
}
