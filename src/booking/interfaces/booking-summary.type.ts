import { Booking, Space, Venue } from '@prisma/client';
import { OwnerLite } from 'src/common/interfaces/type';

export type BookingInfoType = Booking & {
  user?: OwnerLite;
  space: Space & { venue: Venue };
};
