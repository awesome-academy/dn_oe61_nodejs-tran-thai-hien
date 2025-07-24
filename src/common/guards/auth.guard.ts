import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { I18nService } from 'nestjs-i18n';
import { AuthService } from 'src/auth/auth.service';
import { isPublicRoute } from '../helpers/auth.helper';
import { extractTokenFromHeader } from '../utils/jwt.util';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly authService: AuthService,
    private readonly reflector: Reflector,
    private readonly i18nService: I18nService,
  ) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    if (isPublicRoute(this.reflector, context)) {
      request['public_route'] = true;
      return true;
    }
    const token = extractTokenFromHeader(request);
    if (!token)
      throw new UnauthorizedException(
        this.i18nService.translate('common.token.missing'),
      );
    const user = await this.authService.verifyToken(token);
    request['user'] = user;
    return true;
  }
}
