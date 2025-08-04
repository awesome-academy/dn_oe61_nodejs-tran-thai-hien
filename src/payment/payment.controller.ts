import {
  Body,
  Controller,
  Post,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { PayOSWebhookDTO } from './dto/responses/payos-webhook.dto';
import { PaymentService } from './payment.service';
import { IsPublicRoute } from 'src/common/decorators/public-route.decorator';

@Controller('payments')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}
  @IsPublicRoute()
  @UsePipes(
    new ValidationPipe({
      whitelist: false,
      transform: false,
      skipMissingProperties: true,
    }),
  )
  @Post('webhook')
  handleWebHook(@Body() payload: PayOSWebhookDTO) {
    this.paymentService.handleWebhook(payload);
    return { code: '00', desc: 'success' };
  }
}
