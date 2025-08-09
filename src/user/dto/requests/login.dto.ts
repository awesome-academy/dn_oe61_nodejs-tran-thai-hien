import { IsNotEmpty, MinLength } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';
import { ApiProperty } from '@nestjs/swagger';
import { MIN_PASSWORD } from 'src/common/constants/auth.constant';

export class LoginDto {
  @ApiProperty({
    example: 'johndoe',
    description: 'Username used for login',
  })
  @IsNotEmpty({
    message: i18nValidationMessage(
      'common.auth.login.validation.userNameNotEmpty',
    ),
  })
  userName: string;
  @ApiProperty({
    example: 'StrongP@ssw0rd',
    description: `Password must be at least ${MIN_PASSWORD} characters`,
    minLength: MIN_PASSWORD,
  })
  @MinLength(MIN_PASSWORD, {
    message: i18nValidationMessage(
      'common.auth.login.validation.passwordMindLength',
    ),
  })
  password: string;
}
