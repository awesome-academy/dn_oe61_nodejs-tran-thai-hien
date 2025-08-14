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

export function ApiResponseChangeVerifyExample() {
  const path = '/admin/user/:id/verify';
  return applyDecorators(
    ApiOperation({
      summary: 'Change verify user',
      description:
        '[Admin/Moderator] change verify user **(Requires Bearer token)**',
    }),
    SwaggerUpdatedResponse(
      UserSummaryDto,
      'Change verify user successfully',
      'Change verify user successfully',
    ),
    SwaggerNoContentResponse(),
    ApiErrorBadRequestValidation(
      'Error Validation',
      [
        {
          isVerify:
            'The field isVerify must be one of the allowed values [false/boolean]',
        },
      ],
      path,
    ),
    ApiErrorConflict(
      'Change verify user failed',
      'Change verify user failed',
      path,
    ),
    ApiErrorInternal(path),
  );
}
