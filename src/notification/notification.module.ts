import { Module } from '@nestjs/common';
import { MailModule } from 'src/mail/mail.module';
import { NotificationService } from './notification.service';

@Module({
  imports: [MailModule],
  providers: [NotificationService],
  exports: [NotificationService],
})
export class NotificationModule {}
