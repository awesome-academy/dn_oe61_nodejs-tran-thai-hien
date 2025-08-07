import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { I18nService } from 'nestjs-i18n';
import { StatusKey } from 'src/common/enums/status-key.enum';
import { logAndThrowPrismaClientError } from 'src/common/helpers/catch-error.helper';
import { CustomLogger } from 'src/common/logger/custom-logger.service';
import { ChatGateway } from './chat-gateway';
import { ChatService } from './chat.service';
import { MessageCreationRequestDto } from './dto/requests/message-creation-request.dto';
import { MessagePayloadDto } from './dto/requests/message-payload.dto';
import { ChatQueueEvent } from './enums/chat-queue-event.enum';

@Processor('chat')
export class ChatProcessor extends WorkerHost {
  constructor(
    private readonly chatGateway: ChatGateway,
    private readonly loggerService: CustomLogger,
    private readonly chatService: ChatService,
    private readonly i18nService: I18nService,
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
        try {
          const dto: MessageCreationRequestDto = {
            senderId: data.senderId,
            receiverId: data.receiverId,
            content: data.content,
          };
          await this.chatService.create(dto);
        } catch (error) {
          this.chatGateway.sendMessageToUser(data.senderId, {
            error: this.i18nService.translate('common.chat.errorSaveMessage'),
          });
          logAndThrowPrismaClientError(
            error as Error,
            ChatProcessor.name,
            'chat',
            'saveMessage',
            StatusKey.FAILED,
            this.loggerService,
            this.i18nService,
          );
        }
        break;
      }
    }
    return Promise.resolve();
  }
}
