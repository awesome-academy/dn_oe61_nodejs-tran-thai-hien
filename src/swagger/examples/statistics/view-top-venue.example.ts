import { applyDecorators } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import { TopVenueResponseDto } from 'src/statistic/dto/responses/top-venue.dto';
import {
  ApiErrorConflict,
  ApiErrorInternal,
} from 'src/swagger/decorators/swagger-error.decorator';
import { SwaggerGetPaginatedResponse } from 'src/swagger/decorators/swagger-response.decorator';

export function ApiResponseViewTopVenue() {
  const path = '/statistics/venues/top-booking';
  return applyDecorators(
    ApiOperation({
      summary: 'Get top booking venues',
      description: 'Get top booking venues',
    }),
    SwaggerGetPaginatedResponse(
      TopVenueResponseDto,
      'Get top booking venues successfully',
      'Get top booking venues successfully',
    ),
    ApiErrorConflict(
      'Failed to get top booking venues',
      'Failed to get top booking venues',
      path,
    ),
    ApiErrorInternal(path),
  );
}
