import { Module } from '@nestjs/common';
import { ChatPublisher } from './chat-publisher';
import { ChatListener } from './chat-listener';
import { ChatGateway } from './chat-gateway';
import { BullModule } from '@nestjs/bullmq';
import { QUEUE_CHAT } from 'src/common/constants/queue.constant';
import { ChatService } from './chat.service';
import { ChatController } from './chat.controller';
import { AuthModule } from 'src/auth/auth.module';
import { ChatProcessor } from './chat-processor';

@Module({
  imports: [
    AuthModule,
    BullModule.registerQueue({
      name: QUEUE_CHAT,
    }),
  ],
  providers: [
    ChatGateway,
    ChatPublisher,
    ChatListener,
    ChatService,
    ChatProcessor,
  ],
  controllers: [ChatController],
})
export class ChatModule {}
