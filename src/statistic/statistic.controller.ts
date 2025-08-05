import { Controller, Get, Query } from '@nestjs/common';
import { StatisticBookingFilterDto } from './dto/requests/statistic-booking-filter.dto';
import { StatisticService } from './statistic.service';
import { StatisticRevenueFilterDto } from './dto/requests/statistic-revenue-filter.dto';
import { StatisticUserFilterDto } from './dto/requests/statistic-user-filter.dto';
import { TopBookingUserFilterDto } from './dto/requests/top-booking-user-filter.dto';
import { TopVenueFilterDto } from './dto/requests/top-venue-filter.dto';

@Controller('statistics')
export class StatisticController {
  constructor(private readonly statisticService: StatisticService) {}
  @Get('/bookings')
  async findStatisticBookings(@Query() query: StatisticBookingFilterDto) {
    return this.statisticService.statisticBookings(query);
  }
  @Get('/revenues')
  async findStatisticRevenues(@Query() query: StatisticRevenueFilterDto) {
    return this.statisticService.statisticRevenues(query);
  }
  @Get('/users')
  async findStatisticUsers(@Query() query: StatisticUserFilterDto) {
    return this.statisticService.statisticUsers(query);
  }
  @Get('/users/top-booking')
  async findTopBookingUsers(@Query() query: TopBookingUserFilterDto) {
    return this.statisticService.findTopBookingUsers(query);
  }
  @Get('/venues/top-booking')
  async findTopVenues(@Query() query: TopVenueFilterDto) {
    return this.statisticService.findTopVenue(query);
  }
}
