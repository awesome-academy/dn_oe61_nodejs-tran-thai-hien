import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { CustomLogger } from 'src/common/logger/custom-logger.service';
import { ChatGateway } from './chat-gateway';
import { ChatService } from './chat.service';
import { MessageCreationRequestDto } from './dto/requests/message-creation-request.dto';
import { MessagePayloadDto } from './dto/requests/message-payload.dto';
import { ChatQueueEvent } from './enums/chat-queue-event.enum';
import { ChatMessageResponse } from './dto/responses/chat-message-response.dto';

@Processor('booking')
export class ChatProcessor extends WorkerHost {
  constructor(
    private readonly chatGateway: ChatGateway,
    private readonly loggerService: CustomLogger,
    private readonly chatSerivce: ChatService,
  ) {
    super();
  }
  async process(job: Job<MessagePayloadDto>): Promise<void> {
    const { name, data } = job;
    switch (name) {
      case ChatQueueEvent.SAVE_MESSAGE.toString(): {
        if (this.chatGateway.isUserOnline(data.receiverId)) {
          // Send notification
        }
        const dto: MessageCreationRequestDto = {
          senderId: data.senderId,
          receiverId: data.receiverId,
          content: data.content,
        };
        const messageCreated = await this.chatSerivce.create(dto);
        const chatMessageResponse: ChatMessageResponse = {
          id: messageCreated.id,
          receiverId: messageCreated.receiverId,
          senderId: messageCreated.senderId,
          content: messageCreated.content,
          sentAt: data.sentAt,
        };
        this.chatGateway.sendMessageToUser(dto.receiverId, chatMessageResponse);
        break;
      }
    }
    return Promise.resolve();
  }
}
