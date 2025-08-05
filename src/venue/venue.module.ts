import { Module } from '@nestjs/common';
import { VenueService } from './venue.service';
import { VenueController } from './venue.controller';
import { AdminVenueController } from './admin-venue.controller';
import { NotificationModule } from 'src/notification/notification.module';

@Module({
  imports: [NotificationModule],
  providers: [VenueService],
  controllers: [VenueController, AdminVenueController],
  exports: [VenueService],
})
export class VenueModule {}
