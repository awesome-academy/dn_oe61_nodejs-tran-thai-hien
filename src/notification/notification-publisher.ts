import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { BookingStatus, PaymentStatus, VenueStatus } from '@prisma/client';
import { CreateVenuePayload } from './dto/payloads/create-venue-payload';
import { VenueStatusNotiPayload } from './dto/payloads/status-venue-payload';
import { NotificationEvent } from './enums/notification-event.enum';
import { BookingStatusNotiPayload } from './dto/payloads/create-booking-noti-payload';
import { NewMessageNotiPayload } from './dto/payloads/new-message-noti-payload';
import { StatusPaymentNotiPayload } from './dto/payloads/status-payment-noti-payload';

@Injectable()
export class NotificationPublisher {
  constructor(private readonly eventEmitter: EventEmitter2) {}
  publishVenueCreated(payload: CreateVenuePayload) {
    this.eventEmitter.emit(NotificationEvent.VENUE_CREATED, payload);
  }
  publishStatusVenue(payload: VenueStatusNotiPayload, type: VenueStatus) {
    if (type === VenueStatus.REJECTED) {
      this.eventEmitter.emit(NotificationEvent.VENUE_REJECTED, payload);
    }
    if (type === VenueStatus.APPROVED) {
      this.eventEmitter.emit(NotificationEvent.VENUE_APPROVED, payload);
    }
    if (type === VenueStatus.BLOCKED) {
      this.eventEmitter.emit(NotificationEvent.VENUE_BLOCKED, payload);
    }
  }
  publishBookingCreated(payload: BookingStatusNotiPayload) {
    if (payload.type === BookingStatus.PENDING) {
      this.eventEmitter.emit(NotificationEvent.BOOKING_CREATED, payload);
    }
    if (payload.type === BookingStatus.CANCELED) {
      this.eventEmitter.emit(NotificationEvent.BOOKING_CANCELED, payload);
    }
  }
  publishNewMessage(payload: NewMessageNotiPayload) {
    this.eventEmitter.emit(NotificationEvent.NEW_MESSAGE, payload);
  }
  publishStatusPayment(payload: StatusPaymentNotiPayload) {
    if (payload.type === PaymentStatus.PAID) {
      this.eventEmitter.emit(NotificationEvent.PAYMENT_SUCCESS, payload);
    }
    if (payload.type === PaymentStatus.FAILED) {
      this.eventEmitter.emit(NotificationEvent.PAYMENT_FAILED, payload);
    }
  }
}
