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
import { AccessTokenPayload } from 'src/auth/interfaces/access-token-payload';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { SpaceCreationRequestDto } from './dto/requests/space-creation-request.dto';
import { SpaceService } from './space.service';
import { AddManageSpaceRequestDto } from './dto/requests/add-manage-space-request.dto';
import { SpaceFilterRequestDto } from './dto/requests/space-filter-request.dto';

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
  async getPublicSpaces(@Query() filter: SpaceFilterRequestDto) {
    return await this.spaceService.findPublicSpaces(filter);
  }
}
