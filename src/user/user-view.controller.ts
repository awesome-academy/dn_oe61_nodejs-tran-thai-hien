import { Controller, Get, Render } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiExcludeEndpoint } from '@nestjs/swagger';
import { IsPublicRoute } from 'src/common/decorators/public-route.decorator';

@Controller('')
export class UserViewController {
  constructor(private readonly configService: ConfigService) {}
  @ApiExcludeEndpoint()
  @IsPublicRoute()
  @Get('/login')
  @Render('pages/login')
  login() {}
}
