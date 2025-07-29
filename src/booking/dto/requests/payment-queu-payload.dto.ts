import { Booking } from '@prisma/client';
import { OwnerLite, SpaceLite } from 'src/common/interfaces/type';
export class PaymentQueuePayloadDto {
  booking: Booking & { user: OwnerLite & { email: string }; space: SpaceLite };
  message?: string;
  expiredAt: number;
  paymentLink?: string;
}
