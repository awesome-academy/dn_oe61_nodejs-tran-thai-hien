import { PaymentStatus } from '@prisma/client';

export class StatusPaymentNotiPayload {
  bookingId: number;
  paymentId?: number;
  payerName?: string;
  amount?: number;
  method?: string;
  paidAt: Date;
  type: PaymentStatus;
  reason?: string;
}
