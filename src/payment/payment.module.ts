import { forwardRef, Module } from '@nestjs/common';
import { BookingModule } from 'src/booking/booking.module';
import { PaymentController } from './payment.controller';
import { PaymentService } from './payment.service';

@Module({
  imports: [forwardRef(() => BookingModule)],
  providers: [PaymentService],
  exports: [PaymentService],
  controllers: [PaymentController],
})
export class PaymentModule {}
