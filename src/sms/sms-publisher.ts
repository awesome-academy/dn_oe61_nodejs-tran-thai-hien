import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { SmsEvent } from './constants/sms-event.enum';
import { ConfirmBookingSmsPayload } from './dto/requests/confirm-booking-sms-payload';

@Injectable()
export class SmsPublisher {
  constructor(private readonly eventEmitter: EventEmitter2) {}
  publishConfirmedBookingSms(payload: ConfirmBookingSmsPayload): void {
    this.eventEmitter.emit(SmsEvent.CONFIRMED_BOOKING, payload);
  }
}
