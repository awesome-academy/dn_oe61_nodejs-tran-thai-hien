import { applyDecorators } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import {
  ApiErrorConflict,
  ApiErrorInternal,
} from 'src/swagger/decorators/swagger-error.decorator';
import { SwaggerGetResponse } from 'src/swagger/decorators/swagger-response.decorator';
import { UserProfileResponse } from 'src/user/dto/responses/user-profile.response';

export function ApiResponseGetPorfileExample() {
  const path = '/users/profile';
  return applyDecorators(
    ApiOperation({
      summary: 'Get profile user',
      description: 'Get profile user',
    }),
    SwaggerGetResponse(
      UserProfileResponse,
      'Get my profile successfully',
      'Get my profile successfully',
    ),
    ApiErrorConflict('Conflict', 'Get my profile failed', path),
    ApiErrorInternal(path),
  );
}
