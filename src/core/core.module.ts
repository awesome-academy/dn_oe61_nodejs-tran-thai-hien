import { BullModule } from '@nestjs/bullmq';
import { Global, Module } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { CustomLogger } from 'src/common/logger/custom-logger.service';
@Global()
@Module({
  imports: [
    EventEmitterModule.forRoot(),
    BullModule.forRoot({
      connection: {
        host: 'localhost',
        port: 6379,
      },
    }),
  ],
  providers: [CustomLogger],
  exports: [CustomLogger, BullModule],
})
export class CoreModule {}
