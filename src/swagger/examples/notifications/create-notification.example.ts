import { applyDecorators } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import { NotificationSummaryResponse } from 'src/notification/dto/responses/notification-summary.response.dto';
import {
  ApiErrorConflict,
  ApiErrorInternal,
  ApiErrorNotFound,
} from 'src/swagger/decorators/swagger-error.decorator';
import { SwaggerCreatedResponse } from 'src/swagger/decorators/swagger-response.decorator';

export function ApiResponseCreateNotification() {
  const path = '/notifications';
  return applyDecorators(
    ApiOperation({
      summary: 'Create notification',
    }),
    SwaggerCreatedResponse(
      NotificationSummaryResponse,
      'Created notification successfully',
      'Created notification successfully',
    ),
    ApiErrorNotFound('Sender or Receiver not found', 'Sender not found', path),
    ApiErrorConflict(
      'Failed to create notification',
      'Failed to create notification',
      path,
    ),
    ApiErrorInternal(path),
  );
}
