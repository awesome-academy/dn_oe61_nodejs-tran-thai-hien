import { UserStatus } from '@prisma/client';
import { Transform } from 'class-transformer';
import { IsEnum, IsOptional } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';

export class StatusUpdateRequestDto {
  @Transform(({ value }) => {
    if (value == null) return undefined;
    return String(value).toUpperCase();
  })
  @IsEnum(UserStatus, {
    message: i18nValidationMessage('common.validation.isEnum', {
      field: 'status',
    }),
  })
  @IsOptional()
  status: string;
}
