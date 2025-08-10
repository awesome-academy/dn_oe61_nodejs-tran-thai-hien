import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Vonage } from '@vonage/server-sdk';
import { CustomLogger } from 'src/common/logger/custom-logger.service';
import { SmsSendPayloadDto } from './dto/requests/sms-send-payload';
import { formatPhoneNumberSms } from 'src/common/utils/sms.util';

@Injectable()
export class SmsService {
  private vonage: Vonage;
  constructor(
    private readonly configService: ConfigService,
    private readonly loggerService: CustomLogger,
  ) {
    this.vonage = new Vonage({
      apiKey: this.configService.get<string>('vonage.apiKey'),
      apiSecret: this.configService.get<string>('vonage.secretKey'),
    });
  }
  async sendSms(dto: SmsSendPayloadDto): Promise<unknown> {
    try {
      this.loggerService.log('Send message');
      const from = this.configService.get<string>('vonage.from', 'Vonage');
      const { to, text } = dto;
      const toNumberFormated = formatPhoneNumberSms(to);
      console.log('Phone numbers:: ', toNumberFormated);
      const response = await this.vonage.sms.send({
        to: toNumberFormated,
        from,
        text,
      });
      this.loggerService.log(`SMS sent: ${JSON.stringify(response)}`);
      const msg = response.messages?.[0];
      if (msg?.status.toString() !== '0') {
        throw new Error(`SMS failed: ${msg['error-text']}`);
      }
      this.loggerService.log('Response:: ', JSON.stringify(response));
      return response;
    } catch (err) {
      this.loggerService.error('Failed to send SMS', (err as Error).stack);
      throw err;
    }
  }
}
