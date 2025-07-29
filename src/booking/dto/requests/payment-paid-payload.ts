import { PaymentMethod } from '@prisma/client';

export class PaymentPaidPayloadDto {
  bookingId: number;
  amount: number;
  method: PaymentMethod;
}
