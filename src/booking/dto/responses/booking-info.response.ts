import { BookingStatus } from '@prisma/client';
import { SpaceInfoResponse } from './space-info.response';
import { OwnerLite } from 'src/common/interfaces/type';

export class BookingInfoResponse {
  id: number;
  space: SpaceInfoResponse;
  startTime: Date;
  endTime: Date;
  status: BookingStatus;
  totalPrice: number;
  user?: OwnerLite;
  createdAt: Date;
}
