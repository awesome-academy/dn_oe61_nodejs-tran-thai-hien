import { Transform, Type } from 'class-transformer';
import {
  IsDate,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';
import { SortDirection } from 'src/common/enums/query.enum';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { BookingStatus } from '@prisma/client';

export class BookingFilterRequestDto {
  @ApiPropertyOptional({
    description: 'Filter by space name',
    example: 'Conference Room A',
  })
  @IsOptional()
  @IsString({
    message: i18nValidationMessage('common.validation.isString', {
      field: 'spaceName',
    }),
  })
  spaceName?: string;

  @ApiPropertyOptional({
    description: 'Filter bookings starting from this date',
    example: '2025-08-01',
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
    description: 'Filter bookings ending before this date',
    example: '2025-08-31',
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
  @ApiPropertyOptional({
    description: 'Filter bookings by statuses',
    enum: BookingStatus,
    isArray: true,
    example: ['PENDING', 'CONFIRMED'],
    type: String,
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (value == null) return undefined;
    if (Array.isArray(value)) {
      return value.map((v) => String(v).toUpperCase().replace(/\s+/g, '_'));
    }
    return String(value).toUpperCase().replace(/\s+/g, '_');
  })
  @IsEnum(BookingStatus, {
    each: true,
    message: i18nValidationMessage('common.validation.isEnum', {
      field: 'status',
    }),
  })
  statuses?: BookingStatus[];
  @ApiPropertyOptional({
    description: 'Page number for pagination (min 1)',
    example: 1,
    default: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({
    message: i18nValidationMessage('common.validation.isInt'),
  })
  @Min(1, {
    message: i18nValidationMessage('common.validation.min'),
  })
  page: number = 1;

  @ApiPropertyOptional({
    description: 'Number of items per page (min 1)',
    example: 10,
    default: 10,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({
    message: i18nValidationMessage('common.validation.isInt'),
  })
  @Min(1, {
    message: i18nValidationMessage('common.validation.min'),
  })
  pageSize: number = 10;

  @ApiPropertyOptional({
    description: 'Field name to sort by',
    example: 'startTime',
  })
  @IsOptional()
  @IsString({
    message: i18nValidationMessage('common.validation.isString'),
  })
  sortBy?: string;

  @ApiPropertyOptional({
    description: 'Sort direction',
    enum: SortDirection,
    example: SortDirection.ASC,
    default: SortDirection.ASC,
  })
  @IsOptional()
  @Transform(({ value }): string | undefined =>
    typeof value === 'string' ? value.toLowerCase() : undefined,
  )
  @IsEnum(SortDirection, {
    message: i18nValidationMessage('common.validation.isEnum', {
      field: 'direction',
    }),
  })
  direction: SortDirection = SortDirection.ASC;
}
