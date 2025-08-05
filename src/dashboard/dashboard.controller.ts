import { Controller, Get, Render } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IsPublicRoute } from 'src/common/decorators/public-route.decorator';

@Controller('dashboard')
export class DashboardController {
  constructor(private readonly configService: ConfigService) {}
  @IsPublicRoute()
  @Get('')
  @Render('pages/dashboard')
  getDashboard() {}
  statistics() {}
  @IsPublicRoute()
  @Get('chat')
  @Render('pages/chat')
  chat() {
    const socketUrl = this.configService.get<string>(
      'socket.url',
      'http://localhost:3000',
    );
    return {
      socketUrl: socketUrl,
    };
  }
}
