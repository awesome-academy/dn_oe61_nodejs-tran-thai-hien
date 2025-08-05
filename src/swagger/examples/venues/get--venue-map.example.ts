import { applyDecorators } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import {
  ApiErrorConflict,
  ApiErrorInternal,
} from 'src/swagger/decorators/swagger-error.decorator';
import { SwaggerGetPaginatedResponse } from 'src/swagger/decorators/swagger-response.decorator';
import { VenueMapResponseDto } from 'src/venue/dto/responses/venue-map.response.dto';

export function ApiResponseGetVenueMap() {
  const path = '/venues/map';
  return applyDecorators(
    ApiOperation({
      summary: 'Get map venues',
      description: 'Get map for venues',
    }),
    SwaggerGetPaginatedResponse(
      VenueMapResponseDto,
      'Get map for venues',
      'Get map for venues successfully',
    ),
    ApiErrorConflict(
      'Get map for venues failed',
      'Failed to map for venues',
      path,
    ),
    ApiErrorInternal(path),
  );
}
