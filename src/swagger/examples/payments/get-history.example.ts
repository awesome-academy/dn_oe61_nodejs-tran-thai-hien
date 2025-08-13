import { applyDecorators } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import { PaymentHistoryResponseDto } from 'src/payment/dto/responses/payment-history-response.dto';
import {
  ApiErrorConflict,
  ApiErrorInternal,
} from 'src/swagger/decorators/swagger-error.decorator';
import { SwaggerGetPaginatedResponse } from 'src/swagger/decorators/swagger-response.decorator';

export function ApiResponseGetHistoryExample() {
  const path = '/payments/history';
  return applyDecorators(
    ApiOperation({
      summary: 'Get history payments successfully',
    }),
    SwaggerGetPaginatedResponse(
      PaymentHistoryResponseDto,
      'Get history payments successfully',
      'Get history payments successfully',
    ),
    ApiErrorConflict(
      'Failed to find history payments',
      'Failed to find history payments',
      path,
    ),
    ApiErrorInternal(path),
  );
}
