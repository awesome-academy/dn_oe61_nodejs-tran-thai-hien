import { applyDecorators } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import {
  ApiErrorConflict,
  ApiErrorInternal,
} from 'src/swagger/decorators/swagger-error.decorator';
import { SwaggerGetResponse } from 'src/swagger/decorators/swagger-response.decorator';
import { UserSummaryDto } from 'src/user/dto/responses/user-summary.dto';

export function ApiResponseGetPublicDetailExample() {
  const path = '/users/:id';
  return applyDecorators(
    ApiOperation({
      summary: 'Find detail users',
      description: 'Find public detail users **(Requires Bearer token)**',
    }),
    SwaggerGetResponse(
      UserSummaryDto,
      'Find user detail successfully',
      'Find user detail successfully',
    ),
    ApiErrorConflict(
      'Find user detail failed',
      'Find user detail failed',
      path,
    ),
    ApiErrorInternal(path),
  );
}
