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
import { I18nService } from 'nestjs-i18n';
import { Server, Socket } from 'socket.io';
import { AuthService } from 'src/auth/auth.service';
import { CustomLogger } from 'src/common/logger/custom-logger.service';
import { JoinRoomDto } from './dto/join-room.dto';
import { SendMessageDto } from './dto/send-message.dto';
import { AuthedSocket, SocketAuth } from './interfaces/socket-auth.interface';
import { ChatPublisher } from './chat-publisher';
import { MessagePayloadDto } from './dto/requests/message-payload.dto';
import { ChatMessageResponse } from './dto/responses/chat-message-response.dto';

@WebSocketGateway({ cors: { origin: '*' } })
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  constructor(
    private readonly i18nService: I18nService,
    private readonly eventEmitter: EventEmitter2,
    private readonly authService: AuthService,
    private readonly loggerService: CustomLogger,
    private readonly chatPublisher: ChatPublisher,
  ) {}
  @WebSocketServer() server: Server;
  private onlineUsers = new Map<number, string>();
  async handleConnection(client: AuthedSocket) {
    try {
      console.log('ABC Chat');
      const fromAuth = (client.handshake.auth as SocketAuth)?.token;
      const fromHeader = client.handshake.headers?.authorization;
      const token = fromAuth || fromHeader;
      console.log('Auth:: ', fromAuth);
      console.log('fromHeader::: ', fromHeader);
      console.log('Token::: ', token);
      if (!token)
        throw new UnauthorizedException(
          this.i18nService.translate('common.auth.unauthorized'),
        );
      const payload = await this.authService.verifyToken(token);
      const userId = payload.sub;
      this.onlineUsers.set(userId, client.id);
      client.data.userId = userId;
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
    if (userId) this.onlineUsers.delete(userId);
  }
  isUserOnline(userId: number): boolean {
    return this.onlineUsers.has(userId);
  }
  @SubscribeMessage('join')
  async handleJoin(
    @ConnectedSocket() client: Socket,
    @MessageBody() dto: JoinRoomDto,
  ) {
    this.onlineUsers.set(dto.userId, client.id);
    await client.join(`user_${dto.userId}`);
    client.emit('joined', { userId: dto.userId });
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
    client.emit('newMessage', message);
    const payload: MessagePayloadDto = {
      senderId: fromUserId,
      receiverId: dto.toReceiverId,
      content: dto.content,
      sentAt,
    };
    this.chatPublisher.publishCreateMessage(payload);
  }
  sendMessageToUser(userId: number, message: ChatMessageResponse) {
    const socketId = this.onlineUsers.get(userId);
    if (socketId) this.server.to(socketId).emit('newMessage', message);
  }
}
