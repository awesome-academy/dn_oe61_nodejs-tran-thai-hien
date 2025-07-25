import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MinLength,
} from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';
import { MIN_PASSWORD } from 'src/common/constants/auth.constant';
export class SignupDto {
  @IsNotEmpty({
    message: i18nValidationMessage(
      'common.auth.signup.validation.nameNotEmpty',
    ),
  })
  name: string;
  @IsEmail()
  email: string;
  @IsNotEmpty({
    message: i18nValidationMessage(
      'common.auth.signup.validation.userNameNotEmpty',
    ),
  })
  userName: string;
  @MinLength(MIN_PASSWORD, {
    message: i18nValidationMessage(
      'common.auth.signup.validation.passwordMindLength',
    ),
  })
  password: string;
  @IsOptional()
  @IsString()
  bio?: string;
  @IsOptional()
  @IsString()
  address?: string;
  @IsOptional()
  @Matches(/^(0?)(3[2-9]|5[6|8|9]|7[0|6-9]|8[1-9]|9[0-9])[0-9]{7}$/, {
    message: i18nValidationMessage(
      'common.auth.signup.validation.invalidFormatPhone',
    ),
  })
  phone?: string;
}
