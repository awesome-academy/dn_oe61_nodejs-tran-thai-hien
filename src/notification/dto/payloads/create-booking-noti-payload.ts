import { BookingStatus } from '@prisma/client';

export class BookingStatusNotiPayload {
  bookingId: number;
  spaceName: string;
  ownerName: string;
  startDate: Date;
  endDate: Date;
  createdAt: Date;
  type: BookingStatus;
}
