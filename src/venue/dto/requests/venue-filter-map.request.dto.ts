import { Transform, Type } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { i18nValidationMessage } from 'nestjs-i18n';
import { SortDirection } from 'src/common/enums/query.enum';

export class VenueMapFilterDto {
  @ApiProperty({
    description: 'Latitude of the location (-90 to 90)',
    example: 10.762622,
  })
  @Type(() => Number)
  @IsNumber(
    { allowNaN: false },
    {
      message: i18nValidationMessage('common.validation.isNumber', {
        field: 'latitude',
      }),
    },
  )
  @Min(-90, {
    message: i18nValidationMessage('common.validation.min', {
      field: 'latitude',
      min: -90,
    }),
  })
  @Max(90, {
    message: i18nValidationMessage('common.validation.max', {
      field: 'latitude',
      max: 90,
    }),
  })
  latitude: number;

  @ApiProperty({
    description: 'Longitude of the location (-180 to 180)',
    example: 106.660172,
  })
  @Type(() => Number)
  @IsNumber(
    { allowNaN: false },
    {
      message: i18nValidationMessage('common.validation.isNumber', {
        field: 'longitude',
      }),
    },
  )
  @Min(-180, {
    message: i18nValidationMessage('common.validation.min', {
      field: 'longitude',
      min: -180,
    }),
  })
  @Max(180, {
    message: i18nValidationMessage('common.validation.max', {
      field: 'longitude',
      max: 180,
    }),
  })
  longitude: number;

  @ApiPropertyOptional({
    description: 'Maximum distance from the given location (in kilometers)',
    example: 5,
  })
  @IsOptional()
  @Type(() => Number)
  @Min(1, {
    message: i18nValidationMessage('common.validation.min', {
      field: 'maxDistance',
    }),
  })
  @IsNumber(
    {},
    {
      message: i18nValidationMessage('common.validation.isNumber', {
        field: 'maxDistance',
      }),
    },
  )
  maxDistance?: number;

  @ApiPropertyOptional({
    description: 'Page number (starts from 1)',
    example: 1,
    default: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({
    message: i18nValidationMessage('common.validation.isInt'),
  })
  @Min(0, {
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
    description: 'Field name to sort by',
    example: 'name',
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
