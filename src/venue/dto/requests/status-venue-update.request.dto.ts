import { VenueStatus } from '@prisma/client';
import { Transform } from 'class-transformer';
import { IsEnum } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';

export class StatusVenueUpdateRequestDto {
  @Transform(({ value }) => {
    if (value == null) return undefined;
    return String(value).toUpperCase();
  })
  @IsEnum(VenueStatus, {
    message: i18nValidationMessage('common.validation.isEnum', {
      field: 'status',
    }),
  })
  status: string;
}
