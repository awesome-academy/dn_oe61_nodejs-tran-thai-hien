import { I18nService } from 'nestjs-i18n';
import { CustomLogger } from 'src/common/logger/custom-logger.service';
import { PrismaService } from 'src/prisma/prisma.service';

export const PrismaMock = {
  $connect: jest.fn(),
  $disconnect: jest.fn(),
  $on: jest.fn(),
  $transaction: jest.fn(),
  $use: jest.fn(),
  onModuleInit: jest.fn(),
  databaseUrl: '',
} as unknown as PrismaService;

export const I18nMock = {
  t: jest.fn((key: string) => key),
  translate: jest.fn((key: string) => key),
} as unknown as I18nService;

export const CusstomLoggerMock = {
  log: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  debug: jest.fn(),
  verbose: jest.fn(),
} as unknown as CustomLogger;
