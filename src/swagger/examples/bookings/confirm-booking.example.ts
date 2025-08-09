import { applyDecorators } from '@nestjs/common';
import { ApiNoContentResponse, ApiOperation } from '@nestjs/swagger';
import { BookingSummaryResponseDto } from 'src/booking/dto/responses/booking-summary-response.dto';
import {
  ApiErrorConflict,
  ApiErrorInternal,
} from 'src/swagger/decorators/swagger-error.decorator';
import { SwaggerUpdatedResponse } from 'src/swagger/decorators/swagger-response.decorator';

export function ApiResponseConfirmBookingExample() {
  const path = '/bookings/id/confirm';
  return applyDecorators(
    ApiOperation({
      summary: 'Confirm booking',
    }),
    SwaggerUpdatedResponse(
      BookingSummaryResponseDto,
      'Booking confirmed successfully',
      'Booking confirmed successfully',
    ),
    ApiNoContentResponse(),
    ApiErrorConflict('Failed to cofirm booking', 'Failed to cofirm booking'),
    ApiErrorInternal(path),
  );
}
