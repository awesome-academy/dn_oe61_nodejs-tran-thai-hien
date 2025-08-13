import { Controller, Get, Render } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiExcludeEndpoint } from '@nestjs/swagger';
import { AccessTokenPayload } from 'src/auth/interfaces/access-token-payload';
import { SOCKET_URL_DEFAULT } from 'src/common/constants/socket.constant';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { IsPublicRoute } from 'src/common/decorators/public-route.decorator';

@Controller('dashboard')
export class DashboardController {
  constructor(private readonly configService: ConfigService) {}
  @ApiExcludeEndpoint()
  @IsPublicRoute()
  @Get('')
  @Render('pages/dashboard')
  getDashboard() {
    const socketUrl = this.configService.get<string>(
      'socket.url',
      SOCKET_URL_DEFAULT,
    );
    return {
      socketUrl: socketUrl,
    };
  }
  statistics() {}
  @IsPublicRoute()
  @ApiExcludeEndpoint()
  @Get('chat')
  @Render('pages/chat')
  chat() {
    const socketUrl = this.configService.get<string>(
      'socket.url',
      SOCKET_URL_DEFAULT,
    );
    return {
      socketUrl: socketUrl,
    };
  }
  @ApiExcludeEndpoint()
  @Get('users')
  @Render('pages/manage-user')
  manageUsers(@CurrentUser() user: AccessTokenPayload) {
    const socketUrl = this.configService.get<string>(
      'socket.url',
      SOCKET_URL_DEFAULT,
    );
    return {
      socketUrl: socketUrl,
      currentUser: user,
    };
  }
  @ApiExcludeEndpoint()
  @Get('venues')
  @Render('pages/manage-venue')
  manageVenues(@CurrentUser() user: AccessTokenPayload) {
    const socketUrl = this.configService.get<string>(
      'socket.url',
      SOCKET_URL_DEFAULT,
    );
    return {
      socketUrl: socketUrl,
      currentUser: user,
    };
  }
  @ApiExcludeEndpoint()
  @Get('venues/:id')
  @Render('pages/detail-venue')
  detailVenue(@CurrentUser() user: AccessTokenPayload) {
    const socketUrl = this.configService.get<string>(
      'socket.url',
      SOCKET_URL_DEFAULT,
    );
    return {
      socketUrl: socketUrl,
      currentUser: user,
    };
  }
}
