import { NotificationType, PaymentStatus } from '@prisma/client';
import {
  FAILED_PAYMENT_TITLE,
  SUCCESS_PAYMENT_TITLE,
} from 'src/common/constants/notification.constant';

export enum MessageKeyStatusPayment {
  SUCCESS = 'message.paymentSuccess',
  FAILED = 'message.paymentFailed',
}
export type PartialPaymentStatus = Extract<PaymentStatus, 'PAID' | 'FAILED'>;

export const PartialPaymentNotificationMap: Record<
  PartialPaymentStatus,
  {
    type: NotificationType;
    title: string;
    messageKey: MessageKeyStatusPayment;
  }
> = {
  PAID: {
    type: NotificationType.PAYMENT_SUCCESS,
    title: SUCCESS_PAYMENT_TITLE,
    messageKey: MessageKeyStatusPayment.SUCCESS,
  },
  FAILED: {
    type: NotificationType.PAYMENT_FAILED,
    title: FAILED_PAYMENT_TITLE,
    messageKey: MessageKeyStatusPayment.FAILED,
  },
};
