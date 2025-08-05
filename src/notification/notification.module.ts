import { BullModule } from '@nestjs/bullmq';
import { forwardRef, Module } from '@nestjs/common';
import { AuthModule } from 'src/auth/auth.module';
import { BookingModule } from 'src/booking/booking.module';
import { QUEUE_NOTIFICATION } from 'src/common/constants/queue.constant';
import { MailModule } from 'src/mail/mail.module';
import { UserModule } from 'src/user/user.module';
import { NotificationGateway } from './notification-gateway';
import { NotificationListener } from './notification-listener';
import { NotificationProcessor } from './notification-processor';
import { NotificationPublisher } from './notification-publisher';
import { NotificationController } from './notification.controller';
import { NotificationService } from './notification.service';

@Module({
  imports: [
    BullModule.registerQueue({
      name: QUEUE_NOTIFICATION,
    }),
    AuthModule,
    MailModule,
    UserModule,
    forwardRef(() => BookingModule),
  ],
  providers: [
    NotificationService,
    NotificationGateway,
    NotificationListener,
    NotificationPublisher,
    NotificationProcessor,
  ],
  exports: [NotificationService, NotificationPublisher],
  controllers: [NotificationController],
})
export class NotificationModule {}
