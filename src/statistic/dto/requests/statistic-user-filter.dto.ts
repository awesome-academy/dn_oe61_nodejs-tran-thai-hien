import { Type } from 'class-transformer';
import { IsDate, IsOptional } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class StatisticUserFilterDto {
  @IsOptional()
  @Type(() => Date)
  @IsDate({
    message: i18nValidationMessage('common.validation.isDate', {
      field: 'startDate',
    }),
  })
  @ApiPropertyOptional({
    description: 'Start date for filtering users',
    example: '2025-08-01T00:00:00.000Z',
    type: String,
    format: 'date-time',
  })
  startDate?: Date;

  @IsOptional()
  @Type(() => Date)
  @IsDate({
    message: i18nValidationMessage('common.validation.isDate', {
      field: 'endDate',
    }),
  })
  @ApiPropertyOptional({
    description: 'End date for filtering users',
    example: '2025-08-31T23:59:59.999Z',
    type: String,
    format: 'date-time',
  })
  endDate?: Date;
}
