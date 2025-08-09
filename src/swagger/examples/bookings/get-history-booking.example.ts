import { applyDecorators } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import { BookingInfoResponse } from 'src/booking/dto/responses/booking-info.response';
import {
  ApiErrorConflict,
  ApiErrorInternal,
} from 'src/swagger/decorators/swagger-error.decorator';
import { SwaggerGetPaginatedResponse } from 'src/swagger/decorators/swagger-response.decorator';

export function ApiResponseGetHistoryExample() {
  const path = '/bookings/history';
  return applyDecorators(
    ApiOperation({
      summary: 'Get history bookings',
    }),
    SwaggerGetPaginatedResponse(
      BookingInfoResponse,
      'Find booking history successfully',
      'Find booking history successfully',
    ),
    ApiErrorConflict(
      'Find booking history failed',
      'Find booking history failed',
    ),
    ApiErrorInternal(path),
  );
}
