import { BookingStatus } from '@prisma/client';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';

export class BookingConfirmRequestDto {
  @IsEnum(BookingStatus, {
    message: i18nValidationMessage('common.validation.isEnum', {
      field: 'status',
    }),
  })
  status: BookingStatus;
  @IsOptional()
  @IsString({
    message: i18nValidationMessage('common.validation.isString', {
      field: 'reason',
    }),
  })
  reason?: string;
}
