import { ApiPropertyOptional } from '@nestjs/swagger';
import { PaymentMethod, PaymentStatus } from '@prisma/client';
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

export class PaymentFilterRequestDto {
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
    description: 'Filter payments from this start date',
    type: String,
    format: 'date-time',
    example: '2025-01-01',
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
    description: 'Filter payments up to this end date',
    type: String,
    format: 'date-time',
    example: '2025-12-31',
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
    description: 'Filter payment by method',
    enum: PaymentMethod,
    isArray: true,
    example: ['BANK TRANSFER', 'CREDIT CARD'],
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
  @IsEnum(PaymentMethod, {
    each: true,
    message: i18nValidationMessage('common.validation.isEnum', {
      field: 'status',
    }),
  })
  methods?: PaymentMethod[];
  @ApiPropertyOptional({
    description: 'Filter payments by statuses',
    enum: PaymentStatus,
    isArray: true,
    example: ['PENDING', 'PAID'],
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
  @IsEnum(PaymentStatus, {
    each: true,
    message: i18nValidationMessage('common.validation.isEnum', {
      field: 'status',
    }),
  })
  statuses?: PaymentStatus[];
  @ApiPropertyOptional({
    description: 'Page number for pagination',
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
    description: 'Number of items per page',
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
    description: 'Field to sort by',
    example: 'createdAt',
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
    default: SortDirection.DESC,
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
