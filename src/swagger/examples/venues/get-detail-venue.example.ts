import { applyDecorators } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import {
  ApiErrorConflict,
  ApiErrorInternal,
} from 'src/swagger/decorators/swagger-error.decorator';
import { SwaggerGetResponse } from 'src/swagger/decorators/swagger-response.decorator';
import { VenueDetailResponseDto } from 'src/venue/dto/responses/venue-detail.response.dto';

export function ApiResponseGetDetailVenues() {
  const path = '/venues/';
  return applyDecorators(
    ApiOperation({
      summary: 'Get detail venues',
      description: 'Get detail venues for [ADMIN/USER]',
    }),
    SwaggerGetResponse(VenueDetailResponseDto),
    ApiErrorConflict(
      'Get detail venues failed',
      'Failed to get detail venues',
      path,
    ),
    ApiErrorInternal(path),
  );
}
