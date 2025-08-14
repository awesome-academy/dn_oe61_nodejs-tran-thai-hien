import { applyDecorators } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import {
  ApiErrorConflict,
  ApiErrorInternal,
} from 'src/swagger/decorators/swagger-error.decorator';
import { SwaggerGetPaginatedResponse } from 'src/swagger/decorators/swagger-response.decorator';
import { UserSummaryDto } from 'src/user/dto/responses/user-summary.dto';

export function ApiResponseGetPublicUser() {
  const path = '/';
  return applyDecorators(
    ApiOperation({
      summary: 'Find public users',
      description: 'Find public users **(Requires Bearer token)**',
    }),
    SwaggerGetPaginatedResponse(
      UserSummaryDto,
      'Find public users successfully',
      'Find public users successfully',
    ),
    ApiErrorConflict('Conflict', 'Find public users failed', path),
    ApiErrorInternal(path),
  );
}
