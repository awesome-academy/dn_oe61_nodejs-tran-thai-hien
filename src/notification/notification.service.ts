import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Notification, Prisma } from '@prisma/client';
import { I18nService } from 'nestjs-i18n';
import { AccessTokenPayload } from 'src/auth/interfaces/access-token-payload';
import { SortDirection } from 'src/common/enums/query.enum';
import { StatusKey } from 'src/common/enums/status-key.enum';
import { logAndThrowPrismaClientError } from 'src/common/helpers/catch-error.helper';
import { queryWithPagination } from 'src/common/helpers/paginate.helper';
import { getUserOrFail } from 'src/common/helpers/user.helper';
import { BaseResponse } from 'src/common/interfaces/base-response';
import {
  FindOptions,
  PaginationParams,
  PaginationResult,
} from 'src/common/interfaces/paginate-type';
import { CustomLogger } from 'src/common/logger/custom-logger.service';
import { buildBaseResponse } from 'src/common/utils/data.util';
import { PrismaService } from 'src/prisma/prisma.service';
import { NotificationCreationRequestDto } from './dto/requests/notification-creation-request.dto';
import { UserNotificationFilterDto } from './dto/requests/user-notification-filter.dto';
import { NotificationSummaryResponse } from './dto/responses/notification-summary.response.dto';
import { NotificationGateway } from './notification-gateway';

@Injectable()
export class NotificationService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly loggerService: CustomLogger,
    private readonly i18nService: I18nService,
    private readonly notificationGateway: NotificationGateway,
  ) {}
  async create(
    dto: NotificationCreationRequestDto,
  ): Promise<NotificationSummaryResponse> {
    const receiver = await getUserOrFail(
      this.prismaService,
      this.i18nService,
      dto.receiverId,
    );
    const notificationData: Prisma.NotificationCreateInput = {
      receiver: {
        connect: {
          id: receiver.id,
        },
      },
      message: dto.message,
      title: dto.title,
      type: dto.type,
    };
    try {
      const notificationCreated = await this.prismaService.notification.create({
        data: notificationData,
      });
      return notificationCreated;
    } catch (error) {
      logAndThrowPrismaClientError(
        error as Error,
        NotificationService.name,
        'notification',
        'createNotification',
        StatusKey.FAILED,
        this.loggerService,
        this.i18nService,
      );
    }
  }
  async getMyNotification(
    user: AccessTokenPayload,
    filter: UserNotificationFilterDto,
  ): Promise<PaginationResult<NotificationSummaryResponse>> {
    const { page, pageSize } = filter;
    const userDetail = await getUserOrFail(
      this.prismaService,
      this.i18nService,
      user.sub,
    );
    const direction = SortDirection.DESC;
    const paginationParams = {
      page,
      pageSize,
    };
    const queryParams = {
      where: {
        receiverId: userDetail.id,
        deletedAt: null,
      },
      orderBy: {
        createdAt: direction,
      },
    };
    return this.getPaginatedNotification(paginationParams, queryParams);
  }
  async markAsRead(
    user: AccessTokenPayload,
    notifyId: number,
  ): Promise<BaseResponse<NotificationSummaryResponse>> {
    const userDetail = await getUserOrFail(
      this.prismaService,
      this.i18nService,
      user.sub,
    );
    const notificationById = await this.prismaService.notification.findUnique({
      where: {
        id: notifyId,
      },
    });
    if (!notificationById)
      throw new NotFoundException(
        this.i18nService.translate('common.notification.notFound'),
      );
    if (notificationById.receiverId !== userDetail.id)
      throw new ForbiddenException(
        this.i18nService.translate('common.auth.forbidden'),
      );
    if (notificationById.isRead === true)
      return buildBaseResponse(StatusKey.UNCHANGED);
    try {
      const notificationUpdated = await this.prismaService.notification.update({
        where: {
          id: notificationById.id,
        },
        data: {
          isRead: true,
        },
      });
      return buildBaseResponse(
        StatusKey.SUCCESS,
        this.buildNotificationSummaryResponse(notificationUpdated),
      );
    } catch (error) {
      logAndThrowPrismaClientError(
        error as Error,
        NotificationService.name,
        'notification',
        'markAsRead',
        StatusKey.FAILED,
        this.loggerService,
        this.i18nService,
      );
    }
  }
  async countUnRead(user: AccessTokenPayload): Promise<number> {
    const userDetail = await getUserOrFail(
      this.prismaService,
      this.i18nService,
      user.sub,
    );
    const notificationsUnRead = await this.prismaService.notification.findMany({
      where: {
        receiverId: userDetail.id,
        isRead: false,
      },
    });
    return notificationsUnRead.length;
  }
  sendNotification(receiverId: number, payload: NotificationSummaryResponse) {
    this.notificationGateway.sendNotification(receiverId, payload);
  }
  private buildNotificationSummaryResponse(
    data: Notification,
  ): NotificationSummaryResponse {
    return {
      id: data.id,
      receiverId: data.receiverId,
      title: data.title,
      type: data.type,
      message: data.message,
      isRead: data.isRead,
      createdAt: data.createdAt,
    };
  }
  private async getPaginatedNotification(
    paginationParams: PaginationParams,
    options: FindOptions,
  ): Promise<PaginationResult<NotificationSummaryResponse>> {
    try {
      const notifications = await queryWithPagination(
        this.prismaService.notification,
        paginationParams,
        options,
      );
      return {
        ...notifications,
        data: notifications.data.map((n: Notification) =>
          this.buildNotificationSummaryResponse(n),
        ),
      };
    } catch (exception) {
      logAndThrowPrismaClientError(
        exception as Error,
        NotificationService.name,
        'notification',
        'getMyNotification',
        StatusKey.FAILED,
        this.loggerService,
        this.i18nService,
      );
    }
  }
}
