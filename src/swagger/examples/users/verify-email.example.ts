import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiQuery } from '@nestjs/swagger';
import {
  ApiErrorInternal,
  ApiErrorNotFound,
} from 'src/swagger/decorators/swagger-error.decorator';
import { SwaggerGetResponse } from 'src/swagger/decorators/swagger-response.decorator';
import { VerifyUserResponseDto } from 'src/user/dto/responses/verify-email.dto';

export function ApiResponseVerifyEmailExample() {
  const path = '/user/verify-email';
  return applyDecorators(
    ApiOperation({ summary: 'Verify user email' }),
    ApiQuery({
      name: 'token',
      required: true,
      type: String,
      description: "Token used to verify the user's email address",
      example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    }),
    SwaggerGetResponse(
      VerifyUserResponseDto,
      'Email verified successfully',
      'Email verified successfully',
    ),
    ApiErrorNotFound('Token not found', 'Token not found', path),
    ApiErrorInternal(path),
  );
}
