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
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly authService: AuthService,
    private readonly prismaService: PrismaService,
    private readonly reflector: Reflector,
    private readonly i18nService: I18nService,
  ) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    if (isPublicRoute(this.reflector, context)) {
      request['public_route'] = true;
      return true;
    }
    let token = extractTokenFromHeader(request);
    if (!token && request.cookies) {
      token = request.cookies['accessToken'] as string;
    }
    if (!token)
      throw new UnauthorizedException(
        this.i18nService.translate('common.token.missing'),
      );
    const existedTokenFromBlackList =
      await this.prismaService.tokenBlackList.findUnique({
        where: {
          token: token,
        },
      });
    if (existedTokenFromBlackList)
      throw new UnauthorizedException(
        this.i18nService.translate('common.request.errors.tokenInvalidExpired'),
      );
    const user = await this.authService.verifyToken(token);
    request['user'] = user;
    return true;
  }
}
