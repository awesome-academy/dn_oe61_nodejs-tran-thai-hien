import { applyDecorators } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import { NotificationSummaryResponse } from 'src/notification/dto/responses/notification-summary.response.dto';
import {
  ApiErrorConflict,
  ApiErrorInternal,
} from 'src/swagger/decorators/swagger-error.decorator';
import {
  SwaggerNoContentResponse,
  SwaggerUpdatedResponse,
} from 'src/swagger/decorators/swagger-response.decorator';

export function MarkAsReadNotificationExample() {
  const path = '/notifications/id/read';
  return applyDecorators(
    ApiOperation({
      summary: 'Mark notification as read',
    }),
    SwaggerUpdatedResponse(
      NotificationSummaryResponse,
      'Mark as read notification successfully',
      'Mark as read notification successfully',
    ),
    SwaggerNoContentResponse(),
    ApiErrorConflict(
      'Failed to mark as read notification',
      'Failed to mark as read notification',
      path,
    ),
    ApiErrorInternal(path),
  );
}
