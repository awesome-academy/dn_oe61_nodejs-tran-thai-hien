import { IsNotEmpty, MinLength } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';
import { MIN_PASSWORD } from 'src/common/constants/auth.constant';

export class LoginDto {
  @IsNotEmpty({
    message: i18nValidationMessage(
      'common.auth.login.validation.userNameNotEmpty',
    ),
  })
  userName: string;
  @MinLength(MIN_PASSWORD, {
    message: i18nValidationMessage(
      'common.auth.login.validation.passwordMindLength',
    ),
  })
  password: string;
}
