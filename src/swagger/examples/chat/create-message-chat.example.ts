import { applyDecorators } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import { ChatMessageResponse } from 'src/chat/dto/responses/chat-message-response.dto';
import {
  ApiErrorBadRequestValidation,
  ApiErrorConflict,
  ApiErrorInternal,
  ApiErrorNotFound,
} from 'src/swagger/decorators/swagger-error.decorator';
import { SwaggerCreatedResponse } from 'src/swagger/decorators/swagger-response.decorator';

export function ApiResponseCreateMessageChatExample() {
  const path = '/chats';
  return applyDecorators(
    ApiOperation({
      summary: 'Create chat messsage',
    }),
    SwaggerCreatedResponse(
      ChatMessageResponse,
      'Chat message created successfully',
      'Chat message created successfully',
    ),
    ApiErrorBadRequestValidation('Error Validation', [
      { senderId: 'The field senderId must be an integer' },
      { receiverId: 'The field receiverId must be an integer' },
    ]),
    ApiErrorNotFound('Sender not found', 'Sender not found'),
    ApiErrorConflict(
      'Failed to create chat message',
      'Failed to create chat message',
    ),
    ApiErrorInternal(path),
  );
}
