import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { CustomLogger } from 'src/common/logger/custom-logger.service';
import { NotificationCreationRequestDto } from './dto/requests/notification-creation-request.dto';
import { NotificationEvent } from './enums/notification-event.enum';
import { NotificationGateway } from './notification-gateway';
import { NotificationService } from './notification.service';

@Processor('notification')
export class NotificationProcessor extends WorkerHost {
  constructor(
    private readonly notificationGateway: NotificationGateway,
    private readonly loggerService: CustomLogger,
    private readonly notificationService: NotificationService,
  ) {
    super();
  }

  async process(job: Job<NotificationCreationRequestDto>): Promise<void> {
    const { name, data } = job;
    const handleNotification = async (eventName: NotificationEvent) => {
      try {
        const notificationCreated = await this.notificationService.create(data);
        this.notificationGateway.sendNotification(
          data.receiverId,
          notificationCreated,
        );
      } catch (error) {
        this.loggerService.error(
          `Send Noti [${eventName}] Failed`,
          `Caused: ${(error as Error).stack}`,
        );
      }
    };
    switch (name) {
      case NotificationEvent.VENUE_CREATED.toString():
        return handleNotification(NotificationEvent.VENUE_CREATED);
      case NotificationEvent.VENUE_APPROVED.toString():
        return handleNotification(NotificationEvent.VENUE_APPROVED);
      case NotificationEvent.VENUE_REJECTED.toString():
        return handleNotification(NotificationEvent.VENUE_REJECTED);
      case NotificationEvent.VENUE_BLOCKED.toString():
        return handleNotification(NotificationEvent.VENUE_BLOCKED);
      case NotificationEvent.BOOKING_CREATED.toString():
        return handleNotification(NotificationEvent.BOOKING_CREATED);
      case NotificationEvent.BOOKING_CANCELED.toString():
        return handleNotification(NotificationEvent.BOOKING_CANCELED);
      case NotificationEvent.NEW_MESSAGE.toString():
        return handleNotification(NotificationEvent.NEW_MESSAGE);
      case NotificationEvent.PAYMENT_SUCCESS.toString():
        return handleNotification(NotificationEvent.PAYMENT_SUCCESS);
      case NotificationEvent.PAYMENT_FAILED.toString():
        return handleNotification(NotificationEvent.PAYMENT_FAILED);
      default:
        this.loggerService.warn(`Unknown notification event: ${name}`);
    }
  }
}
