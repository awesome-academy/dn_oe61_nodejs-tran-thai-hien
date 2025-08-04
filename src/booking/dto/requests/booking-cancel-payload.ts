export class BookingCancelPayloadDto {
  bookingId: number;
  userEmail: string;
  name: string;
  spaceName: string;
  startTime: Date;
  endTime: Date;
}
