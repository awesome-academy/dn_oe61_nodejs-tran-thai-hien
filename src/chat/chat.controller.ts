import { Controller, Get, Render } from '@nestjs/common';
import { IsPublicRoute } from 'src/common/decorators/public-route.decorator';

@Controller('chats')
export class ChatController {
  @IsPublicRoute()
  @Get('test')
  @Render('pages/chat')
  getChat() {}
}
