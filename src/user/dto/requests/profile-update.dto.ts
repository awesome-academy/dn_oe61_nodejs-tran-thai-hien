import { IsOptional, IsString, Matches } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';

export class ProfileUpdateRequestDto {
  @IsOptional()
  @IsString({
    message: i18nValidationMessage('common.validation.isString', {
      constraint: 'name',
    }),
  })
  name?: string;
  @IsOptional()
  @IsString({
    message: i18nValidationMessage('common.validation.isString', {
      constraint: 'address',
    }),
  })
  address?: string;
  @IsOptional()
  @Matches(/^(0?)(3[2-9]|5[6|8|9]|7[0|6-9]|8[1-9]|9[0-9])[0-9]{7}$/, {
    message: i18nValidationMessage('auth.signup.validation.invalidFormatPhone'),
  })
  phone?: string;
  @IsOptional()
  @IsString({
    message: i18nValidationMessage('common.validation.isString', {
      field: 'bio',
    }),
  })
  bio?: string;
  @IsOptional()
  avatar?: string;
}
