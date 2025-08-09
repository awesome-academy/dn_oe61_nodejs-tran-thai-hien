import { applyDecorators } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import { BookingSummaryResponseDto } from 'src/booking/dto/responses/booking-summary-response.dto';
import {
  ApiErrorBadRequest,
  ApiErrorBadRequestValidation,
  ApiErrorConflict,
  ApiErrorInternal,
  ApiErrorNotFound,
} from 'src/swagger/decorators/swagger-error.decorator';
import { SwaggerCreatedResponse } from 'src/swagger/decorators/swagger-response.decorator';

export function ApiResponseCreateBookingExample() {
  const path = '/bookings';
  return applyDecorators(
    ApiOperation({
      summary: 'Create bookings',
    }),
    SwaggerCreatedResponse(
      BookingSummaryResponseDto,
      'Booking created successfully',
      'Booking created successfully',
    ),
    ApiErrorBadRequestValidation('Error Validation', [
      { spaceId: 'The field spaceId must be an integer' },
    ]),
    ApiErrorNotFound('Space not found', 'Space not found'),
    ApiErrorBadRequest(
      'Time invalid',
      'The start time must be before the end time',
    ),
    ApiErrorConflict(
      'Time slot already booked',
      'This time slot is already booked',
    ),
    ApiErrorInternal(path),
  );
}
