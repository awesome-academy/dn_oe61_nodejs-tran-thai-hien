import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Request,
} from '@nestjs/common';
import { AccessTokenPayload } from 'src/auth/interfaces/access-token-payload';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { NotificationCreationRequestDto } from './dto/requests/notification-creation-request.dto';
import { UserNotificationFilterDto } from './dto/requests/user-notification-filter.dto';
import { NotificationService } from './notification.service';

@Controller('notifications')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}
  @Post('')
  async create(@Body() dto: NotificationCreationRequestDto) {
    return this.notificationService.create(dto);
  }
  @Get('/me')
  async getMyNotification(
    @CurrentUser() user: AccessTokenPayload,
    @Query() filter: UserNotificationFilterDto,
  ) {
    return this.notificationService.getMyNotification(user, filter);
  }
  @Patch(':notifyId/read')
  async markAsRead(
    @CurrentUser() user: AccessTokenPayload,
    @Param('notifyId', ParseIntPipe) notifyId: number,
  ) {
    return this.notificationService.markAsRead(user, notifyId);
  }
  @Get('/unread-count')
  async countUnRead(@CurrentUser() user: AccessTokenPayload) {
    return this.notificationService.countUnRead(user);
  }
}
