import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AccessTokenPayload } from 'src/auth/interfaces/access-token-payload';
import { QueryParamDto } from 'src/common/constants/query-param.dto';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { ApiResponseCreateVenue } from 'src/swagger/examples/venues/create-venue.example';
import { ApiResponseGetPublicVenue } from 'src/swagger/examples/venues/get-public-venue.example';
import { ApiResponseUpdateVenue } from 'src/swagger/examples/venues/update-venue.example';
import { VenueCreationRequestDto } from './dto/requests/venue-creation.request.dto';
import { VenueMapFilterDto } from './dto/requests/venue-filter-map.request.dto';
import { VenueUpdateRequestDto } from './dto/requests/venue-update.request.dto';
import { VenueService } from './venue.service';
import { ApiResponseGetVenueMap } from 'src/swagger/examples/venues/get--venue-map.example';
import { ApiResponseGetVenueNearby } from 'src/swagger/examples/venues/get--venue-nearby.example';
import { ApiResponseGetVenueByMe } from 'src/swagger/examples/venues/get-venue-me.example';
import { ApiResponseGetPublicDetailVenues } from 'src/swagger/examples/venues/get-public-detail-venue.example';
@ApiTags('venues')
@Controller('venues')
export class VenueController {
  constructor(private readonly venueService: VenueService) {}
  @ApiBearerAuth('access-token')
  @ApiResponseCreateVenue()
  @Post()
  async create(
    @CurrentUser() user: AccessTokenPayload,
    @Body() dto: VenueCreationRequestDto,
  ) {
    return this.venueService.create(user, dto);
  }
  @ApiBearerAuth('access-token')
  @ApiResponseGetPublicVenue()
  @Get()
  async findPublicVenues(@Query() query: QueryParamDto) {
    return this.venueService.findVenues(query);
  }
  @ApiBearerAuth('access-token')
  @ApiResponseGetVenueMap()
  @Get('/map')
  async findVenuesMap(@Query() query: QueryParamDto) {
    return this.venueService.findVenuesForMap(query);
  }
  @ApiBearerAuth('access-token')
  @ApiResponseGetVenueNearby()
  @Get('/nearby')
  async findNearByVenues(@Query() query: VenueMapFilterDto) {
    return this.venueService.findNearByVenues(query);
  }
  @ApiBearerAuth('access-token')
  @ApiResponseGetVenueByMe()
  @Get('/me')
  async findVenuesByOwner(
    @CurrentUser() user: AccessTokenPayload,
    @Query() query: QueryParamDto,
  ) {
    return this.venueService.findVenuesByOwner(user, query);
  }
  @ApiBearerAuth('access-token')
  @ApiResponseGetPublicDetailVenues()
  @Get(':id')
  async findDetailPublicVenue(
    @CurrentUser() user: AccessTokenPayload,
    @Param('id', ParseIntPipe) venueId: number,
  ) {
    return this.venueService.findDetailPublicVenue(user, venueId);
  }
  @ApiBearerAuth('access-token')
  @ApiResponseUpdateVenue()
  @Patch(':id')
  async updateVenue(
    @CurrentUser() user: AccessTokenPayload,
    @Param('id', ParseIntPipe) venueId: number,
    @Body() dto: VenueUpdateRequestDto,
  ) {
    return this.venueService.update(user, venueId, dto);
  }
}
