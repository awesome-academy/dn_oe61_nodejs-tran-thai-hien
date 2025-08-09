import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString, Min } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';
import { SortDirection } from '../enums/query.enum';

export class QueryParamDto {
  @ApiPropertyOptional({
    description: 'Search keyword to filter results',
    example: 'Sunrise',
  })
  @IsOptional()
  @IsString({
    message: i18nValidationMessage('common.validation.isString', {
      field: 'search',
    }),
  })
  search?: string;

  @ApiPropertyOptional({
    description: 'Page number (starts from 1)',
    example: 1,
    minimum: 1,
    default: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({
    message: i18nValidationMessage('common.validation.isInt', {
      field: 'page',
    }),
  })
  @Min(1, {
    message: i18nValidationMessage('common.validation.min'),
  })
  page: number = 1;

  @ApiPropertyOptional({
    description: 'Number of items per page',
    example: 10,
    minimum: 1,
    default: 10,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({
    message: i18nValidationMessage('common.validation.isInt', {
      field: 'pageSize',
    }),
  })
  @Min(1, {
    message: i18nValidationMessage('common.validation.min'),
  })
  pageSize: number = 10;

  @ApiPropertyOptional({
    description: 'Field name to sort by',
    example: 'name',
  })
  @IsOptional()
  @IsString({
    message: i18nValidationMessage('common.validation.isString'),
  })
  sortBy?: string;

  @ApiPropertyOptional({
    description: 'Sort direction (ASC or DESC)',
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
