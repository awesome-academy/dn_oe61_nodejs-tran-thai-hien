import { Controller, Get, Render } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiExcludeEndpoint } from '@nestjs/swagger';
import { SOCKET_URL_DEFAULT } from 'src/common/constants/socket.constant';
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
}
