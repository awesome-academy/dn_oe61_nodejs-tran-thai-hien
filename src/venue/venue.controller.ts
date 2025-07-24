import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { AccessTokenPayload } from 'src/auth/interfaces/access-token-payload';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { VenueCreationRequestDto } from './dto/requests/venue-creation.request.dto';
import { VenueService } from './venue.service';
import { QueryParamDto } from 'src/common/constants/query-param.dto';
import { VenueUpdateRequestDto } from './dto/requests/venue-update.request.dto';

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
  async findVenues(@Query() query: QueryParamDto) {
    return await this.venueService.findVenues(query);
  }
  @Get('/me')
  async findVenuesByOwner(
    @CurrentUser() user: AccessTokenPayload,
    @Query() query: QueryParamDto,
  ) {
    return await this.venueService.findVenuesByOwner(user, query);
  }
  @Patch(':id')
  async update(
    @CurrentUser() user: AccessTokenPayload,
    @Param('id', ParseIntPipe) venueId: number,
    @Body() dto: VenueUpdateRequestDto,
  ) {
    return await this.venueService.update(user, venueId, dto);
  }
  @Delete(':id')
  async delete(
    @CurrentUser() user: AccessTokenPayload,
    @Param('id', ParseIntPipe) venueId: number,
  ) {
    return await this.venueService.delete(user, venueId);
  }
}
