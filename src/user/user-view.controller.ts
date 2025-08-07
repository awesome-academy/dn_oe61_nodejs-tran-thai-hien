import { Controller, Get, Render } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IsPublicRoute } from 'src/common/decorators/public-route.decorator';

@Controller('')
export class UserViewController {
  constructor(private readonly configService: ConfigService) {}
  @IsPublicRoute()
  @Get('/login')
  @Render('pages/login')
  login() {}
}
