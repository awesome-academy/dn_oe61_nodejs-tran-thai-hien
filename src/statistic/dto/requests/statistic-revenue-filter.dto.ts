import { Type } from 'class-transformer';
import { IsDate, IsInt, IsOptional } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class StatisticRevenueFilterDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt({
    message: i18nValidationMessage('common.validation.isInt', {
      field: 'venueId',
    }),
  })
  @ApiPropertyOptional({
    description: 'Venue ID to filter revenue statistics',
    example: 1,
    type: Number,
  })
  venueId: number;

  @IsOptional()
  @Type(() => Date)
  @IsDate({
    message: i18nValidationMessage('common.validation.isDate', {
      field: 'startDate',
    }),
  })
  @ApiPropertyOptional({
    description: 'Start date of the revenue statistic range',
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
    description: 'End date of the revenue statistic range',
    example: '2025-08-31T23:59:59.999Z',
    type: String,
    format: 'date-time',
  })
  endDate?: Date;
}
