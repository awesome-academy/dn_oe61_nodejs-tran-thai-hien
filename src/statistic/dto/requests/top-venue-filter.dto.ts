import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDate, IsInt, IsOptional, Min } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';

export class TopVenueFilterDto {
  @ApiPropertyOptional({
    description: 'Maximum number of top venues to return',
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
    example: '2025-01-01',
    description: 'Start date filter (inclusive)',
    type: String,
    format: 'date',
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
    example: '2025-12-31',
    description: 'End date filter (inclusive)',
    type: String,
    format: 'date',
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
