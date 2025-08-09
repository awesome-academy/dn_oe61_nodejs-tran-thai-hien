import { applyDecorators } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import { PayOSCreatePaymentResponseDto } from 'src/payment/dto/responses/payos-creation-response.dto';
import {
  ApiErrorBadRequest,
  ApiErrorInternal,
} from 'src/swagger/decorators/swagger-error.decorator';
import { SwaggerCreatedResponse } from 'src/swagger/decorators/swagger-response.decorator';

export function ApiResponseCreatePaymentExample() {
  const path = '/payments/create';
  return applyDecorators(
    ApiOperation({
      summary: 'Create payment successfully',
    }),
    SwaggerCreatedResponse(
      PayOSCreatePaymentResponseDto,
      'Create payment successfully',
      'Create payment successfully',
    ),
    ApiErrorBadRequest(
      'Failed to create payment',
      'Failed to create payment',
      path,
    ),
    ApiErrorInternal(path),
  );
}
