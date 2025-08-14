import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { QUEUE_SMS } from 'src/common/constants/queue.constant';
import { SmsProcessor } from './sms-processor';
import { SmsPublisher } from './sms-publisher';
import { SmsController } from './sms.controller';
import { SmsService } from './sms.service';
import { SmsListener } from './sms-listener';

@Module({
  imports: [
    BullModule.registerQueue({
      name: QUEUE_SMS,
    }),
  ],
  providers: [SmsService, SmsListener, SmsPublisher, SmsProcessor],
  controllers: [SmsController],
  exports: [SmsPublisher],
})
export class SmsModule {}
