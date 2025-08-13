import { applyDecorators } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import {
  ApiErrorConflict,
  ApiErrorInternal,
} from 'src/swagger/decorators/swagger-error.decorator';
import { SwaggerGetPaginatedResponse } from 'src/swagger/decorators/swagger-response.decorator';
import { VenueResponseDto } from 'src/venue/dto/responses/venue-response.dto';

export function ApiResponseGetVenueNearby() {
  const path = '/venues/nearby';
  return applyDecorators(
    ApiOperation({
      summary: 'Show recommendations venues nearby',
      description: 'Get venues nearby to show recommendations',
    }),
    SwaggerGetPaginatedResponse(
      VenueResponseDto,
      'Get venues nearby',
      'Get venues nearby successfully',
    ),
    ApiErrorConflict('Get venues nearby', 'Failed to get venues nearby', path),
    ApiErrorInternal(path),
  );
}
