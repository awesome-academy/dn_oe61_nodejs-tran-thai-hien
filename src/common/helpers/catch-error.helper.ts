import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { PrismaError } from '../enums/prisma-error.enum';
import { CustomLogger } from '../logger/custom-logger.service';
import { ConflictException } from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';

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
