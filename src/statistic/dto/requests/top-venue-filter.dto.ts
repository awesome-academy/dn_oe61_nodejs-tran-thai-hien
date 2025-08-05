import { Type } from 'class-transformer';
import { IsDate, IsInt, IsOptional, Min } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';
export class TopVenueFilterDto {
  @IsOptional()
  @Type(() => Number)
  @Min(1, {
    message: i18nValidationMessage('common.validation.min', {
      field: 'limit',
      min: '1',
    }),
  })
  @IsInt({
    message: i18nValidationMessage('common.validation.isInt', {
      field: 'limit',
    }),
  })
  limit = 5;
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
