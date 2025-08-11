import { Controller, Get, Render, UseFilters } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiExcludeEndpoint } from '@nestjs/swagger';
import { AccessTokenPayload } from 'src/auth/interfaces/access-token-payload';
import { SOCKET_URL_DEFAULT } from 'src/common/constants/socket.constant';
import { BOOKING_STATUSES } from 'src/common/constants/status-template.constant';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { HasRole } from 'src/common/decorators/role.decorator';
import { Role } from 'src/common/enums/role.enum';
import { RedirectUnauthorizedFilter } from 'src/common/filters/redirect-unauthorized-exception.filter';

@Controller('dashboard')
export class DashboardController {
  constructor(private readonly configService: ConfigService) {}
  @ApiExcludeEndpoint()
  @UseFilters(RedirectUnauthorizedFilter)
  @Get('')
  @HasRole(Role.ADMIN, Role.MODERATOR)
  @Render('pages/dashboard')
  getDashboard(@CurrentUser() user: AccessTokenPayload) {
    const socketUrl = this.configService.get<string>(
      'socket.url',
      SOCKET_URL_DEFAULT,
    );
    return {
      currentUser: user,
      socketUrl: socketUrl,
    };
  }
  statistics() {}
  @UseFilters(RedirectUnauthorizedFilter)
  @ApiExcludeEndpoint()
  @Get('chat')
  @Render('pages/chat')
  chat(@CurrentUser() user: AccessTokenPayload) {
    const socketUrl = this.configService.get<string>(
      'socket.url',
      SOCKET_URL_DEFAULT,
    );
    return {
      currentUser: user,
      socketUrl: socketUrl,
    };
  }
  @ApiExcludeEndpoint()
  @UseFilters(RedirectUnauthorizedFilter)
  @HasRole(Role.ADMIN, Role.MODERATOR)
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
  @UseFilters(RedirectUnauthorizedFilter)
  @HasRole(Role.ADMIN, Role.MODERATOR)
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
  @UseFilters(RedirectUnauthorizedFilter)
  @HasRole(Role.ADMIN, Role.MODERATOR)
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
  @ApiExcludeEndpoint()
  @UseFilters(RedirectUnauthorizedFilter)
  @HasRole(Role.ADMIN, Role.MODERATOR)
  @Get('bookings')
  @Render('pages/manage-booking')
  manageBookings(@CurrentUser() user: AccessTokenPayload) {
    const socketUrl = this.configService.get<string>(
      'socket.url',
      SOCKET_URL_DEFAULT,
    );
    return {
      statuses: BOOKING_STATUSES,
      socketUrl: socketUrl,
      currentUser: user,
    };
  }
  @ApiExcludeEndpoint()
  @UseFilters(RedirectUnauthorizedFilter)
  @HasRole(Role.ADMIN, Role.MODERATOR)
  @Get('payments')
  @Render('pages/manage-payment')
  managePayments(@CurrentUser() user: AccessTokenPayload) {
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
