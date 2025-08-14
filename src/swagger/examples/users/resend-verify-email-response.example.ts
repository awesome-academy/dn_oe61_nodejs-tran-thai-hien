import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiQuery } from '@nestjs/swagger';
import {
  ApiErrorBadRequest,
  ApiErrorInternal,
  ApiErrorNotFound,
} from 'src/swagger/decorators/swagger-error.decorator';
import { SwaggerGetResponse } from 'src/swagger/decorators/swagger-response.decorator';
import { ResendVerifyEmailResponseDto } from 'src/user/dto/responses/resend-verify-email.dto';

export function ApiResponseResendVerifyEmaiLExample() {
  const path = '/users/resend-verify';
  return applyDecorators(
    ApiOperation({
      summary: 'Resend verification email',
      description: 'Resend verification email',
    }),
    ApiQuery({
      name: 'email',
      required: true,
      type: String,
      description: 'User email address to resend verification link',
      example: 'user@example.com',
    }),
    SwaggerGetResponse(
      ResendVerifyEmailResponseDto,
      'Resend verify email successfully',
      'Resend verify email successfully',
    ),
    ApiErrorNotFound('Not Found', 'Email not found', path),
    ApiErrorBadRequest(
      'Email is invalid or already verified',
      'Email is invalid or already verified',
      path,
    ),
    ApiErrorInternal(path),
  );
}
