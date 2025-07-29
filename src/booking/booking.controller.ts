import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AccessTokenPayload } from 'src/auth/interfaces/access-token-payload';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { SpaceOwnerOrManagerGuard } from 'src/common/guards/space-owner-or-manager-guard.guard';
import { BookingService } from './booking.service';
import { BookingCreationRequestDto } from './dto/requests/booking-creation-request.dto';
import { QueryParamDto } from 'src/common/constants/query-param.dto';
import { BookingFilterRequestDto } from './dto/requests/booking-filter-request.dto';
import { HasRole } from 'src/common/decorators/role.decorator';
import { Role } from 'src/common/enums/role.enum';

@Controller('bookings')
export class BookingController {
  constructor(private readonly bookingService: BookingService) {}
  @Post()
  async create(
    @CurrentUser() user: AccessTokenPayload,
    @Body() dto: BookingCreationRequestDto,
  ) {
    return this.bookingService.create(user, dto);
  }
  @UseGuards(SpaceOwnerOrManagerGuard)
  @Patch(':bookingId/confirm')
  async confirmBooking(@Param('bookingId', ParseIntPipe) bookingId: number) {
    return this.bookingService.confirmBooking(bookingId);
  }
  @UseGuards(SpaceOwnerOrManagerGuard)
  @Patch(':bookingId/reject')
  async rejectBooking(@Param('bookingId', ParseIntPipe) bookingId: number) {
    return this.bookingService.rejectBooking(bookingId);
  }
  @Get('/history')
  async findBookingHistory(
    @CurrentUser() user: AccessTokenPayload,
    @Query() query: QueryParamDto,
  ) {
    return this.bookingService.findBookingHistory(user, query);
  }
  @Get('/managed-spaces')
  async findSpaceBookingStates(
    @CurrentUser() user: AccessTokenPayload,
    @Query() filter: BookingFilterRequestDto,
  ) {
    return this.bookingService.findSpaceBookingStates(user, filter);
  }
  @HasRole(Role.MODERATOR, Role.ADMIN)
  @Get('')
  async findBookings(@Query() filter: BookingFilterRequestDto) {
    return this.bookingService.findBookings(filter);
  }
}
