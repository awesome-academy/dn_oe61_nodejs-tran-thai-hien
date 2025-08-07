import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Query,
  Render,
} from '@nestjs/common';
import { AccessTokenPayload } from 'src/auth/interfaces/access-token-payload';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { IsPublicRoute } from 'src/common/decorators/public-route.decorator';
import { ChatService } from './chat.service';
import { ChatQueryDto } from './dto/requests/chat-query.dto';

@Controller('chats')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}
  @Get(':otherId/history')
  async getHistory(
    @CurrentUser() user: AccessTokenPayload,
    @Param('otherId', ParseIntPipe) otherId: number,
    @Query() query: ChatQueryDto,
  ) {
    return this.chatService.history(user, otherId, query);
  }
}
