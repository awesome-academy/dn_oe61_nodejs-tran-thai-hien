import { MailErrorCode } from '../constants/mail-error.constant';

export class MailException extends Error {
  constructor(
    public code: MailErrorCode,
    public detail?: object | string,
  ) {
    super(code);
  }
}
