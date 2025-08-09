import { IsOptional, IsString, Matches } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { i18nValidationMessage } from 'nestjs-i18n';

export class ProfileUpdateRequestDto {
  @ApiPropertyOptional({
    example: 'John Doe',
    description: 'The name of the user',
  })
  @IsOptional()
  @IsString({
    message: i18nValidationMessage('common.validation.isString', {
      constraint: 'name',
    }),
  })
  name?: string;

  @ApiPropertyOptional({
    example: '123 Main Street, New York, NY',
    description: 'The address of the user',
  })
  @IsOptional()
  @IsString({
    message: i18nValidationMessage('common.validation.isString', {
      constraint: 'address',
    }),
  })
  address?: string;

  @ApiPropertyOptional({
    example: '0769609446',
    description: 'Vietnamese phone number of the user',
  })
  @IsOptional()
  @Matches(/^(0?)(3[2-9]|5[6|8|9]|7[0|6-9]|8[1-9]|9[0-9])[0-9]{7}$/, {
    message: i18nValidationMessage('auth.signup.validation.invalidFormatPhone'),
  })
  phone?: string;

  @ApiPropertyOptional({
    example: 'Software developer at XYZ Company',
    description: 'Short biography or personal description',
  })
  @IsOptional()
  @IsString({
    message: i18nValidationMessage('common.validation.isString', {
      constraint: 'bio',
    }),
  })
  bio?: string;

  @ApiPropertyOptional({
    example: 'https://example.com/avatar.jpg',
    description: 'URL of the profile avatar image',
  })
  @IsOptional()
  @IsString({
    message: i18nValidationMessage('common.validation.isString', {
      constraint: 'avatar',
    }),
  })
  avatar?: string;
}
