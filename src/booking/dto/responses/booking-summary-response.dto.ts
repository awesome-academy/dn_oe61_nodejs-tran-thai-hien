import { BookingStatus, SpacePriceUnit } from '@prisma/client';
import { OwnerLite, SpaceLite } from 'src/common/interfaces/type';

export class BookingSummaryResponseDto {
  id: number;
  status: BookingStatus;
  startTime: Date;
  endTime: Date;
  totalPrice: number;
  unit: SpacePriceUnit;
  space: SpaceLite;
  user: OwnerLite;
}
