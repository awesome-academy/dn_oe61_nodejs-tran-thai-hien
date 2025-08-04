import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { CustomLogger } from 'src/common/logger/custom-logger.service';
import { JobNotificationKey } from 'src/notification/enums/job-notification-key';
import { BookingPublisher } from './booking-publisher';
import { PaymentQueuePayloadDto } from './dto/requests/payment-queu-payload.dto';

@Processor('booking')
export class BookingProcessor extends WorkerHost {
  constructor(
    private readonly bookingPublisher: BookingPublisher,
    private readonly loggerService: CustomLogger,
  ) {
    super();
  }
  async process(job: Job<PaymentQueuePayloadDto>): Promise<void> {
    const { name, data } = job;
    switch (name) {
      case JobNotificationKey.PAYMENT_REMINDER.toString():
        this.bookingPublisher.publishReminderBooking(data);
        this.loggerService.debug(`Call reminder email !!!`);
        break;
      case JobNotificationKey.PAYMENT_EXPIRED.toString():
        this.bookingPublisher.publishBookingPaymentExpired(data);
        break;
    }
    return Promise.resolve();
  }
}
