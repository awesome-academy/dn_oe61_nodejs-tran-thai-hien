import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { ChatEvent } from './enums/chat-event.enum';
import { SendMessageDto } from './dto/send-message.dto';
import { InjectQueue } from '@nestjs/bullmq';
import { QUEUE_CHAT } from 'src/common/constants/queue.constant';
import { Queue } from 'bullmq';
import { ChatQueueEvent } from './enums/chat-queue-event.enum';
import { CustomLogger } from 'src/common/logger/custom-logger.service';

@Injectable()
export class ChatListener {
  constructor(
    @InjectQueue(QUEUE_CHAT) private readonly chatQueue: Queue,
    private readonly loggerService: CustomLogger,
  ) {}
  @OnEvent(ChatEvent.CREATE_MESSAGE)
  async handleCreateMessage(payload: SendMessageDto): Promise<void> {
    try {
      await this.chatQueue.add(ChatQueueEvent.SAVE_MESSAGE, payload, {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 5000,
        },
        removeOnComplete: true,
        removeOnFail: false,
      });
    } catch (error) {
      const exception = error as Error;
      this.loggerService.error(
        `Failed to add job to ChatQueue`,
        exception.stack,
      );
    }
  }
}
