import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UserProfileResponse {
  @ApiProperty({ example: 1, description: 'Unique identifier of the user' })
  id: number;

  @ApiProperty({ example: 'John Doe', description: 'Full name of the user' })
  name: string;

  @ApiProperty({
    example: 'john@example.com',
    description: 'Email address of the user',
  })
  email: string;

  @ApiPropertyOptional({
    example: 'https://example.com/avatar.jpg',
    description: 'Profile picture URL of the user',
    nullable: true,
  })
  avatar?: string | null;

  @ApiPropertyOptional({
    example: 'Software developer at XYZ Company',
    description: 'Short biography of the user',
    nullable: true,
  })
  bio?: string | null;

  @ApiPropertyOptional({
    example: '0769609446',
    description: 'Phone number of the user',
    nullable: true,
  })
  phone?: string | null;

  @ApiPropertyOptional({
    example: '123 Main Street, New York, NY',
    description: 'Physical address of the user',
    nullable: true,
  })
  address?: string | null;
}
