export class BookingConfirmEventPayloadDto {
  bookingId: number;
  userId: number;
  message: string;
  expiredAt: number;
  paymentLink: string;
}
