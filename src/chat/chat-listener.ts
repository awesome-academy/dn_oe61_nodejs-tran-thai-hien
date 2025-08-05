import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { ChatEvent } from './enums/chat-event.enum';
import { SendMessageDto } from './dto/send-message.dto';
import { InjectQueue } from '@nestjs/bullmq';
import { QUEUE_CHAT } from 'src/common/constants/queue.constant';
import { Queue } from 'bullmq';
import { ChatQueueEvent } from './enums/chat-queue-event.enum';

@Injectable()
export class ChatListener {
  constructor(@InjectQueue(QUEUE_CHAT) private readonly chatQueue: Queue) {}
  @OnEvent(ChatEvent.CREATE_MESSAGE)
  async handleCreateMessage(payload: SendMessageDto): Promise<void> {
    await this.chatQueue.add(ChatQueueEvent.SAVE_MESSAGE, payload);
  }
}
