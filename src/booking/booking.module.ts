import { Module } from '@nestjs/common';
import { BookingService } from './booking.service';
import { BookingController } from './booking.controller';
import { MailModule } from 'src/mail/mail.module';

@Module({
  imports: [MailModule],
  providers: [BookingService],
  controllers: [BookingController],
})
export class BookingModule {}
