import { applyDecorators } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import { BookingInfoResponse } from 'src/booking/dto/responses/booking-info.response';
import {
  ApiErrorConflict,
  ApiErrorInternal,
} from 'src/swagger/decorators/swagger-error.decorator';
import { SwaggerGetPaginatedResponse } from 'src/swagger/decorators/swagger-response.decorator';

export function ApiResponseGetBookingManagedExample() {
  const path = '/bookings/managed-spaces';
  return applyDecorators(
    ApiOperation({
      summary: 'Find space booking state',
    }),
    SwaggerGetPaginatedResponse(
      BookingInfoResponse,
      'Find space booking state successfully',
      'Find space booking state successfully',
    ),
    ApiErrorConflict(
      'Find space booking state failed',
      'Find space booking state failed',
    ),
    ApiErrorInternal(path),
  );
}
