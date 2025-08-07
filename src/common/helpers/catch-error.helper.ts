import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { PrismaError } from '../enums/prisma-error.enum';
import { CustomLogger } from '../logger/custom-logger.service';
import { ConflictException } from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';
import { MailErrorCode } from 'src/mail/constants/mail-error.constant';

export function getErrorPrismaClient(
  error: PrismaClientKnownRequestError,
  context: string,
): string {
  switch (error.code) {
    case PrismaError.RECORD_NOT_FOUND.toString():
      return `[${context}] Record not found`;
    case PrismaError.FOREIGN_KEY_CONSTRAINT.toString():
      return `[${context}] Invalid foreign key `;
    case PrismaError.UNIQUE_CONSTRAINT.toString():
      return `[${context}] Duplicate value `;
    default:
      return `[${context}] Prisma client error `;
  }
}

export function logAndThrowPrismaClientError(
  error: Error,
  context: string,
  resource: string,
  functionName: string,
  statusKey: string,
  loggerService: CustomLogger,
  i18nService: I18nService,
): never {
  const errorPrismaClient = error as PrismaClientKnownRequestError;
  const message = getErrorPrismaClient(errorPrismaClient, functionName);
  loggerService.error(message, JSON.stringify(error), context);
  throw new ConflictException(
    i18nService.translate(
      `common.${resource}.action.${functionName}.${statusKey}`,
    ),
  );
}
export function getErrorMessageSendMail(code: MailErrorCode): string {
  switch (code) {
    case MailErrorCode.TIME_OUT:
      return 'The email sending request timed out';
    case MailErrorCode.TEMPLATE_ERROR:
      return 'The email template could not be loaded.';
    case MailErrorCode.INVALID_RECIPIENT:
      return 'The recipient email address is invalid.';
    case MailErrorCode.INVALID_PAYLOAD:
      return 'Payload send email invalid';
    default:
      return 'An unexpected error occurred while sending the email.';
  }
}
