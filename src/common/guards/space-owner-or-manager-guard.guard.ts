import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Request } from 'express';
import { I18nService } from 'nestjs-i18n';
import { AccessTokenPayload } from 'src/auth/interfaces/access-token-payload';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class SpaceOwnerOrManagerGuard implements CanActivate {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly i18nService: I18nService,
  ) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const user = request['user'] as AccessTokenPayload;
    const spaceId = parseInt(request.params.id, 10);
    const space = await this.prismaService.space.findUnique({
      where: {
        id: spaceId,
      },
      select: {
        venue: {
          select: {
            ownerId: true,
          },
        },
        spaceManagers: {
          select: {
            managerId: true,
          },
        },
      },
    });
    if (!space)
      throw new NotFoundException(
        this.i18nService.translate('common.space.notFound'),
      );
    const isOwner = space.venue.ownerId === user.sub;
    const isManager = space.spaceManagers.some(
      (sm) => sm.managerId === user.sub,
    );
    if (!isOwner && !isManager)
      throw new ForbiddenException(
        this.i18nService.translate('common.auth.forbidden'),
      );
    return true;
  }
}
