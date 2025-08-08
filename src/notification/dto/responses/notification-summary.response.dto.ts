export class NotificationSummaryResponse {
  id: number;
  receiverId: number;
  title: string;
  type: string;
  message: string;
  isRead: boolean;
  createdAt: Date;
}
