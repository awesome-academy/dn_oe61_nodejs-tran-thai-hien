import { applyDecorators } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import {
  ApiErrorBadRequest,
  ApiErrorBadRequestValidation,
  ApiErrorConflict,
  ApiErrorInternal,
} from 'src/swagger/decorators/swagger-error.decorator';
import {
  SwaggerNoContentResponse,
  SwaggerUpdatedArrayResponse,
} from 'src/swagger/decorators/swagger-response.decorator';
import { UserSummaryDto } from 'src/user/dto/responses/user-summary.dto';

export function ApiResponseUpdateStatusUserBulk() {
  const path = '/admin/user/';
  return applyDecorators(
    ApiOperation({
      summary: 'Change user status bulk',
      description: 'Change user status bulk **(Requires Bearer token)**',
    }),
    SwaggerUpdatedArrayResponse(
      UserSummaryDto,
      'Update user status successfully',
      'Update user status successfully',
    ),
    SwaggerNoContentResponse(),
    ApiErrorBadRequestValidation(
      'Error Validation',
      [
        {
          role: 'The field status must be one of the allowed values role user',
          status:
            'The field status must be one of the allowed values status user',
          isVerified:
            'The field isVerified must be one of the allowed values [True/False]',
        },
      ],
      path,
    ),
    ApiErrorBadRequest(
      'Missing User or Missing Role',
      'Missing roles: [1,3,6]',
    ),
    ApiErrorConflict(
      'Update user status failed',
      'Update user status failed',
      path,
    ),
    ApiErrorInternal(path),
  );
}
