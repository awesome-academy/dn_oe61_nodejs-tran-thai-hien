import { Payment } from '@prisma/client';
import { BookingLite, OwnerLite } from 'src/common/interfaces/type';

export type PaymentHistoryType = Payment & {
  booking: BookingLite & { user: OwnerLite };
};
