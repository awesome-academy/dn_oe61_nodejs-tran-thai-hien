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
import { BookingRejectRequestDto } from './dto/requests/booking-reject-request.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ApiResponseCreateBookingExample } from 'src/swagger/examples/bookings/create-booking.example';
import { ApiResponseConfirmBookingExample } from 'src/swagger/examples/bookings/confirm-booking.example';
import { ApiResponseRejectBookingExample } from 'src/swagger/examples/bookings/reject-booking.example';
import { ApiResponseCancelBookingExample } from 'src/swagger/examples/bookings/cancel-booking.example';
import { ApiResponseGetHistoryExample } from 'src/swagger/examples/bookings/get-history-booking.example';
import { ApiResponseGetBookingManagedExample } from 'src/swagger/examples/bookings/get-booking-managed.example';
import { ApiResponseGetBookingExample } from 'src/swagger/examples/bookings/get-booking-example';
import { ApiResponseGetBookingStatusCount } from 'src/swagger/examples/bookings/get-booking-status-count.example';
@ApiTags('bookings')
@Controller('bookings')
export class BookingController {
  constructor(private readonly bookingService: BookingService) {}
  @ApiBearerAuth('access-token')
  @ApiResponseCreateBookingExample()
  @Post()
  async create(
    @CurrentUser() user: AccessTokenPayload,
    @Body() dto: BookingCreationRequestDto,
  ) {
    return this.bookingService.create(user, dto);
  }
  @ApiBearerAuth('access-token')
  @ApiResponseConfirmBookingExample()
  @UseGuards(SpaceOwnerOrManagerGuard)
  @Patch(':bookingId/confirm')
  async confirmBooking(@Param('bookingId', ParseIntPipe) bookingId: number) {
    return this.bookingService.confirmBooking(bookingId);
  }
  @ApiBearerAuth('access-token')
  @ApiResponseRejectBookingExample()
  @UseGuards(SpaceOwnerOrManagerGuard)
  @Patch(':bookingId/reject')
  async rejectBooking(
    @Param('bookingId') bookingId: number,
    @Body() dto: BookingRejectRequestDto,
  ) {
    return this.bookingService.rejectBooking(bookingId, dto);
  }
  @ApiBearerAuth('access-token')
  @ApiResponseCancelBookingExample()
  @Patch(':bookingId/cancel')
  async cancelBooking(
    @Param('bookingId', ParseIntPipe) bookingId: number,
    @CurrentUser() user: AccessTokenPayload,
  ) {
    return this.bookingService.cancelBooking(user, bookingId);
  }
  @ApiBearerAuth('access-token')
  @ApiResponseGetHistoryExample()
  @Get('/history')
  async findBookingHistory(
    @CurrentUser() user: AccessTokenPayload,
    @Query() query: QueryParamDto,
  ) {
    return this.bookingService.findBookingHistory(user, query);
  }
  @ApiBearerAuth('access-token')
  @ApiResponseGetBookingManagedExample()
  @Get('/managed-spaces')
  async findSpaceBookingStates(
    @CurrentUser() user: AccessTokenPayload,
    @Query() filter: BookingFilterRequestDto,
  ) {
    return this.bookingService.findSpaceBookingStates(user, filter);
  }
  @ApiBearerAuth('access-token')
  @ApiResponseGetBookingExample()
  @HasRole(Role.MODERATOR, Role.ADMIN)
  @Get('')
  async findBookings(@Query() filter: BookingFilterRequestDto) {
    return this.bookingService.findBookings(filter);
  }
  @ApiBearerAuth('access-token')
  @ApiResponseGetBookingStatusCount()
  @HasRole(Role.MODERATOR, Role.ADMIN)
  @Get('/status')
  async getBookingStatusCount(@Query() filter: BookingFilterRequestDto) {
    return this.bookingService.getBookingStatusCount(filter);
  }
}
