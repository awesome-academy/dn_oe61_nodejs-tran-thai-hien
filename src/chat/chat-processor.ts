import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { I18nService } from 'nestjs-i18n';
import { StatusKey } from 'src/common/enums/status-key.enum';
import { logAndThrowPrismaClientError } from 'src/common/helpers/catch-error.helper';
import { CustomLogger } from 'src/common/logger/custom-logger.service';
import { NewMessageNotiPayload } from 'src/notification/dto/payloads/new-message-noti-payload';
import { NotificationPublisher } from 'src/notification/notification-publisher';
import { PrismaService } from 'src/prisma/prisma.service';
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
    private readonly notificationPublisher: NotificationPublisher,
    private readonly prismaService: PrismaService,
  ) {
    super();
  }
  async process(job: Job<MessagePayloadDto>): Promise<void> {
    const { name, data } = job;
    switch (name) {
      case ChatQueueEvent.SAVE_MESSAGE.toString(): {
        if (!this.chatGateway.isUserOnline(data.receiverId)) {
          console.log('abc');
          const sender = await this.prismaService.user.findUnique({
            where: {
              id: data.senderId,
            },
            select: {
              name: true,
            },
          });
          const senderName = sender?.name ?? 'Unknow';
          const notifyPayload: NewMessageNotiPayload = {
            receiverId: data.receiverId,
            senderName,
            sentAt: data.sentAt,
          };
          this.notificationPublisher.publishNewMessage(notifyPayload);
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
