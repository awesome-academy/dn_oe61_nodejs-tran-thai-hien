import { BookingStatus, NotificationType } from '@prisma/client';
import {
  CANCEL_BOOKING_TITLE,
  CREATE_BOOKING_TITLE,
} from 'src/common/constants/notification.constant';

export enum MessageKeyStatusBooking {
  CREATED = 'message.createBooking',
  CANCELED = 'message.cancelBooking',
}
export type PartialBookingStatus = Extract<
  BookingStatus,
  'PENDING' | 'CANCELED'
>;

export const PartialBookingNotificationMap: Record<
  PartialBookingStatus,
  {
    type: NotificationType;
    title: string;
    messageKey: MessageKeyStatusBooking;
  }
> = {
  PENDING: {
    type: NotificationType.BOOKING_CREATED,
    title: CREATE_BOOKING_TITLE,
    messageKey: MessageKeyStatusBooking.CREATED,
  },
  CANCELED: {
    type: NotificationType.BOOKING_CANCELLED,
    title: CANCEL_BOOKING_TITLE,
    messageKey: MessageKeyStatusBooking.CANCELED,
  },
};
