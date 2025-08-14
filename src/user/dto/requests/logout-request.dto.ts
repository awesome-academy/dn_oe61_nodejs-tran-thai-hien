import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';

export class LogoutRequestDto {
  @ApiPropertyOptional({
    description: 'Authentication token',
    example: 'ZlA722899111....',
  })
  @IsOptional()
  @IsString({
    message: i18nValidationMessage('common.validation.isString', {
      field: 'token',
    }),
  })
  token?: string;
}
