import { Type } from 'class-transformer';
import { IsDate, IsInt, IsOptional } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class StatisticBookingFilterDto {
  @ApiPropertyOptional({
    description: 'ID of the venue',
    example: 1,
    type: Number,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({
    message: i18nValidationMessage('common.validation.isInt', {
      field: 'venueId',
    }),
  })
  venueId: number;

  @ApiPropertyOptional({
    description: 'Start date for filtering statistics',
    example: '2025-08-01T00:00:00.000Z',
    type: String,
    format: 'date-time',
  })
  @IsOptional()
  @Type(() => Date)
  @IsDate({
    message: i18nValidationMessage('common.validation.isDate', {
      field: 'startDate',
    }),
  })
  startDate?: Date;

  @ApiPropertyOptional({
    description: 'End date for filtering statistics',
    example: '2025-08-31T23:59:59.999Z',
    type: String,
    format: 'date-time',
  })
  @IsOptional()
  @Type(() => Date)
  @IsDate({
    message: i18nValidationMessage('common.validation.isDate', {
      field: 'endDate',
    }),
  })
  endDate?: Date;
}
