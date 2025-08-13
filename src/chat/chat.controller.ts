import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
} from '@nestjs/common';
import { AccessTokenPayload } from 'src/auth/interfaces/access-token-payload';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { ChatService } from './chat.service';
import { ChatQueryDto } from './dto/requests/chat-query.dto';
import { MessageCreationRequestDto } from './dto/requests/message-creation-request.dto';
import { ApiResponseCreateMessageChatExample } from 'src/swagger/examples/chat/create-message-chat.example';
import { ApiResponseGetChatHistoryExample } from 'src/swagger/examples/chat/get-history.example';
import { ApiBearerAuth } from '@nestjs/swagger';

@Controller('chats')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}
  @ApiBearerAuth('access-token')
  @ApiResponseCreateMessageChatExample()
  @Post('')
  async create(dto: MessageCreationRequestDto) {
    return this.chatService.create(dto);
  }
  @ApiBearerAuth('access-token')
  @ApiResponseGetChatHistoryExample()
  @Get(':otherId/history')
  async getHistory(
    @CurrentUser() user: AccessTokenPayload,
    @Param('otherId', ParseIntPipe) otherId: number,
    @Query() query: ChatQueryDto,
  ) {
    return this.chatService.history(user, otherId, query);
  }
}
