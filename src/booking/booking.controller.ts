import {
  Body,
  Controller,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AccessTokenPayload } from 'src/auth/interfaces/access-token-payload';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { SpaceOwnerOrManagerGuard } from 'src/common/guards/space-owner-or-manager-guard.guard';
import { BookingService } from './booking.service';
import { BookingCreationRequestDto } from './dto/requests/booking-creation-request.dto';

@Controller('bookings')
export class BookingController {
  constructor(private readonly bookingService: BookingService) {}
  @Post()
  async create(
    @CurrentUser() user: AccessTokenPayload,
    @Body() dto: BookingCreationRequestDto,
  ) {
    return await this.bookingService.create(user, dto);
  }
  @UseGuards(SpaceOwnerOrManagerGuard)
  @Patch(':bookingId/confirm')
  async confirmBooking(@Param('bookingId') bookingId: number) {
    return await this.bookingService.confirmBooking(bookingId);
  }
  @UseGuards(SpaceOwnerOrManagerGuard)
  @Patch(':bookingId/reject')
  async rejectBooking(@Param('bookingId') bookingId: number) {
    return await this.bookingService.rejectBooking(bookingId);
  }
}
