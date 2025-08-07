import { Type } from 'class-transformer';
import { IsInt, IsOptional, Min } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';

export class ChatQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt({
    message: i18nValidationMessage('common.validation.isInt', {
      field: 'page',
    }),
  })
  @Min(0, {
    message: i18nValidationMessage('common.validation.min', {
      field: 'page',
    }),
  })
  page: number = 1;
  @IsOptional()
  @Type(() => Number)
  @IsInt({
    message: i18nValidationMessage('common.validation.isInt', {
      field: 'pageSize',
    }),
  })
  @Min(0, {
    message: i18nValidationMessage('common.validation.min', {
      field: 'pageSize',
    }),
  })
  pageSize: number = 20;
}
