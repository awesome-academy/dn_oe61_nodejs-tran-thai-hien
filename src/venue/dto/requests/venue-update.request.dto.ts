import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';

export class VenueUpdateRequestDto {
  @ApiPropertyOptional({
    description: 'Name of the venue',
    example: 'Sunrise Event Hall',
  })
  @IsOptional()
  @IsString({
    message: i18nValidationMessage('common.validation.isString', {
      field: 'name',
    }),
  })
  name: string;

  @ApiPropertyOptional({
    description: 'Street address of the venue',
    example: '123 Main St',
  })
  @IsOptional()
  @IsString({
    message: i18nValidationMessage('common.validation.isString', {
      field: 'street',
    }),
  })
  street: string;

  @ApiPropertyOptional({
    description: 'City where the venue is located',
    example: 'Ho Chi Minh City',
  })
  @IsOptional()
  @IsString({
    message: i18nValidationMessage('common.validation.isString', {
      field: 'city',
    }),
  })
  city: string;

  @ApiPropertyOptional({
    description: 'Latitude coordinate of the venue (-90 to 90)',
    example: 10.762622,
  })
  @IsOptional()
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

  @ApiPropertyOptional({
    description: 'Longitude coordinate of the venue (-180 to 180)',
    example: 106.660172,
  })
  @IsOptional()
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
    example: [1, 2, 3],
    type: [Number],
  })
  @IsOptional()
  amenities?: number[];
}
