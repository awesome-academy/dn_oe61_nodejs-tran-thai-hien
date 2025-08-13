import { applyDecorators } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import { TopBookingUserResponseDto } from 'src/statistic/dto/responses/top-booking-user-response.dto';
import {
  ApiErrorConflict,
  ApiErrorInternal,
} from 'src/swagger/decorators/swagger-error.decorator';
import { SwaggerGetPaginatedResponse } from 'src/swagger/decorators/swagger-response.decorator';

export function ApiResponseViewTopBooking() {
  const path = '/statistics/users/top-booking';
  return applyDecorators(
    ApiOperation({
      summary: 'Get top booking users',
      description: 'Get top booking users',
    }),
    SwaggerGetPaginatedResponse(
      TopBookingUserResponseDto,
      'Get top booking users successfully',
      'Get top booking users successfully',
    ),
    ApiErrorConflict(
      'Failed to get booking users',
      'Failed to get booking users',
      path,
    ),
    ApiErrorInternal(path),
  );
}
