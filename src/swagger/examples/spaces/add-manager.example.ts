import { applyDecorators } from '@nestjs/common';
import { ApiBody, ApiOperation } from '@nestjs/swagger';
import { AddManageSpaceRequestDto } from 'src/space/dto/requests/add-manage-space-request.dto';
import { SpaceManagerResponseDto } from 'src/space/dto/responses/space-manager-response.dto';
import {
  ApiErrorBadRequest,
  ApiErrorConflict,
  ApiErrorInternal,
  ApiErrorNotFound,
} from 'src/swagger/decorators/swagger-error.decorator';
import { SwaggerUpdatedResponse } from 'src/swagger/decorators/swagger-response.decorator';

export function ApiResponseAddManagerExample() {
  const path = '/spaces/id/managers';
  return applyDecorators(
    ApiOperation({
      summary: 'Add managers space',
      description: 'Allow Owner venue to add managers for space',
    }),
    ApiBody({
      description: 'Managers Ids',
      type: AddManageSpaceRequestDto,
    }),
    SwaggerUpdatedResponse(
      SpaceManagerResponseDto,
      'Add managers successfully',
      'Add managers successfully',
    ),
    ApiErrorNotFound('Space not found', 'Space not found', path),
    ApiErrorBadRequest(
      'Some managers do not exist',
      'Some managers do not exist',
      path,
      { missingManagers: [2, 3] },
    ),
    ApiErrorConflict(
      'Failed to add managers space',
      'Failed to add managers space',
      path,
    ),
    ApiErrorInternal(path),
  );
}
