import { Type } from 'class-transformer';
import { IsDate, IsOptional } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';
export class StatisticUserFilterDto {
  @IsOptional()
  @Type(() => Date)
  @IsDate({
    message: i18nValidationMessage('common.validation.isDate', {
      field: 'startDate',
    }),
  })
  startDate?: Date;
  @IsOptional()
  @Type(() => Date)
  @IsDate({
    message: i18nValidationMessage('common.validation.isDate', {
      field: 'endDate',
    }),
  })
  endDate?: Date;
}
