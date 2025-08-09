import { ApiProperty } from '@nestjs/swagger';
import { NotificationType } from '@prisma/client';

export class NotificationSummaryResponse {
  @ApiProperty({
    description: 'Unique identifier of the notification',
    example: 1,
  })
  id: number;
  @ApiProperty({
    description: 'ID of the user who receives the notification',
    example: 42,
  })
  receiverId: number;

  @ApiProperty({
    description: 'Title of the notification',
    example: 'Venue Created',
  })
  title: string;

  @ApiProperty({
    description: 'Type of notification',
    example: NotificationType.VENUE_CREATED,
  })
  type: string;

  @ApiProperty({
    description: 'Detailed message of the notification',
    example:
      'Venue named ABC-space ID: 1 has been created by Thai Hien at 2025-04-29',
  })
  message: string;

  @ApiProperty({
    description: 'Indicates whether the notification has been read',
    example: false,
  })
  isRead: boolean;

  @ApiProperty({
    description: 'The date and time when the notification was created',
    example: '2025-08-09T08:30:00.000Z',
  })
  createdAt: Date;
}
