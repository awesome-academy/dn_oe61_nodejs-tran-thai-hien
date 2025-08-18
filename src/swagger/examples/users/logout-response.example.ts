import { applyDecorators } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import {
  ApiErrorConflict,
  ApiErrorInternal,
  ApiErrorUnauthorized,
} from 'src/swagger/decorators/swagger-error.decorator';
import { SwaggerBaseResponseNull } from 'src/swagger/decorators/swagger-response.decorator';

export function ApiResponseLogoutExample() {
  const path = '/users/logout';
  return applyDecorators(
    ApiOperation({
      summary: 'Logout',
      description: 'Logout (Requires Bearer token)',
    }),
    SwaggerBaseResponseNull('Logout', 'Logout successfully'),
    ApiErrorUnauthorized(
      'Unauthorized',
      'Missing or invalid credentials',
      path,
    ),
    ApiErrorConflict('Conflict', 'Token already exist', path),
    ApiErrorInternal(path),
  );
}
