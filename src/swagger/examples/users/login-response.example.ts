import { applyDecorators } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import {
  ApiErrorForbidden,
  ApiErrorInternal,
  ApiErrorUnauthorized,
} from 'src/swagger/decorators/swagger-error.decorator';
import { SwaggerCreatedResponse } from 'src/swagger/decorators/swagger-response.decorator';
import { LoginResponseDto } from 'src/user/dto/responses/login-response.dto';
export function ApiResponseLogin() {
  const path = '/users/login';
  return applyDecorators(
    ApiOperation({
      summary: 'Login User',
      description: 'Login User',
    }),
    SwaggerCreatedResponse(
      LoginResponseDto,
      'Login successfully',
      'Login successfully',
    ),
    ApiErrorInternal(path),
    ApiErrorUnauthorized(
      'Unauthorized',
      'Unauthorized: Invalid credentials',
      path,
    ),
    ApiErrorForbidden('Forbidden', 'Email not verified', path),
  );
}
