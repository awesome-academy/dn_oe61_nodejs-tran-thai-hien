import { Controller, Get, Res } from '@nestjs/common';
import { AppService } from './app.service';
import { AccessTokenPayload } from './auth/interfaces/access-token-payload';
import { CurrentUser } from './common/decorators/current-user.decorator';
import { Response } from 'express';
import { Role } from './common/enums/role.enum';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}
  @Get('/')
  root(@CurrentUser() user: AccessTokenPayload, @Res() res: Response) {
    if (
      user &&
      (user.role == Role.ADMIN.toString() ||
        user.role == Role.MODERATOR.toString())
    ) {
      return res.redirect('/dashboard');
    } else {
      return res.redirect('/dashboard/chat');
    }
  }
}
