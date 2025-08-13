import { IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { i18nValidationMessage } from 'nestjs-i18n';
import { MIN_PASSWORD } from 'src/common/constants/auth.constant';

export class ResetPasswordDto {
  @ApiProperty({
    description: 'Token sent via email to verify password reset request',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  @IsString({ message: 'Invalid token format' })
  token: string;
  @ApiProperty({
    description: `New password (minimum ${MIN_PASSWORD} characters)`,
    example: 'StrongPassword123!',
    minLength: MIN_PASSWORD,
  })
  @MinLength(MIN_PASSWORD, {
    message: i18nValidationMessage(
      'common.auth.login.validation.passwordMindLength',
    ),
  })
  newPassword: string;
}
