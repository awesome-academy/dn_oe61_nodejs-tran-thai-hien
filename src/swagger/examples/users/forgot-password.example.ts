import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiQuery } from '@nestjs/swagger';
import {
  ApiErrorInternal,
  ApiErrorNotFound,
} from 'src/swagger/decorators/swagger-error.decorator';
import { SwaggerGetResponse } from 'src/swagger/decorators/swagger-response.decorator';
import { ForgotPasswordResponse } from 'src/user/dto/responses/forgot-password-response';

export function ApiResponseForgotPasword() {
  const path = '/users/forgot-password';
  return applyDecorators(
    ApiOperation({ summary: 'Forgot Password' }),
    ApiQuery({
      name: 'email',
      required: true,
      type: String,
      description: 'Email used to reset password',
      example: 'examplel@gmail.com',
    }),
    SwaggerGetResponse(
      ForgotPasswordResponse,
      'Send token reset password',
      'Send token reset password successfully',
    ),
    ApiErrorNotFound(
      'Email not found',
      'Email to forgot password not found',
      path,
    ),
    ApiErrorInternal(path),
  );
}
