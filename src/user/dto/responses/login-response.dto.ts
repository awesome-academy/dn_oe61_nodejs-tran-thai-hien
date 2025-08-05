import { ApiProperty } from '@nestjs/swagger';

export class LoginResponseDto {
  @ApiProperty({ example: 1, description: 'Unique identifier of the user' })
  id: number;
  @ApiProperty({ example: 'John Doe', description: 'Full name of the user' })
  name: string;
  @ApiProperty({ example: 'johndoe', description: 'Username used for login' })
  userName: string;
  @ApiProperty({
    example: 'john@example.com',
    description: 'Email address of the user',
  })
  email: string;
  @ApiProperty({
    example: 'admin',
    description: 'Role assigned to the user (user, admin, moderators,..)',
  })
  role: string;

  @ApiProperty({
    example: true,
    description: 'Whether the user has verified their email',
  })
  isVerified: boolean;

  @ApiProperty({
    example: 'ACTIVE',
    description: 'Current status of the user (e.g., ACTIVE, INACTIVE)',
  })
  status: string;

  @ApiProperty({
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    description: 'JWT access token',
  })
  accessToken: string;
}
