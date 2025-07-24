import { IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';

export class VenueUpdateRequestDto {
  @IsOptional()
  @IsString({
    message: i18nValidationMessage('common.validation.isString', {
      field: 'name',
    }),
  })
  name: string;
  @IsOptional()
  @IsString({
    message: i18nValidationMessage('common.validation.isString', {
      field: 'street',
    }),
  })
  street: string;
  @IsOptional()
  @IsString({
    message: i18nValidationMessage('common.validation.isString', {
      field: 'city',
    }),
  })
  city: string;
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
  @IsOptional()
  amenities?: number[];
}
