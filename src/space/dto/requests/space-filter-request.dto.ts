import { ApiPropertyOptional } from '@nestjs/swagger';
import { SpacePriceUnit, SpaceType } from '@prisma/client';
import { Transform, Type } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Matches,
  Min,
} from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';
import { TIME_REGEX } from 'src/common/constants/regex.constant';
import { SortDirection } from 'src/common/enums/query.enum';

export class SpaceFilterRequestDto {
  @ApiPropertyOptional({
    description: 'Filter by space name',
    example: 'Meeting Room A',
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({
    description: 'Filter by city',
    example: 'New York',
  })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiPropertyOptional({
    description: 'Filter by street',
    example: 'Main Street',
  })
  @IsOptional()
  @IsString()
  street?: string;

  @ApiPropertyOptional({
    description: 'Filter by space types',
    enum: SpaceType,
    isArray: true,
    example: ['PRIVATE_OFFICE', 'MEETING_ROOM'],
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (value == null) return undefined;
    if (Array.isArray(value)) {
      return value.map((v) => String(v).toUpperCase().replace(/\s+/g, '_'));
    }
    return String(value).toUpperCase().replace(/\s+/g, '_');
  })
  @IsEnum(SpaceType, { each: true })
  type?: SpaceType[];

  @ApiPropertyOptional({
    description: 'Filter by price unit',
    enum: SpacePriceUnit,
    example: 'HOUR',
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (value == null) return undefined;
    return String(value).toUpperCase();
  })
  @IsEnum(SpacePriceUnit)
  priceUnit?: SpacePriceUnit;

  @ApiPropertyOptional({
    description: 'Minimum price filter',
    example: 0,
    minimum: 0,
  })
  @IsOptional()
  @Transform(({ value }) => (value != null ? Number(value) : undefined))
  @IsNumber()
  @Min(0, {
    message: i18nValidationMessage('common.validation.min', {
      field: 'minPrice',
      min: 0,
    }),
  })
  minPrice?: number;

  @ApiPropertyOptional({
    description: 'Maximum price filter',
    example: 1000000,
    minimum: 0,
  })
  @IsOptional()
  @Transform(({ value }) => (value != null ? Number(value) : undefined))
  @IsNumber()
  @Min(0, {
    message: i18nValidationMessage('common.validation.min', {
      field: 'maxPrice',
      min: 0,
    }),
  })
  maxPrice?: number;

  @ApiPropertyOptional({
    description: 'Start time filter in HH:mm format',
    example: '08:00',
    pattern: TIME_REGEX.source,
  })
  @IsOptional()
  @Matches(TIME_REGEX)
  startTime?: string;

  @ApiPropertyOptional({
    description: 'End time filter in HH:mm format',
    example: '19:00',
    pattern: TIME_REGEX.source,
  })
  @IsOptional()
  @Matches(TIME_REGEX)
  endTime?: string;

  @ApiPropertyOptional({
    description: 'Page number for pagination',
    example: 1,
    minimum: 1,
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
    minimum: 1,
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
    description: 'Sort field name',
    example: 'name',
  })
  @IsOptional()
  @IsString({
    message: i18nValidationMessage('common.validation.isString'),
  })
  sortBy?: string;

  @ApiPropertyOptional({
    description: 'Sort direction (asc or desc)',
    enum: SortDirection,
    example: SortDirection.ASC,
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
