import { applyDecorators } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import { BookingInfoResponse } from 'src/booking/dto/responses/booking-info.response';
import {
  ApiErrorConflict,
  ApiErrorInternal,
} from 'src/swagger/decorators/swagger-error.decorator';
import { SwaggerGetPaginatedResponse } from 'src/swagger/decorators/swagger-response.decorator';

export function ApiResponseGetBookingExample() {
  const path = '/bookings';
  return applyDecorators(
    ApiOperation({
      summary: 'Get all bookings',
    }),
    SwaggerGetPaginatedResponse(
      BookingInfoResponse,
      'Find all booking successfully',
      'Failed to find all boking',
    ),
    ApiErrorConflict('Failed to find all boking', 'Failed to find all boking'),
    ApiErrorInternal(path),
  );
}
