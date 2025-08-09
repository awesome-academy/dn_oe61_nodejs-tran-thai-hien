import { Type } from 'class-transformer';
import { IsDate, IsInt, IsOptional, Min } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class TopBookingUserFilterDto {
  @ApiPropertyOptional({
    description: 'Maximum number of top users to return',
    example: 5,
    minimum: 1,
    type: Number,
    default: 5,
  })
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

  @ApiPropertyOptional({
    description: 'Start date for filtering booking data',
    example: '2025-01-01T00:00:00.000Z',
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
    description: 'End date for filtering booking data',
    example: '2025-12-31T23:59:59.999Z',
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
