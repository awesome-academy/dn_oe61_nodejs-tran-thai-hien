import { applyDecorators } from '@nestjs/common';
import { ApiBody, ApiOperation } from '@nestjs/swagger';
import {
  ApiErrorBadRequest,
  ApiErrorBadRequestValidation,
  ApiErrorConflict,
  ApiErrorInternal,
  ApiErrorNotFound,
} from 'src/swagger/decorators/swagger-error.decorator';
import { SwaggerCreatedResponse } from 'src/swagger/decorators/swagger-response.decorator';
import { VenueCreationRequestDto } from 'src/venue/dto/requests/venue-creation.request.dto';
import { VenueCreationResponseDto } from 'src/venue/dto/responses/venue-creation.response.dto';

export function ApiResponseCreateVenue() {
  const path = '/venues/create';
  return applyDecorators(
    ApiOperation({
      summary: 'Create Venue',
      description: 'Allow users to create a venue',
    }),
    ApiBody({
      description: 'Venue Creation Info',
      type: VenueCreationRequestDto,
    }),
    SwaggerCreatedResponse(
      VenueCreationResponseDto,
      'Venue Creation Successfully',
      'Venue Creation Successfully',
    ),
    ApiErrorBadRequestValidation(
      'Invalid input create user',
      [{ name: 'Name must be not empty' }],
      path,
    ),
    ApiErrorNotFound('Venue not found', 'Venue not found', path),
    ApiErrorBadRequest(
      'Some amenities do not exist',
      'Some amenities do not exist',
      '/venues/create',
      { missingAmenities: [1, 2, 5] },
    ),
    ApiErrorConflict('Failed to create venue', 'Failed to create venue', path),
    ApiErrorInternal(path),
  );
}
