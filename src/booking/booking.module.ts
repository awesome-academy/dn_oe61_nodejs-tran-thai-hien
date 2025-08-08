import { BullModule } from '@nestjs/bullmq';
import { forwardRef, Module } from '@nestjs/common';
import { QUEUE_BOOKING } from 'src/common/constants/queue.constant';
import { MailModule } from 'src/mail/mail.module';
import { PaymentModule } from 'src/payment/payment.module';
import { BookingListener } from './booking-listener';
import { BookingPublisher } from './booking-publisher';
import { BookingController } from './booking.controller';
import { BookingProcessor } from './booking.processor';
import { BookingService } from './booking.service';
import { NotificationModule } from 'src/notification/notification.module';

@Module({
  imports: [
    BullModule.registerQueue({
      name: QUEUE_BOOKING,
    }),
    MailModule,
    PaymentModule,
    forwardRef(() => NotificationModule),
  ],
  providers: [
    BookingService,
    BookingProcessor,
    BookingPublisher,
    BookingListener,
  ],
  controllers: [BookingController],
  exports: [BookingPublisher, BookingService],
})
export class BookingModule {}
