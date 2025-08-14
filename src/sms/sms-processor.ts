import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { CustomLogger } from 'src/common/logger/custom-logger.service';
import { SmsEvent } from './constants/sms-event.enum';
import { SmsSendPayloadDto } from './dto/requests/sms-send-payload';
import { SmsService } from './sms.service';

@Processor('sms')
export class SmsProcessor extends WorkerHost {
  constructor(
    private readonly loggerService: CustomLogger,
    private readonly smsService: SmsService,
  ) {
    super();
  }
  async process(job: Job<SmsSendPayloadDto>): Promise<void> {
    const { name, data } = job;
    switch (name) {
      case SmsEvent.CONFIRMED_BOOKING.toString(): {
        try {
          await this.smsService.sendSms(data);
        } catch (error) {
          this.loggerService.error(
            `Send Noti [${SmsEvent.CONFIRMED_BOOKING}] Failed`,
            `Caused: ${(error as Error).stack}`,
          );
        }
      }
    }
    return Promise.resolve();
  }
}
