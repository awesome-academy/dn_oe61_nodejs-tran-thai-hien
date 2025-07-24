import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';
import { MIN_PASSWORD } from 'src/common/constants/auth.constant';
export class SignupDto {
  @IsNotEmpty({
    message: i18nValidationMessage('auth.signup.validation.nameNotEmpty'),
  })
  name: string;
  @IsEmail()
  email: string;
  @IsNotEmpty({
    message: i18nValidationMessage('auth.signup.validation.userNameNotEmpty'),
  })
  userName: string;
  @MinLength(MIN_PASSWORD, {
    message: i18nValidationMessage('auth.signup.validation.passwordMindLength'),
  })
  password: string;
}
