import { applyDecorators } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import { ChatSummaryResponseDto } from 'src/chat/dto/responses/chat-summary-response.dto';
import {
  ApiErrorConflict,
  ApiErrorInternal,
} from 'src/swagger/decorators/swagger-error.decorator';
import { SwaggerGetPaginatedResponse } from 'src/swagger/decorators/swagger-response.decorator';

export function ApiResponseGetChatHistoryExample() {
  const path = '/chats/otherId/history';
  return applyDecorators(
    ApiOperation({
      summary: 'Get history chat messages successfully',
    }),
    SwaggerGetPaginatedResponse(
      ChatSummaryResponseDto,
      'Get history chat messages successfully',
      'Get history chat messages successfully',
    ),
    ApiErrorConflict(
      'Failed to find history chat messages',
      'Failed to find history chat messages',
      path,
    ),
    ApiErrorInternal(path),
  );
}
