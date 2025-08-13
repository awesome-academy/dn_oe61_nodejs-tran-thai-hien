import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';

export class VenueCreationRequestDto {
  @ApiProperty({
    description: 'Name of the venue',
    example: 'Sunshine Coworking Space',
  })
  @IsString({
    message: i18nValidationMessage('common.validation.isString', {
      field: 'name',
    }),
  })
  name: string;

  @ApiProperty({
    description: 'Street address of the venue',
    example: '123 Main St',
  })
  @IsString({
    message: i18nValidationMessage('common.validation.isString', {
      field: 'street',
    }),
  })
  street: string;

  @ApiProperty({
    description: 'City where the venue is located',
    example: 'Ho Chi Minh City',
  })
  @IsString({
    message: i18nValidationMessage('common.validation.isString', {
      field: 'city',
    }),
  })
  city: string;

  @ApiProperty({
    description: 'Latitude of the venue (between -90 and 90)',
    example: 10.762622,
    minimum: -90,
    maximum: 90,
  })
  @IsNumber(
    {},
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
    description: 'Longitude of the venue (between -180 and 180)',
    example: 106.660172,
    minimum: -180,
    maximum: 180,
  })
  @IsNumber(
    {},
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
    description: 'List of amenity IDs associated with the venue',
    type: [Number],
    example: [1, 2, 5],
  })
  @IsOptional()
  amenities?: number[];
}
