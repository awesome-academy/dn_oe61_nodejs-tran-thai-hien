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
import { i18nValidationMessage } from 'nestjs-i18n';
import { SortDirection } from 'src/common/enums/query.enum';
export class VenueMapFilterDto {
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
  @IsOptional()
  @Type(() => Number)
  @IsInt({
    message: i18nValidationMessage('common.validation.isInt'),
  })
  @Min(0, {
    message: i18nValidationMessage('common.validation.min'),
  })
  page: number = 1;
  @IsOptional()
  @Type(() => Number)
  @IsInt({
    message: i18nValidationMessage('common.validation.isInt'),
  })
  @Min(1, {
    message: i18nValidationMessage('common.validation.min'),
  })
  pageSize: number = 10;
  @IsOptional()
  @IsString({
    message: i18nValidationMessage('common.validation.isString'),
  })
  sortBy?: string;
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
