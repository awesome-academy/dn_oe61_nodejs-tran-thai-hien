import { Injectable, NotFoundException } from '@nestjs/common';
import { CustomLogger } from 'src/common/logger/custom-logger.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { MessageCreationRequestDto } from './dto/requests/message-creation-request.dto';
import { I18nService } from 'nestjs-i18n';
import { ChatMessage, Prisma } from '@prisma/client';
import { INCLUDE_CHAT_SUMMARY } from './constants/includes.constant';
import { OwnerLite } from 'src/common/interfaces/type';
import { ChatSummaryResponseDto } from './dto/responses/chat-summary-response.dto';

@Injectable()
export class ChatService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly loggerService: CustomLogger,
    private readonly i18nService: I18nService,
  ) {}
  async create(dto: MessageCreationRequestDto) {
    const sender = await this.prismaService.user.findUnique({
      where: {
        id: dto.senderId,
      },
    });
    if (!sender)
      throw new NotFoundException(
        this.i18nService.translate('common.chat.action.create.senderNotFound'),
      );
    const receiver = await this.prismaService.user.findUnique({
      where: {
        id: dto.receiverId,
      },
    });
    if (!receiver)
      throw new NotFoundException(
        this.i18nService.translate(
          'common.chat.action.create.receiverNotFound',
        ),
      );
    const messageData: Prisma.ChatMessageCreateInput = {
      receiver: {
        connect: {
          id: receiver.id,
        },
      },
      sender: {
        connect: {
          id: sender.id,
        },
      },
      content: dto.content,
    };
    const messageCreated = await this.prismaService.chatMessage.create({
      data: messageData,
      include: INCLUDE_CHAT_SUMMARY,
    });
    return this.buildChatSummaryResponse(messageCreated);
  }
  private buildChatSummaryResponse(
    data: ChatMessage & { sender: OwnerLite; receiver: OwnerLite },
  ): ChatSummaryResponseDto {
    return {
      id: data.id,
      receiverId: data.receiver.id,
      receiverName: data.receiver.name,
      senderId: data.sender.id,
      senderName: data.sender.name,
      content: data.content,
      sentAt: data.sentAt,
    };
  }
}
