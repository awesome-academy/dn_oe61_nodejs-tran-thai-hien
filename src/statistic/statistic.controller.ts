import { Controller, Get, Query } from '@nestjs/common';
import { StatisticBookingFilterDto } from './dto/requests/statistic-booking-filter.dto';
import { StatisticService } from './statistic.service';
import { StatisticRevenueFilterDto } from './dto/requests/statistic-revenue-filter.dto';
import { StatisticUserFilterDto } from './dto/requests/statistic-user-filter.dto';
import { TopBookingUserFilterDto } from './dto/requests/top-booking-user-filter.dto';
import { TopVenueFilterDto } from './dto/requests/top-venue-filter.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ApiResponseViewStatisticBooking } from 'src/swagger/examples/statistics/view-statistic-booking.example';
import { ApiResponseViewStatisticRevenue } from 'src/swagger/examples/statistics/view-statistic-venue.example';
import { ApiResponseViewStatisticUser } from 'src/swagger/examples/statistics/view-statistic-user.example';
import { ApiResponseViewTopVenue } from 'src/swagger/examples/statistics/view-top-venue.example';
import { ApiResponseViewTopBooking } from 'src/swagger/examples/statistics/view-top-booking.example';
import { ApiResponseViewStatisticSummary } from 'src/swagger/examples/statistics/view-statistic-summary.example';
@ApiTags('statistics')
@Controller('statistics')
export class StatisticController {
  constructor(private readonly statisticService: StatisticService) {}
  @ApiBearerAuth('access-token')
  @ApiResponseViewStatisticBooking()
  @Get('/bookings')
  async findStatisticBookings(@Query() query: StatisticBookingFilterDto) {
    return this.statisticService.statisticBookings(query);
  }
  @ApiBearerAuth('access-token')
  @ApiResponseViewStatisticRevenue()
  @Get('/revenues')
  async findStatisticRevenues(@Query() query: StatisticRevenueFilterDto) {
    return this.statisticService.statisticRevenues(query);
  }
  @ApiBearerAuth('access-token')
  @ApiResponseViewStatisticUser()
  @Get('/users')
  async findStatisticUsers(@Query() query: StatisticUserFilterDto) {
    return this.statisticService.statisticUsers(query);
  }
  @ApiBearerAuth('access-token')
  @ApiResponseViewTopBooking()
  @Get('/users/top-booking')
  async findTopBookingUsers(@Query() query: TopBookingUserFilterDto) {
    return this.statisticService.findTopBookingUsers(query);
  }
  @ApiBearerAuth('access-token')
  @ApiResponseViewTopVenue()
  @Get('/venues/top-booking')
  async findTopVenues(@Query() query: TopVenueFilterDto) {
    return this.statisticService.findTopVenue(query);
  }
  @ApiBearerAuth('access-token')
  @ApiResponseViewStatisticSummary()
  @Get('')
  async statisticSummary() {
    return this.statisticService.statisticSummary();
  }
}
