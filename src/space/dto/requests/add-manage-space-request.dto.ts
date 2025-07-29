import { IsArray, IsInt, IsNotEmpty, Min } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';

export class AddManageSpaceRequestDto {
  @IsArray()
  @IsNotEmpty()
  @IsInt({
    each: true,
    message: i18nValidationMessage('common.validation.ids.isInt'),
  })
  @Min(1, {
    each: true,
    message: i18nValidationMessage('common.validation.ids.min'),
  })
  userIds: number[];
}
