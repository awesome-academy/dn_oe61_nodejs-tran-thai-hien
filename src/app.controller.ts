import { Controller, Get, Res, UseFilters } from '@nestjs/common';
import { Response } from 'express';
import { AppService } from './app.service';
import { AccessTokenPayload } from './auth/interfaces/access-token-payload';
import { CurrentUser } from './common/decorators/current-user.decorator';
import { Role } from './common/enums/role.enum';
import { RedirectUnauthorizedFilter } from './common/filters/redirect-unauthorized-exception.filter';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}
  @Get('/')
  @UseFilters(RedirectUnauthorizedFilter)
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
