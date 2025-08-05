import { applyDecorators } from '@nestjs/common';
import { ApiBody, ApiOperation } from '@nestjs/swagger';
import {
  ApiErrorBadRequestValidation,
  ApiErrorConflict,
  ApiErrorInternal,
} from 'src/swagger/decorators/swagger-error.decorator';
import {
  SwaggerNoContentResponse,
  SwaggerUpdatedResponse,
} from 'src/swagger/decorators/swagger-response.decorator';
import { StatusVenueUpdateRequestDto } from 'src/venue/dto/requests/status-venue-update.request.dto';
import { VenueCreationResponseDto } from 'src/venue/dto/responses/venue-creation.response.dto';

export function ApiResponseUpdateStatusVenue() {
  const path = '/venues/status';
  return applyDecorators(
    ApiOperation({
      summary: 'Update Status Venue',
      description: 'Allow [Admin/Modeartor] to update a status venue',
    }),
    ApiBody({
      description: 'Status update info',
      type: StatusVenueUpdateRequestDto,
    }),
    SwaggerUpdatedResponse(
      VenueCreationResponseDto,
      'Change status venue successfully',
      'Change status venue successfully',
    ),
    SwaggerNoContentResponse('No change'),
    ApiErrorBadRequestValidation('Validation Error', [
      { status: 'The field must be one of the allowed values venue status' },
    ]),
    ApiErrorConflict(
      'Failed to change status venue',
      'Failed to change status venue',
      path,
    ),
    ApiErrorInternal(path),
  );
}
