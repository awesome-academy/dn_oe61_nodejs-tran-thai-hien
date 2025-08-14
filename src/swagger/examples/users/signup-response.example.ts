import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import {
  ApiErrorBadRequestValidation,
  ApiErrorConflict,
  ApiErrorInternal,
} from 'src/swagger/decorators/swagger-error.decorator';
import { SignupResponseDto } from 'src/user/dto/responses/signup-response.dto';
export function ApiResponseSignup() {
  const path = '/users/signup';
  return applyDecorators(
    ApiOperation({
      summary: 'Signup User',
      description: 'Signup User',
    }),
    ApiResponse({
      status: 201,
      description: 'User Signup for system',
      type: SignupResponseDto,
    }),
    ApiErrorBadRequestValidation(
      'Error Validation',
      [
        { field: 'email', message: 'Email already exists' },
        { field: 'username', message: 'Username already exists' },
        { field: 'phone', message: 'Phone number already exists' },
      ],
      path,
    ),
    ApiErrorConflict('Singup failed', 'Failed to signup user', path),
    ApiErrorInternal(path),
  );
}
