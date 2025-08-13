import { applyDecorators } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import {
  ApiErrorConflict,
  ApiErrorInternal,
  ApiErrorNotFound,
} from 'src/swagger/decorators/swagger-error.decorator';
import { SwaggerBaseResponseNull } from 'src/swagger/decorators/swagger-response.decorator';

export function ApiResponseDeleteSpace() {
  const path = '/venues';
  return applyDecorators(
    ApiOperation({
      summary: 'Delete space',
      description: 'Allow users to delete a space',
    }),
    SwaggerBaseResponseNull(
      'Space deleted successfully',
      'Space deleted successfully',
    ),
    ApiErrorNotFound('Space not found', 'Space not found', path),
    ApiErrorConflict('Failed to delete space', 'Failed to delete space', path),
    ApiErrorInternal(path),
  );
}
