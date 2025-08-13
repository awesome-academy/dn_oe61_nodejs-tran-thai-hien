import { applyDecorators } from '@nestjs/common';
import { ApiBody, ApiOperation } from '@nestjs/swagger';
import { SpaceCreationRequestDto } from 'src/space/dto/requests/space-creation-request.dto';
import {
  ApiErrorBadRequest,
  ApiErrorBadRequestValidation,
  ApiErrorConflict,
  ApiErrorInternal,
  ApiErrorNotFound,
} from 'src/swagger/decorators/swagger-error.decorator';
import { SwaggerCreatedResponse } from 'src/swagger/decorators/swagger-response.decorator';

export function ApiResponseCreateSpace() {
  const path = '/spaces';
  return applyDecorators(
    ApiOperation({
      summary: 'Create space',
      description: 'Allow users to create a space',
    }),
    ApiBody({
      description: 'Space Creation Info',
      type: SpaceCreationRequestDto,
    }),
    SwaggerCreatedResponse(
      SpaceCreationRequestDto,
      'Space Creation Successfully',
      'Space Creation Successfully',
    ),
    ApiErrorBadRequestValidation(
      'Invalid input create user',
      [
        { name: 'Name must be not empty' },
        { prices: 'Prices must be not empty' },
      ],
      path,
    ),
    ApiErrorNotFound('Venue not found', 'Venue not found', path),
    ApiErrorBadRequest(
      'Some amenities do not exist or some managers do not exist',
      'Some amenities do not exist/Some managers do not exist',
      path,
      { missingAmenities: [1, 2, 5], missingManagers: [2, 3] },
    ),
    ApiErrorConflict('Failed to create space', 'Failed to create space', path),
    ApiErrorInternal(path),
  );
}
