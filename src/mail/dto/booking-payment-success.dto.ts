import { Booking, Payment } from '@prisma/client';
import { IsEmail, IsNotEmpty } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';
import { OwnerLite, SpaceLite } from 'src/common/interfaces/type';

export class BookingPaymentSuccessPayloadDto {
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
  @IsNotEmpty()
  payment: Payment;
}
