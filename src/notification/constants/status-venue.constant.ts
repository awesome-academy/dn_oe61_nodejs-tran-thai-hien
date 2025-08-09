import { NotificationType, VenueStatus } from '@prisma/client';
import {
  APPROVED_VENUE_TITLE,
  BLOCKED_VENUE_TITLE,
  REJECTED_VENUE_TITLE,
} from 'src/common/constants/notification.constant';

export enum MessageKeyStatusVenue {
  APPROVED = 'message.approvedVenue',
  REJECTED = 'message.rejectedVenue',
  BLOCKED = 'message.blockedVenue',
  PENDING = 'message.pendingVenue',
  DEACTIVED = 'message.deactiveVenue',
}
export const venueNotificationMap: Record<
  VenueStatus,
  {
    type: NotificationType;
    title: string;
    messageKey: MessageKeyStatusVenue;
  }
> = {
  [VenueStatus.APPROVED]: {
    type: NotificationType.VENUE_APPROVED,
    title: APPROVED_VENUE_TITLE,
    messageKey: MessageKeyStatusVenue.APPROVED,
  },
  [VenueStatus.REJECTED]: {
    type: NotificationType.VENUE_REJECTED,
    title: REJECTED_VENUE_TITLE,
    messageKey: MessageKeyStatusVenue.REJECTED,
  },
  [VenueStatus.BLOCKED]: {
    type: NotificationType.VENUE_BLOCKED,
    title: BLOCKED_VENUE_TITLE,
    messageKey: MessageKeyStatusVenue.BLOCKED,
  },
  PENDING: {
    type: 'BOOKING_CREATED',
    title: '',
    messageKey: MessageKeyStatusVenue.PENDING,
  },
  DEACTIVED: {
    type: 'BOOKING_CREATED',
    title: '',
    messageKey: MessageKeyStatusVenue.DEACTIVED,
  },
};
