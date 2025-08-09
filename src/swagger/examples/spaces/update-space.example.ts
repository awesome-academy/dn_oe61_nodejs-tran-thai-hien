import { applyDecorators } from '@nestjs/common';
import { ApiBody, ApiOperation } from '@nestjs/swagger';
import { SpaceUpdateRequestDto } from 'src/space/dto/requests/space-update-request.dto';
import { SpaceSummaryResponseDto } from 'src/space/dto/responses/space-summary-response.dto';
import {
  ApiErrorBadRequest,
  ApiErrorConflict,
  ApiErrorInternal,
} from 'src/swagger/decorators/swagger-error.decorator';
import {
  SwaggerNoContentResponse,
  SwaggerUpdatedResponse,
} from 'src/swagger/decorators/swagger-response.decorator';

export function ApiResponseUpdateSpace() {
  const path = '/venues';
  return applyDecorators(
    ApiOperation({
      summary: 'Update Space',
      description: 'Allow users to update a space',
    }),
    ApiBody({
      description: 'Space Update Info',
      type: SpaceUpdateRequestDto,
    }),
    SwaggerUpdatedResponse(
      SpaceSummaryResponseDto,
      'Space updated successfully',
      'Space updated successfully',
    ),
    SwaggerNoContentResponse('No change'),
    ApiErrorBadRequest(
      'Missing Amenities or Missing Managers',
      'Missing Managers',
      path,
    ),
    ApiErrorConflict('Failed to update space', 'Failed to update space', path),
    ApiErrorInternal(path),
  );
}
