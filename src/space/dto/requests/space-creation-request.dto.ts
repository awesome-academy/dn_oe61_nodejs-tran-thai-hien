import { SpaceType } from '@prisma/client';
import { Transform, Type } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Matches,
  Min,
  ValidateNested,
} from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';
import { PriceDto } from './price-dto';

export class SpaceCreationRequestDto {
  @IsInt({
    message: i18nValidationMessage('common.validation.isInt', {
      field: 'VenueId',
    }),
  })
  venueId: number;
  @IsString({
    message: i18nValidationMessage('common.validation.isString', {
      field: 'name',
    }),
  })
  name: string;
  @Transform(({ value }) => {
    if (value == null) return undefined;
    return String(value).toUpperCase().replace(/\s+/g, '_');
  })
  @IsEnum(SpaceType, {
    message: i18nValidationMessage('common.validation.isEnum', {
      field: 'type',
    }),
  })
  type: string;
  @IsInt({
    message: i18nValidationMessage('common.validation.isInt', {
      field: 'capacity',
    }),
  })
  capacity: number;
  @IsOptional()
  @IsString({
    message: i18nValidationMessage('common.validation.isString', {
      field: 'description',
    }),
  })
  description: string;
  @IsArray()
  @ValidateNested({
    each: true,
  })
  @Type(() => PriceDto)
  prices: PriceDto[];
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, {
    message: i18nValidationMessage('common.validation.formatHourInvalid', {
      field: 'openHour',
    }),
  })
  openHour: string;
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, {
    message: i18nValidationMessage('common.validation.formatHourInvalid', {
      field: 'closeHour',
    }),
  })
  closeHour: string;
  @IsOptional()
  @IsArray()
  @IsInt({
    each: true,
    message: i18nValidationMessage('common.validation.ids.isInt'),
  })
  @Min(1, {
    each: true,
    message: i18nValidationMessage('common.validation.ids.min'),
  })
  amenities?: number[];
  @IsOptional()
  @IsArray()
  @IsInt({
    each: true,
    message: i18nValidationMessage('common.validation.ids.isInt'),
  })
  @Min(1, {
    each: true,
    message: i18nValidationMessage('common.validation.ids.min'),
  })
  managers?: number[];
}
