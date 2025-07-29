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

@Controller('venues')
export class VenueController {
  constructor(private readonly venueService: VenueService) {}
  @Post()
  async create(
    @CurrentUser() user: AccessTokenPayload,
    @Body() dto: VenueCreationRequestDto,
  ) {
    return await this.venueService.create(user, dto);
  }
  @Get()
  async findPublicVenues(@Query() query: QueryParamDto) {
    return await this.venueService.findVenues(query);
  }
  @Get('/me')
  async findVenuesByOwner(
    @CurrentUser() user: AccessTokenPayload,
    @Query() query: QueryParamDto,
  ) {
    return await this.venueService.findVenuesByOwner(user, query);
  }
  @Get(':id')
  async findDetailPublicVenue(
    @CurrentUser() user: AccessTokenPayload,
    @Param('id', ParseIntPipe) venueId: number,
  ) {
    return await this.venueService.findDetailPublicVenue(user, venueId);
  }
}
