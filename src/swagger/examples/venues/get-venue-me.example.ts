import { applyDecorators } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import {
  ApiErrorConflict,
  ApiErrorInternal,
} from 'src/swagger/decorators/swagger-error.decorator';
import { SwaggerGetPaginatedResponse } from 'src/swagger/decorators/swagger-response.decorator';
import { VenueSummaryResponseDto } from 'src/venue/dto/responses/venue-summary.response.dto';

export function ApiResponseGetVenueByMe() {
  const path = '/venues/me';
  return applyDecorators(
    ApiOperation({
      summary: 'Get venues owned by current user',
      description:
        'Get a paginated list of venues where the currently authenticated user is the owner.',
    }),
    SwaggerGetPaginatedResponse(
      VenueSummaryResponseDto,
      'Get venues owned by current user',
      'Get venues me successfully',
    ),
    ApiErrorConflict(
      'Get venues owned by current user failed',
      'Failed to get venues mme',
      path,
    ),
    ApiErrorInternal(path),
  );
}
