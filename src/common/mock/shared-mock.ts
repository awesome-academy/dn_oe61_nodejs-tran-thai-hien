import { I18nService } from 'nestjs-i18n';
import { PrismaService } from 'src/prisma/prisma.service';
import { CustomLogger } from '../logger/custom-logger.service';

export const prismaMock = {
  $connect: jest.fn(),
  $disconnect: jest.fn(),
  $on: jest.fn(),
  $transaction: jest.fn(),
  $use: jest.fn(),
  onModuleInit: jest.fn(),
  databaseUrl: '',
} as unknown as PrismaService;

export const i18nMock = {
  t: jest.fn((key: string) => key),
  translate: jest.fn((key: string) => key),
} as unknown as I18nService;

export const customLoggerMock = {
  log: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  debug: jest.fn(),
  verbose: jest.fn(),
} as unknown as CustomLogger;
