import { applyDecorators } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import { StatisticBookingResponseDto } from 'src/statistic/dto/responses/statistic-booking-response.dto';
import {
  ApiErrorConflict,
  ApiErrorInternal,
} from 'src/swagger/decorators/swagger-error.decorator';
import { SwaggerGetResponse } from 'src/swagger/decorators/swagger-response.decorator';

export function ApiResponseViewStatisticBooking() {
  const path = '/statistics/bookings';
  return applyDecorators(
    ApiOperation({
      summary: 'Get statistics booking',
      description: 'Get statistics booking',
    }),
    SwaggerGetResponse(
      StatisticBookingResponseDto,
      'Get statistics bookings successfully',
      'Get statistics bookings successfully',
    ),
    ApiErrorConflict(
      'Failed to get statistics bookings',
      'Failed to get statistics bookings',
      path,
    ),
    ApiErrorInternal(path),
  );
}
