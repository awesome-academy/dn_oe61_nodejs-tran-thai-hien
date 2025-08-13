import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
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
  @ApiProperty({
    example: 4,
    description: 'Venue ID',
  })
  @IsInt({
    message: i18nValidationMessage('common.validation.isInt', {
      field: 'VenueId',
    }),
  })
  venueId: number;

  @ApiProperty({
    example: 'Meeting Room A',
    description: 'Name of the space',
  })
  @IsString({
    message: i18nValidationMessage('common.validation.isString', {
      field: 'name',
    }),
  })
  name: string;

  @ApiProperty({
    example: 'PRIVATE OFFICE',
    description: 'Type of the space',
    enum: SpaceType,
  })
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

  @ApiProperty({
    example: 20,
    description: 'Capacity of the space',
  })
  @IsInt({
    message: i18nValidationMessage('common.validation.isInt', {
      field: 'capacity',
    }),
  })
  capacity: number;

  @ApiPropertyOptional({
    example: 'Spacious meeting room with modern equipment',
    description: 'Description of the space',
  })
  @IsOptional()
  @IsString({
    message: i18nValidationMessage('common.validation.isString', {
      field: 'description',
    }),
  })
  description: string;

  @ApiProperty({
    type: [PriceDto],
    description: 'List of prices for the space',
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PriceDto)
  prices: PriceDto[];

  @ApiProperty({
    example: '08:00',
    description: 'Opening hour in HH:mm format',
    pattern: '^([01]\\d|2[0-3]):([0-5]\\d)$',
  })
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, {
    message: i18nValidationMessage('common.validation.formatHourInvalid', {
      field: 'openHour',
    }),
  })
  openHour: string;

  @ApiProperty({
    example: '19:00',
    description: 'Closing hour in HH:mm format',
    pattern: '^([01]\\d|2[0-3]):([0-5]\\d)$',
  })
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, {
    message: i18nValidationMessage('common.validation.formatHourInvalid', {
      field: 'closeHour',
    }),
  })
  closeHour: string;

  @ApiPropertyOptional({
    type: [Number],
    example: [1, 2, 3],
    description: 'List of amenity IDs',
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
    type: [Number],
    example: [101, 102],
    description: 'List of manager IDs for the space',
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
