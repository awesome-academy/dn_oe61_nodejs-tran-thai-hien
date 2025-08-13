import { ApiPropertyOptional } from '@nestjs/swagger';
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

export class SpaceUpdateRequestDto {
  @ApiPropertyOptional({
    description: 'Name of the space',
    example: 'Meeting Room A',
  })
  @IsOptional()
  @IsString({
    message: i18nValidationMessage('common.validation.isString', {
      field: 'name',
    }),
  })
  name: string;

  @ApiPropertyOptional({
    description: 'Type of the space',
    example: 'PRIVATE_OFFICE',
    enum: SpaceType,
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (value == null) return undefined;
    return String(value).toUpperCase().replace(/\s+/g, '_');
  })
  @IsEnum(SpaceType, {
    message: i18nValidationMessage('common.validation.isEnum', {
      field: 'type',
    }),
  })
  type?: SpaceType;

  @ApiPropertyOptional({
    description: 'Capacity of the space',
    example: 20,
  })
  @IsOptional()
  @IsInt({
    message: i18nValidationMessage('common.validation.isInt', {
      field: 'capacity',
    }),
  })
  capacity: number;

  @ApiPropertyOptional({
    description: 'Description of the space',
    example: 'Spacious room with projector',
    nullable: true,
  })
  @IsOptional()
  @IsString({
    message: i18nValidationMessage('common.validation.isString', {
      field: 'description',
    }),
  })
  description?: string | null;

  @ApiPropertyOptional({
    description: 'List of prices for the space',
    type: [PriceDto],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({
    each: true,
  })
  @Type(() => PriceDto)
  prices?: PriceDto[];

  @ApiPropertyOptional({
    description: 'Opening hour in format HH:mm',
    example: '08:00',
  })
  @IsOptional()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, {
    message: i18nValidationMessage('common.validation.formatHourInvalid', {
      field: 'openHour',
    }),
  })
  openHour: string;

  @ApiPropertyOptional({
    description: 'Closing hour in format HH:mm',
    example: '19:00',
  })
  @IsOptional()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, {
    message: i18nValidationMessage('common.validation.formatHourInvalid', {
      field: 'closeHour',
    }),
  })
  closeHour: string;

  @ApiPropertyOptional({
    description: 'List of amenity IDs',
    type: [Number],
    example: [1],
  })
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

  @ApiPropertyOptional({
    description: 'List of manager user IDs',
    type: [Number],
    example: [101],
  })
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
