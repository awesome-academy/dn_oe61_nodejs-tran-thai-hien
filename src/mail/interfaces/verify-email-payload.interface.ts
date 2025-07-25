export interface VerifyEmailPayload {
  recipientUserName: string;
  recipientName?: string;
  token: string;
  expiresAt: string;
}
