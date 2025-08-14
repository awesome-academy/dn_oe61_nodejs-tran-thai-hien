import { applyDecorators } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import { PaymentStatusCountDto } from 'src/payment/dto/responses/payment-status-count.response';
import {
  ApiErrorConflict,
  ApiErrorInternal,
} from 'src/swagger/decorators/swagger-error.decorator';
import { SwaggerGetResponse } from 'src/swagger/decorators/swagger-response.decorator';

export function ApiResponseGetPaymentStatusCount() {
  const path = '/payments/status';
  return applyDecorators(
    ApiOperation({
      summary: 'Get count status payment',
    }),
    SwaggerGetResponse(
      PaymentStatusCountDto,
      'Get count status payment successfully',
      'Get count status payment successfully',
    ),
    ApiErrorConflict(
      'Get count status payment failed',
      'Get count status payment failed',
    ),
    ApiErrorInternal(path),
  );
}
