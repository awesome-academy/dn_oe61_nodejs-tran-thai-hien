import { Booking } from '@prisma/client';
import { IsEmail, IsNotEmpty, IsOptional } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';
import { OwnerLite, SpaceLite } from 'src/common/interfaces/type';

export class BookingStatusPayloadDto {
  @IsEmail(
    {},
    {
      message: i18nValidationMessage('common.validation.isEmail', {
        field: 'email',
      }),
    },
  )
  to: string;
  @IsNotEmpty()
  booking: Booking & { space: SpaceLite; user: OwnerLite };
  @IsOptional()
  reason?: string;
}
