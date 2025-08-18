import { applyDecorators } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import {
  ApiErrorBadRequestValidation,
  ApiErrorConflict,
  ApiErrorInternal,
} from 'src/swagger/decorators/swagger-error.decorator';
import {
  SwaggerNoContentResponse,
  SwaggerUpdatedResponse,
} from 'src/swagger/decorators/swagger-response.decorator';
import { UserSummaryDto } from 'src/user/dto/responses/user-summary.dto';

export function ApiResponseStatusUpdate() {
  const path = '/admin/user/:id/status';
  return applyDecorators(
    ApiOperation({
      summary: 'Change user status',
      description:
        '[MODERATOR/ADMIN]  change user status **(Requires Bearer token)**',
    }),
    SwaggerUpdatedResponse(
      UserSummaryDto,
      'Update user status successfully',
      'Update user status successfully',
    ),
    SwaggerNoContentResponse(),
    ApiErrorBadRequestValidation(
      'Error Validation',
      [
        {
          status:
            'The field status must be one of the allowed values status user',
        },
      ],
      path,
    ),
    ApiErrorConflict(
      'Update user status failed',
      'Update user status failed',
      path,
    ),
    ApiErrorInternal(path),
  );
}
