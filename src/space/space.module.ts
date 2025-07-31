import { Module } from '@nestjs/common';
import { SpaceController } from './space.controller';
import { SpaceService } from './space.service';

@Module({
  providers: [SpaceService],
  controllers: [SpaceController],
})
export class SpaceModule {}
