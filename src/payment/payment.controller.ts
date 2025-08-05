import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { PayOSWebhookDTO } from './dto/responses/payos-webhook.dto';
import { PaymentService } from './payment.service';
import { IsPublicRoute } from 'src/common/decorators/public-route.decorator';
import { PaymentFilterRequestDto } from './dto/requests/payment-filter-request.dto';
import { HasRole } from 'src/common/decorators/role.decorator';
import { Role } from 'src/common/enums/role.enum';

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
  @HasRole(Role.ADMIN, Role.MODERATOR)
  @Get('/history')
  async findPaymentsHistory(@Query() query: PaymentFilterRequestDto) {
    return this.paymentService.history(query);
  }
}
