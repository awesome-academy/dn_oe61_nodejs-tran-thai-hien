import { applyDecorators } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import { StatisticBookingResponseDto } from 'src/statistic/dto/responses/statistic-booking-response.dto';
import {
  ApiErrorConflict,
  ApiErrorInternal,
} from 'src/swagger/decorators/swagger-error.decorator';
import { SwaggerGetResponse } from 'src/swagger/decorators/swagger-response.decorator';

export function ApiResponseViewStatisticRevenue() {
  const path = '/statistics/revenuues';
  return applyDecorators(
    ApiOperation({
      summary: 'Get statistics revenues',
      description: 'Get statistics revenues',
    }),
    SwaggerGetResponse(
      StatisticBookingResponseDto,
      'Get statistics revenues successfully',
      'Get statistics revenues successfully',
    ),
    ApiErrorConflict(
      'Failed to get statistics revenues',
      'Failed to get statistics revenues',
      path,
    ),
    ApiErrorInternal(path),
  );
}
