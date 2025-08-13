import { applyDecorators } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import {
  ApiErrorConflict,
  ApiErrorInternal,
} from 'src/swagger/decorators/swagger-error.decorator';
import { SwaggerBaseResponsePrimitive } from 'src/swagger/decorators/swagger-response.decorator';

export function ApiResponseGetCountUnreadExample() {
  const path = '/notifications/unread-count';
  return applyDecorators(
    ApiOperation({
      summary: 'Get count my notifications unread',
    }),
    SwaggerBaseResponsePrimitive(
      'number',
      'Count notifications un read successfully',
      'Count notifications un read successfully',
      10,
    ),
    ApiErrorConflict(
      'Failed to get count notifications un read',
      'Failed to get count notifications un read',
      path,
    ),
    ApiErrorInternal(path),
  );
}
