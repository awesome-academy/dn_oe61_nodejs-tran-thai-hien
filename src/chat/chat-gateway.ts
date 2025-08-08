import { UnauthorizedException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import cookie from 'cookie';
import { I18nService } from 'nestjs-i18n';
import { Server } from 'socket.io';
import { AuthService } from 'src/auth/auth.service';
import { CustomLogger } from 'src/common/logger/custom-logger.service';
import { ChatPublisher } from './chat-publisher';
import { MessagePayloadDto } from './dto/requests/message-payload.dto';
import { ChatMessageResponse } from './dto/responses/chat-message-response.dto';
import { SendMessageDto } from './dto/send-message.dto';
import { AuthedSocket, SocketAuth } from './interfaces/socket-auth.interface';
@WebSocketGateway({ namespace: 'chat', cors: { origin: '*' } })
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  constructor(
    private readonly i18nService: I18nService,
    private readonly eventEmitter: EventEmitter2,
    private readonly authService: AuthService,
    private readonly loggerService: CustomLogger,
    private readonly chatPublisher: ChatPublisher,
  ) {}
  @WebSocketServer() server: Server;
  private onlineUsers = new Map<number, Set<string>>();
  async handleConnection(client: AuthedSocket) {
    try {
      const rawCookie = client.handshake.headers.cookie;
      const cookies = cookie.parse(rawCookie || '');
      const fromCookie = cookies['accessToken'];
      const fromAuth = (client.handshake.auth as SocketAuth)?.token;
      const fromHeader = client.handshake.headers?.authorization;
      const token = fromAuth || fromHeader || fromCookie;
      if (!token)
        throw new UnauthorizedException(
          this.i18nService.translate('common.auth.unauthorized'),
        );
      const payload = await this.authService.verifyToken(token);
      const userId = payload.sub;
      const existingSockets = this.onlineUsers.get(userId) || new Set();
      existingSockets.add(client.id);
      this.onlineUsers.set(userId, existingSockets);
      client.data.userId = userId;
      this.server.emit('onlineUsers', Array.from(this.onlineUsers));
    } catch (error) {
      this.loggerService.error(
        `Connection socket error`,
        JSON.stringify(error),
      );
      client.disconnect();
    }
  }
  handleDisconnect(client: AuthedSocket) {
    const userId = client.data.userId;
    if (userId) {
      const sockets = this.onlineUsers.get(userId);
      if (sockets) {
        sockets.delete(client.id);
        if (sockets.size === 0) {
          this.onlineUsers.delete(userId);
        } else {
          this.onlineUsers.set(userId, sockets);
        }
      }
    }
    this.server.emit('onlineUsers', Array.from(this.onlineUsers));
  }
  isUserOnline(userId: number): boolean {
    return this.onlineUsers.has(userId);
  }
  @SubscribeMessage('join')
  async handleJoin(@ConnectedSocket() client: AuthedSocket) {
    const userId = client.data.userId;
    if (!userId)
      throw new UnauthorizedException(
        this.i18nService.translate('common.auth.unauthorized'),
      );
    const existingSockets = this.onlineUsers.get(userId) || new Set();
    existingSockets.add(client.id);
    this.onlineUsers.set(userId, existingSockets);
    await client.join(`user_${userId}`);
    client.emit('joined', { userId });
    this.server.emit('onlineUsers', Array.from(this.onlineUsers.keys()));
  }
  @SubscribeMessage('sendMessage')
  handleSendMessage(
    @ConnectedSocket() client: AuthedSocket,
    @MessageBody() dto: SendMessageDto,
  ) {
    const fromUserId = client.data.userId;
    if (!fromUserId)
      throw new UnauthorizedException(
        this.i18nService.translate('common.auth.unauthorized'),
      );
    const sentAt = new Date();
    const message: ChatMessageResponse = {
      id: Date.now(),
      senderId: fromUserId,
      receiverId: dto.toReceiverId,
      content: dto.content,
      sentAt,
    };
    this.server.to(`user_${dto.toReceiverId}`).emit('newMessage', message);
    const payload: MessagePayloadDto = {
      senderId: fromUserId,
      receiverId: dto.toReceiverId,
      content: dto.content,
      sentAt,
    };
    this.chatPublisher.publishCreateMessage(payload);
  }
  sendMessageToUser(userId: number, message: ChatMessageResponse) {
    const socketIds = this.onlineUsers.get(userId);
    if (socketIds) {
      for (const socketId of socketIds) {
        this.server.to(socketId).emit('newMessage', message);
      }
    }
  }
}
