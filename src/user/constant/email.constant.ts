export const SEND_MAIL_STATUS = {
  SENT: 'SENT',
  FAILED: 'FAILED',
} as const;
export type SendMailStatus =
  (typeof SEND_MAIL_STATUS)[keyof typeof SEND_MAIL_STATUS];
