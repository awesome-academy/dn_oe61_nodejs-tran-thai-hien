import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { I18nService } from 'nestjs-i18n';
import { Observable } from 'rxjs';
import { AccessTokenPayload } from 'src/auth/interfaces/access-token-payload';
import { HAS_ROLE_KEY } from '../decorators/role.decorator';
import { Role } from '../enums/role.enum';

@Injectable()
export class RoleGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly i18nService: I18nService,
  ) {}
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const isPublicRoute = request['public_route'] as boolean;
    if (isPublicRoute) return true;
    const rolesRequired = this.reflector.getAllAndOverride<Role[]>(
      HAS_ROLE_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (!rolesRequired) return true;
    const user = request['user'] as AccessTokenPayload;
    if (!user)
      throw new UnauthorizedException(
        this.i18nService.translate('common.auth.unauthorized'),
      );
    if (!this.hasRole(rolesRequired, user.role))
      throw new ForbiddenException(
        this.i18nService.translate('common.auth.forbidden'),
      );
    return true;
  }
  private hasRole(rolesRequired: Role[], userRole: string): boolean {
    return rolesRequired.some(
      (roleRequired) => roleRequired.toLowerCase() === userRole.toLowerCase(),
    );
  }
}
