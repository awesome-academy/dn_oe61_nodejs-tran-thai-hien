import { Type } from 'class-transformer';
import { IsDate, IsInt, IsOptional } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';

export class StatisticBookingFilterDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt({
    message: i18nValidationMessage('common.validation.isInt', {
      field: 'venueId',
    }),
  })
  venueId: number;
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
