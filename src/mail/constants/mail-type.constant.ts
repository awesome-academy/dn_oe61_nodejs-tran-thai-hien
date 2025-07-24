export const MAIL_TYPE = {
  VERIFY_EMAIL: 'VERIFY_EMAIL',
  FORGOT_PASWORD: 'FORGOT_PASSWORD',
} as const;
export type MailType = (typeof MAIL_TYPE)[keyof typeof MAIL_TYPE];
