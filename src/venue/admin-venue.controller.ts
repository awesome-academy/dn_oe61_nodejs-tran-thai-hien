import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Query,
} from '@nestjs/common';
import { HasRole } from 'src/common/decorators/role.decorator';
import { Role } from 'src/common/enums/role.enum';
import { StatusVenueUpdateRequestDto } from './dto/requests/status-venue-update.request.dto';
import { VenueService } from './venue.service';
import { ActionStatus } from './enums/action-status.enum';
import { QueryParamDto } from 'src/common/constants/query-param.dto';

@Controller('admin/venues')
export class AdminVenueController {
  constructor(private readonly venueService: VenueService) {}
  @HasRole(Role.MODERATOR, Role.ADMIN)
  @Get()
  async findVenues(@Query() query: QueryParamDto) {
    return await this.venueService.findVenues(query);
  }
  @HasRole(Role.MODERATOR, Role.ADMIN)
  @Patch(':id/block')
  async blockVenue(
    @Param('id', ParseIntPipe) venueId: number,
    @Body() dto: StatusVenueUpdateRequestDto,
  ) {
    return await this.venueService.changeStatusVenue(
      venueId,
      dto,
      ActionStatus.BLOCK,
    );
  }
  @HasRole(Role.MODERATOR, Role.ADMIN)
  @Patch(':id/approve')
  async approveVenue(
    @Param('id', ParseIntPipe) venueId: number,
    @Body() dto: StatusVenueUpdateRequestDto,
  ) {
    return await this.venueService.changeStatusVenue(
      venueId,
      dto,
      ActionStatus.APPROVE,
    );
  }
  @HasRole(Role.MODERATOR, Role.ADMIN)
  @Get(':id')
  async findDetailVenue(@Param('id', ParseIntPipe) venueId: number) {
    return await this.venueService.findDetailVenue(venueId);
  }
}
