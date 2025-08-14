import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ApiBearerAuth, ApiExcludeEndpoint, ApiTags } from '@nestjs/swagger';
import { IsPublicRoute } from 'src/common/decorators/public-route.decorator';
import { HasRole } from 'src/common/decorators/role.decorator';
import { Role } from 'src/common/enums/role.enum';
import { ApiResponseGetHistoryExample } from 'src/swagger/examples/bookings/get-history-booking.example';
import { ApiResponseCreatePaymentExample } from 'src/swagger/examples/payments/create-payment.example';
import { PaymentCreationRequestDto } from './dto/requests/payment-creation-request.dto';
import { PaymentFilterRequestDto } from './dto/requests/payment-filter-request.dto';
import { PayOSWebhookDTO } from './dto/responses/payos-webhook.dto';
import { PaymentService } from './payment.service';
@ApiTags('payments')
@Controller('payments')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}
  @ApiBearerAuth('access-token')
  @ApiResponseCreatePaymentExample()
  @Post('')
  async create(@Body() dto: PaymentCreationRequestDto) {
    return this.paymentService.create(dto);
  }
  @IsPublicRoute()
  @UsePipes(
    new ValidationPipe({
      whitelist: false,
      transform: false,
      skipMissingProperties: true,
    }),
  )
  @ApiExcludeEndpoint()
  @Post('webhook')
  handleWebHook(@Body() payload: PayOSWebhookDTO) {
    this.paymentService.handleWebhook(payload);
    return { code: '00', desc: 'success' };
  }
  @ApiBearerAuth('access-token')
  @ApiResponseGetHistoryExample()
  @HasRole(Role.ADMIN, Role.MODERATOR)
  @Get('/history')
  async findPaymentsHistory(@Query() query: PaymentFilterRequestDto) {
    return this.paymentService.history(query);
  }
  @ApiBearerAuth('access-token')
  @ApiResponseGetHistoryExample()
  @HasRole(Role.ADMIN, Role.MODERATOR)
  @Get('/status')
  async getStatusPaymentCount(@Query() query: PaymentFilterRequestDto) {
    return this.paymentService.getPaymentStatusCount(query);
  }
}
