import { applyDecorators } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import {
  ApiErrorConflict,
  ApiErrorInternal,
} from 'src/swagger/decorators/swagger-error.decorator';
import { SwaggerGetPaginatedResponse } from 'src/swagger/decorators/swagger-response.decorator';
import { VenueSummaryResponseDto } from 'src/venue/dto/responses/venue-summary.response.dto';

export function ApiResponseGetListVenue() {
  const path = '/admin/venues/';
  return applyDecorators(
    ApiOperation({
      summary: 'Get all venues',
      description: 'Get all venues for (ADMIN/MODERATOR)',
    }),
    SwaggerGetPaginatedResponse(
      VenueSummaryResponseDto,
      'Get all venues',
      'Get all venues successfully',
    ),
    ApiErrorConflict('Get all venues failed', 'Failed to get all venues', path),
    ApiErrorInternal(path),
  );
}
