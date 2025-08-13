import { Injectable, NotFoundException } from '@nestjs/common';
import { ChatMessage, Prisma } from '@prisma/client';
import { I18nService } from 'nestjs-i18n';
import { AccessTokenPayload } from 'src/auth/interfaces/access-token-payload';
import { getPaginationData } from 'src/common/helpers/paginate.helper';
import { getUserOrFail } from 'src/common/helpers/user.helper';
import { PaginationResult } from 'src/common/interfaces/paginate-type';
import { OwnerLite } from 'src/common/interfaces/type';
import { CustomLogger } from 'src/common/logger/custom-logger.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { INCLUDE_CHAT_SUMMARY } from './constants/includes.constant';
import { ChatQueryDto } from './dto/requests/chat-query.dto';
import { MessageCreationRequestDto } from './dto/requests/message-creation-request.dto';
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
  async history(
    currentUser: AccessTokenPayload,
    otherUserId: number,
    query: ChatQueryDto,
  ): Promise<PaginationResult<ChatSummaryResponseDto>> {
    const sender = await getUserOrFail(
      this.prismaService,
      this.i18nService,
      currentUser.sub,
    );
    if (!sender)
      throw new NotFoundException(
        this.i18nService.translate('common.chat.senderNotFound'),
      );
    const receiver = await getUserOrFail(
      this.prismaService,
      this.i18nService,
      otherUserId,
    );
    if (!receiver)
      throw new NotFoundException(
        this.i18nService.translate('common.chat.receiverNotFound'),
      );
    const { page, pageSize } = query;
    const totalItems = await this.prismaService.chatMessage.count({
      where: {
        OR: [
          { senderId: sender.id, receiverId: receiver.id },
          { senderId: receiver.id, receiverId: sender.id },
        ],
      },
    });
    const paginationData = getPaginationData(totalItems, page, pageSize);
    const messages = await this.prismaService.chatMessage.findMany({
      where: {
        OR: [
          { senderId: sender.id, receiverId: receiver.id },
          { senderId: receiver.id, receiverId: sender.id },
        ],
      },
      include: INCLUDE_CHAT_SUMMARY,
      orderBy: { sentAt: 'desc' },
      skip: paginationData.skip,
      take: paginationData.safePageSize,
    });
    return {
      data: messages
        .reverse()
        .map((chat) => this.buildChatSummaryResponse(chat)),
      meta: {
        currentPage: paginationData.safePage,
        itemCount: paginationData.totalItems,
        itemsPerPage: paginationData.safePageSize,
        totalPages: paginationData.totalPages,
        totalItems: paginationData.totalItems,
      },
    };
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
