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
  UseGuards,
} from '@nestjs/common';
import { AccessTokenPayload } from 'src/auth/interfaces/access-token-payload';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { SpaceCreationRequestDto } from './dto/requests/space-creation-request.dto';
import { SpaceService } from './space.service';
import { AddManageSpaceRequestDto } from './dto/requests/add-manage-space-request.dto';
import { SpaceFilterRequestDto } from './dto/requests/space-filter-request.dto';
import { SpaceUpdateRequestDto } from './dto/requests/space-update-request.dto';
import { SpaceOwnerOrManagerGuard } from 'src/common/guards/space-owner-or-manager-guard.guard';

@Controller('spaces')
export class SpaceController {
  constructor(private readonly spaceService: SpaceService) {}
  @Post()
  async create(
    @CurrentUser() user: AccessTokenPayload,
    @Body() dto: SpaceCreationRequestDto,
  ) {
    return await this.spaceService.create(user, dto);
  }
  @Patch(':id/managers')
  async addManagers(
    @CurrentUser() user: AccessTokenPayload,
    @Param('id', ParseIntPipe) spaceId: number,
    @Body() dto: AddManageSpaceRequestDto,
  ) {
    return await this.spaceService.addManagers(user, spaceId, dto);
  }
  @Get()
  async findPublicSpaces(@Query() filter: SpaceFilterRequestDto) {
    return await this.spaceService.findPublicSpaces(filter);
  }
  @Get('/me')
  async findSpacesByManager(
    @CurrentUser() user: AccessTokenPayload,
    @Query() filter: SpaceFilterRequestDto,
  ) {
    return await this.spaceService.findSpacesByManagers(user, filter);
  }
  @Get(':id')
  async findDetailPublicSpace(@Param('id', ParseIntPipe) spaceId: number) {
    return await this.spaceService.findDetailPublicSpace(spaceId);
  }
  @UseGuards(SpaceOwnerOrManagerGuard)
  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) spaceId: number,
    @Body() dto: SpaceUpdateRequestDto,
  ) {
    return await this.spaceService.update(spaceId, dto);
  }
  @UseGuards(SpaceOwnerOrManagerGuard)
  @Delete(':id')
  async delete(@Param('id', ParseIntPipe) spaceId: number) {
    return await this.spaceService.delete(spaceId);
  }
}
