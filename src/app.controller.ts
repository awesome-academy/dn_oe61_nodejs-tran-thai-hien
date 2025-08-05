import { Controller, Get, Render } from '@nestjs/common';
import { AppService } from './app.service';
import { render } from 'pug';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
  @Get('/main')
  @Render('layouts/main')
  getMain() {}
}
