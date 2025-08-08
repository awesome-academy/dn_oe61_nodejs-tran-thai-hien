import { UnauthorizedException } from '@nestjs/common';
import {
  ConnectedSocket,
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
import {
  AuthedSocket,
  SocketAuth,
} from 'src/common/interfaces/socket-auth.interface';
import { CustomLogger } from 'src/common/logger/custom-logger.service';
import { NotificationSummaryResponse } from './dto/responses/notification-summary.response.dto';
import { EMPTY_SOCKET_COUNT } from 'src/common/constants/socket.constant';
@WebSocketGateway({ namespace: '/notification', cors: { origin: '*' } })
export class NotificationGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  constructor(
    private readonly i18nService: I18nService,
    private readonly authService: AuthService,
    private readonly loggerService: CustomLogger,
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
        if (sockets.size === EMPTY_SOCKET_COUNT) {
          this.onlineUsers.delete(userId);
        } else {
          this.onlineUsers.set(userId, sockets);
        }
      }
    }
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
  }
  sendNotification(userId: number, payload: NotificationSummaryResponse) {
    const socketIds = this.onlineUsers.get(userId);
    if (socketIds) {
      for (const socketId of socketIds) {
        this.server.to(socketId).emit('newNotification', payload);
      }
    }
  }
}
