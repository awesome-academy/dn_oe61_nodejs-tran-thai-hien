import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Query,
} from '@nestjs/common';
import { UserService } from './user.service';
import { I18nService } from 'nestjs-i18n';
import { ConfigService } from '@nestjs/config';
import { HasRole } from 'src/common/decorators/role.decorator';
import { Role } from 'src/common/enums/role.enum';
import { MessageResource } from 'src/common/decorators/resource.decorator';
import { StatusUpdateRequestDto } from './dto/requests/status-update.dto';
import { VerifyUpdateRequestDto } from './dto/requests/verify-update.dto';
import { RoleUpdateRequestDto } from './dto/requests/role-update.dto';
import { QueryParamDto } from 'src/common/constants/query-param.dto';
import { ApiResponseGetListVenue } from 'src/swagger/examples/venues/get-list-venue.example copy';
import { ApiResponseStatusUpdate } from 'src/swagger/examples/users/status-update.example';
import { ApiResponseChangeVerifyExample } from 'src/swagger/examples/users/change-verify.example';
import { ApiResponseChangeRoleExample } from 'src/swagger/examples/users/change-role.example';
import { ApiBearerAuth } from '@nestjs/swagger';

@Controller('admin/users')
export class AdminUserController {
  constructor(
    private readonly userService: UserService,
    private readonly i18nService: I18nService,
    private readonly configService: ConfigService,
  ) {}
  @ApiBearerAuth('access-token')
  @ApiResponseStatusUpdate()
  @HasRole(Role.MODERATOR, Role.ADMIN)
  @Patch('/:id/status')
  @MessageResource('user', 'changeStatus')
  async changeStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: StatusUpdateRequestDto,
  ) {
    return this.userService.changeStatus(id, dto);
  }
  @ApiBearerAuth('access-token')
  @ApiResponseChangeVerifyExample()
  @HasRole(Role.MODERATOR, Role.ADMIN)
  @Patch('/:id/verify')
  async changeVerify(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: VerifyUpdateRequestDto,
  ) {
    return this.userService.changeVerify(id, dto);
  }
  @ApiBearerAuth('access-token')
  @ApiResponseChangeRoleExample()
  @HasRole(Role.ADMIN)
  @Patch('/:id/role')
  async changeRole(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: RoleUpdateRequestDto,
  ) {
    return this.userService.changeRole(id, dto);
  }
  @ApiBearerAuth('access-token')
  @ApiResponseGetListVenue()
  @HasRole(Role.MODERATOR, Role.ADMIN)
  @Get('/')
  async findUsers(@Query() query: QueryParamDto) {
    return this.userService.findUsers(query);
  }
}
