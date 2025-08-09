import { applyDecorators } from '@nestjs/common';
import { ApiNoContentResponse, ApiOperation } from '@nestjs/swagger';
import { BookingSummaryResponseDto } from 'src/booking/dto/responses/booking-summary-response.dto';
import {
  ApiErrorConflict,
  ApiErrorInternal,
} from 'src/swagger/decorators/swagger-error.decorator';
import { SwaggerUpdatedResponse } from 'src/swagger/decorators/swagger-response.decorator';

export function ApiResponseRejectBookingExample() {
  const path = '/bookings/id/reject';
  return applyDecorators(
    ApiOperation({
      summary: 'Reject booking',
    }),
    SwaggerUpdatedResponse(
      BookingSummaryResponseDto,
      'Booking rejected successfully',
      'Booking rejected successfully',
    ),
    ApiNoContentResponse(),
    ApiErrorConflict(
      'Failed to rejected booking',
      'Failed to rejected booking',
    ),
    ApiErrorInternal(path),
  );
}
