import { Body, Controller, Post } from '@nestjs/common';
import { SmsSendPayloadDto } from './dto/requests/sms-send-payload';
import { SmsService } from './sms.service';
import { ApiExcludeEndpoint } from '@nestjs/swagger';

@Controller('sms')
export class SmsController {
  constructor(private readonly smsService: SmsService) {}
  @ApiExcludeEndpoint()
  @Post('/send')
  async sendSms(@Body() dto: SmsSendPayloadDto) {
    return this.smsService.sendSms(dto);
  }
}
