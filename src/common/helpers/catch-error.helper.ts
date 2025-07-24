import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { PrismaError } from '../enums/prisma-error.enum';

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
