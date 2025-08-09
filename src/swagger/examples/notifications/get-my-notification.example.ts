import { applyDecorators } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import { NotificationSummaryResponse } from 'src/notification/dto/responses/notification-summary.response.dto';
import {
  ApiErrorConflict,
  ApiErrorInternal,
} from 'src/swagger/decorators/swagger-error.decorator';
import { SwaggerGetPaginatedResponse } from 'src/swagger/decorators/swagger-response.decorator';

export function ApiResponseGetMyNotificationExample() {
  const path = '/notifications/me';
  return applyDecorators(
    ApiOperation({
      summary: 'Get my notifications',
    }),
    SwaggerGetPaginatedResponse(
      NotificationSummaryResponse,
      'Get my notifications successfully',
      'Get my notifications successfully',
    ),
    ApiErrorConflict(
      'Failed to get my notifications',
      'Failed to get my notifications',
      path,
    ),
    ApiErrorInternal(path),
  );
}
