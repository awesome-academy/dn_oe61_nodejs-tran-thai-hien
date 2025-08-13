import { BullModule } from '@nestjs/bullmq';
import { forwardRef, Module } from '@nestjs/common';
import { AuthModule } from 'src/auth/auth.module';
import { QUEUE_CHAT } from 'src/common/constants/queue.constant';
import { NotificationModule } from 'src/notification/notification.module';
import { ChatGateway } from './chat-gateway';
import { ChatListener } from './chat-listener';
import { ChatProcessor } from './chat-processor';
import { ChatPublisher } from './chat-publisher';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';

@Module({
  imports: [
    AuthModule,
    BullModule.registerQueue({
      name: QUEUE_CHAT,
    }),
    forwardRef(() => NotificationModule),
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
