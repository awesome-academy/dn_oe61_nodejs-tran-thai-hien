import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { AuthService } from 'src/auth/auth.service';
import { isPublicRoute } from '../helpers/auth.helper';
import { extractTokenFromHeader } from '../utils/jwt.util';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly authService: AuthService,
    private readonly reflector: Reflector,
  ) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    if (isPublicRoute(this.reflector, context)) return true;
    const request = context.switchToHttp().getRequest<Request>();
    const token = extractTokenFromHeader(request);
    if (!token) throw new UnauthorizedException('Token is required');
    try {
      const user = await this.authService.verifyToken(token);
      request['user'] = user;
      return true;
    } catch (e) {
      console.error('Error verify token - AuthGuard:: ' + e);
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}
