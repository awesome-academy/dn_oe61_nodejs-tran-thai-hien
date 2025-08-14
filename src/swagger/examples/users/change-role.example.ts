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

export function ApiResponseChangeRoleExample() {
  const path = '/admin/user/:id/verify';
  return applyDecorators(
    ApiOperation({
      summary: 'Change role user',
      description: '[Admin] change role user **(Requires Bearer token)**',
    }),
    SwaggerUpdatedResponse(
      UserSummaryDto,
      'Change role user successfully',
      'Change role user successfully',
    ),
    SwaggerNoContentResponse(),
    ApiErrorBadRequestValidation(
      'Error Validation',
      [
        {
          role: 'The field role must be one of the allowed values [User/Moderator/Admin]',
        },
      ],
      path,
    ),
    ApiErrorConflict(
      'Change role user failed',
      'Change role user failed',
      path,
    ),
    ApiErrorInternal(path),
  );
}
