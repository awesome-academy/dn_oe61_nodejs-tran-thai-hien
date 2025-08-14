import { Payment } from '@prisma/client';
import { BookingLite, OwnerLite } from 'src/common/interfaces/type';
import { SpaceInfo } from '../dto/responses/payment-history-response.dto';

export type PaymentHistoryType = Payment & {
  booking: BookingLite & { user: OwnerLite; space: SpaceInfo };
};
