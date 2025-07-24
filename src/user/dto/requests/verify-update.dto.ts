import { Type } from 'class-transformer';
import { IsBoolean } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';

export class VerifyUpdateRequestDto {
  @IsBoolean({
    message: i18nValidationMessage('common.validation.isBoolean'),
  })
  @Type(() => Boolean)
  isVerify: boolean;
}
