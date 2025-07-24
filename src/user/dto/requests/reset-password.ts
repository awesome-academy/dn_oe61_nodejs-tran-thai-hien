import { IsString, MinLength } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';
import { MIN_PASSWORD } from 'src/common/constants/auth.constant';

export class ResetPasswordDto {
  @IsString({ message: 'aloalao' })
  token: string;
  @MinLength(MIN_PASSWORD, {
    message: i18nValidationMessage(
      'common.auth.login.validation.passwordMindLength',
    ),
  })
  newPassword: string;
}
