import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { BookingEvent } from './constants/booking-event.enum';
import { BookingConfirmEventPayloadDto } from './dto/requests/booking-confirm-event-payload.dto';
import { PaymentPaidPayloadDto } from './dto/requests/payment-paid-payload';
import { PaymentQueuePayloadDto } from './dto/requests/payment-queu-payload.dto';
import { BookingCancelPayloadDto } from './dto/requests/booking-cancel-payload';

@Injectable()
export class BookingPublisher {
  constructor(private readonly eventEmitter: EventEmitter2) {}
  publishBookingCofirmed(payload: PaymentQueuePayloadDto): void {
    const data: BookingConfirmEventPayloadDto = {
      bookingId: payload.booking.id,
      userId: payload.booking.user.id,
      message: payload?.message ?? '',
      expiredAt: payload.expiredAt,
      paymentLink: payload.paymentLink ?? '',
    };
    this.eventEmitter.emit(BookingEvent.BOOKING_CONFIRMED, data);
  }
  publishBookingRejected(bookingId: number): void {
    this.eventEmitter.emit(BookingEvent.BOOKING_REJECTED, {
      bookingId: bookingId,
    });
  }
  publishBookingPaid(payload: PaymentPaidPayloadDto): void {
    this.eventEmitter.emit(BookingEvent.BOOKING_PAID, {
      bookingId: payload.bookingId,
      amount: payload.amount,
      method: payload.method,
    });
  }
  publishReminderBooking(payload: PaymentQueuePayloadDto): void {
    this.eventEmitter.emit(BookingEvent.BOOKING_REMINDER, payload);
  }
  publishBookingPaymentExpired(payload: PaymentQueuePayloadDto): void {
    this.eventEmitter.emit(BookingEvent.BOOKING_EXPIRED, payload);
  }
  publishCanceledBooking(payload: BookingCancelPayloadDto): void {
    this.eventEmitter.emit(BookingEvent.BOOKING_CANCELED, payload);
  }
}
