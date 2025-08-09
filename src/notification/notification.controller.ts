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
import { ApiResponseCreateNotification } from 'src/swagger/examples/notifications/create-notification.example';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ApiResponseGetMyNotificationExample } from 'src/swagger/examples/notifications/get-my-notification.example';
import { MarkAsReadNotificationExample } from 'src/swagger/examples/notifications/mark-read-notification.example';
import { ApiResponseGetCountUnreadExample } from 'src/swagger/examples/notifications/get-count-unread.example';
@ApiTags('notifications')
@Controller('notifications')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}
  @ApiBearerAuth('access-token')
  @ApiResponseCreateNotification()
  @Post('')
  async create(@Body() dto: NotificationCreationRequestDto) {
    return this.notificationService.create(dto);
  }
  @ApiBearerAuth('access-token')
  @ApiResponseGetMyNotificationExample()
  @Get('/me')
  async getMyNotification(
    @CurrentUser() user: AccessTokenPayload,
    @Query() filter: UserNotificationFilterDto,
  ) {
    return this.notificationService.getMyNotification(user, filter);
  }
  @ApiBearerAuth('access-token')
  @MarkAsReadNotificationExample()
  @Patch(':notifyId/read')
  async markAsRead(
    @CurrentUser() user: AccessTokenPayload,
    @Param('notifyId', ParseIntPipe) notifyId: number,
  ) {
    return this.notificationService.markAsRead(user, notifyId);
  }
  @ApiBearerAuth('access-token')
  @ApiResponseGetCountUnreadExample()
  @Get('/unread-count')
  async countUnRead(@CurrentUser() user: AccessTokenPayload) {
    return this.notificationService.countUnRead(user);
  }
}
