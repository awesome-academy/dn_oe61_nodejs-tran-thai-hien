import { applyDecorators } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import {
  ApiErrorBadRequest,
  ApiErrorConflict,
  ApiErrorInternal,
} from 'src/swagger/decorators/swagger-error.decorator';
import { SwaggerUpdatedResponse } from 'src/swagger/decorators/swagger-response.decorator';
import { UserProfileResponse } from 'src/user/dto/responses/user-profile.response';

export function ApiResponseUpdateUserExample() {
  const path = '/users/profile';
  return applyDecorators(
    ApiOperation({ summary: 'Update Profile' }),
    SwaggerUpdatedResponse(
      UserProfileResponse,
      'Update my profile successfully',
      'Update my profile successfully',
    ),
    ApiErrorBadRequest('Duplicate value', 'Phone number already exists', path),
    ApiErrorConflict('Conflict', 'Update my profile failed', path),
    ApiErrorInternal(path),
  );
}
