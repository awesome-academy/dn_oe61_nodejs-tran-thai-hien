import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CustomLogger } from 'src/common/logger/custom-logger.service';

@Injectable()
export class NotificationService {
  constructor(
    private readonly configService: ConfigService,
    private readonly loggerService: CustomLogger,
  ) {}
}
