import { applyDecorators } from '@nestjs/common';
import { ApiBody, ApiOperation } from '@nestjs/swagger';
import {
  ApiErrorBadRequest,
  ApiErrorConflict,
  ApiErrorInternal,
} from 'src/swagger/decorators/swagger-error.decorator';
import {
  SwaggerNoContentResponse,
  SwaggerUpdatedResponse,
} from 'src/swagger/decorators/swagger-response.decorator';
import { VenueUpdateRequestDto } from 'src/venue/dto/requests/venue-update.request.dto';
import { VenueCreationResponseDto } from 'src/venue/dto/responses/venue-creation.response.dto';

export function ApiResponseUpdateVenue() {
  const path = '/venues/update';
  return applyDecorators(
    ApiOperation({
      summary: 'Update Venue',
      description: 'Allow users to update a venue',
    }),
    ApiBody({
      description: 'Venue Update Info',
      type: VenueUpdateRequestDto,
    }),
    SwaggerUpdatedResponse(
      VenueCreationResponseDto,
      'Venue Update Successfully',
      'Venue Update Successfully',
    ),
    SwaggerNoContentResponse('No change'),
    ApiErrorBadRequest(
      'Invalid input update',
      'At least one field must be provided',
      path,
    ),
    ApiErrorConflict('Failed to update venue', 'Failed to update venue', path),
    ApiErrorInternal(path),
  );
}
