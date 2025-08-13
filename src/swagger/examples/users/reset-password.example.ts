import { applyDecorators } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import { ApiErrorInternal } from 'src/swagger/decorators/swagger-error.decorator';
import { SwaggerCreatedResponse } from 'src/swagger/decorators/swagger-response.decorator';
import { VerifyUserResponseDto } from 'src/user/dto/responses/verify-email.dto';

export function ApiResponseResetPasswordExample() {
  const path = '/users/reset-password';
  return applyDecorators(
    ApiOperation({ summary: 'Reset password' }),
    SwaggerCreatedResponse(
      VerifyUserResponseDto,
      'Reset password',
      'Reset password successfully',
    ),
    ApiErrorInternal(path),
  );
}
