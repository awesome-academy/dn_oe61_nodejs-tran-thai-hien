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
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { AccessTokenPayload } from 'src/auth/interfaces/access-token-payload';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ApiResponseGetVenue } from 'src/swagger/examples/venues/get-venue.example';
import { ApiResponseUpdateStatusVenue } from 'src/swagger/examples/venues/update-status-venue.example';
import { ApiResponseGetDetailVenues } from 'src/swagger/examples/venues/get-detail-venue.example';
@ApiTags('admin-venues')
@Controller('admin/venues')
export class AdminVenueController {
  constructor(private readonly venueService: VenueService) {}
  @ApiBearerAuth('access-token')
  @ApiResponseGetVenue()
  @HasRole(Role.MODERATOR, Role.ADMIN)
  @Get()
  async findVenues(@Query() query: QueryParamDto) {
    return await this.venueService.findVenues(query);
  }
  @ApiBearerAuth('access-token')
  @ApiResponseUpdateStatusVenue()
  @HasRole(Role.MODERATOR, Role.ADMIN)
  @Patch(':id/block')
  async blockVenue(
    @CurrentUser() user: AccessTokenPayload,
    @Param('id', ParseIntPipe) venueId: number,
    @Body() dto: StatusVenueUpdateRequestDto,
  ) {
    return await this.venueService.changeStatusVenue(
      user,
      venueId,
      dto,
      ActionStatus.BLOCK,
    );
  }
  @ApiBearerAuth('access-token')
  @ApiResponseUpdateStatusVenue()
  @HasRole(Role.MODERATOR, Role.ADMIN)
  @Patch(':id/approve')
  async approveVenue(
    @CurrentUser() user: AccessTokenPayload,
    @Param('id', ParseIntPipe) venueId: number,
    @Body() dto: StatusVenueUpdateRequestDto,
  ) {
    return await this.venueService.changeStatusVenue(
      user,
      venueId,
      dto,
      ActionStatus.APPROVE,
    );
  }
  @ApiBearerAuth('access-token')
  @ApiResponseUpdateStatusVenue()
  @HasRole(Role.MODERATOR, Role.ADMIN)
  @Patch(':id/reject')
  async rejectedVenue(
    @CurrentUser() user: AccessTokenPayload,
    @Param('id', ParseIntPipe) venueId: number,
    @Body() dto: StatusVenueUpdateRequestDto,
  ) {
    return await this.venueService.changeStatusVenue(
      user,
      venueId,
      dto,
      ActionStatus.REJECTED,
    );
  }
  @ApiBearerAuth('access-token')
  @ApiResponseGetDetailVenues()
  @HasRole(Role.MODERATOR, Role.ADMIN)
  @Get(':id')
  async findDetailVenue(@Param('id', ParseIntPipe) venueId: number) {
    return await this.venueService.findDetailVenue(venueId);
  }
}
