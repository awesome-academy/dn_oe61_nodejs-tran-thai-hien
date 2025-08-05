import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
} from '@nestjs/common';
import { AccessTokenPayload } from 'src/auth/interfaces/access-token-payload';
import { QueryParamDto } from 'src/common/constants/query-param.dto';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { VenueCreationRequestDto } from './dto/requests/venue-creation.request.dto';
import { VenueService } from './venue.service';
import { VenueMapFilterDto } from './dto/requests/venue-filter-map.request.dto';

@Controller('venues')
export class VenueController {
  constructor(private readonly venueService: VenueService) {}
  @Post()
  async create(
    @CurrentUser() user: AccessTokenPayload,
    @Body() dto: VenueCreationRequestDto,
  ) {
    return this.venueService.create(user, dto);
  }
  @Get()
  async findPublicVenues(@Query() query: QueryParamDto) {
    return this.venueService.findVenues(query);
  }
  @Get('/map')
  async findVenuesMap(@Query() query: QueryParamDto) {
    return this.venueService.findVenuesForMap(query);
  }
  @Get('/nearby')
  async findNearByVenues(@Query() query: VenueMapFilterDto) {
    return this.venueService.findNearByVenues(query);
  }
  @Get('/me')
  async findVenuesByOwner(
    @CurrentUser() user: AccessTokenPayload,
    @Query() query: QueryParamDto,
  ) {
    return this.venueService.findVenuesByOwner(user, query);
  }
  @Get(':id')
  async findDetailPublicVenue(
    @CurrentUser() user: AccessTokenPayload,
    @Param('id', ParseIntPipe) venueId: number,
  ) {
    return this.venueService.findDetailPublicVenue(user, venueId);
  }
}
