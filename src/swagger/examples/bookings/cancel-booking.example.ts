import { applyDecorators } from '@nestjs/common';
import { ApiNoContentResponse, ApiOperation } from '@nestjs/swagger';
import { BookingSummaryResponseDto } from 'src/booking/dto/responses/booking-summary-response.dto';
import {
  ApiErrorConflict,
  ApiErrorInternal,
} from 'src/swagger/decorators/swagger-error.decorator';
import { SwaggerUpdatedResponse } from 'src/swagger/decorators/swagger-response.decorator';

export function ApiResponseCancelBookingExample() {
  const path = '/bookings/id/cancel';
  return applyDecorators(
    ApiOperation({
      summary: 'Cancel booking',
    }),
    SwaggerUpdatedResponse(
      BookingSummaryResponseDto,
      'Booking canceled successfully',
      'Booking canceled successfully',
    ),
    ApiNoContentResponse(),
    ApiErrorConflict('Failed to cancel booking', 'Failed to cancel booking'),
    ApiErrorInternal(path),
  );
}
