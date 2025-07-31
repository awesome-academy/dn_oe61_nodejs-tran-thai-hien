import { BadRequestException, NotFoundException } from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';
import { PrismaService } from 'src/prisma/prisma.service';

export async function getUserOrFail(
  prisma: PrismaService,
  i18n: I18nService,
  userId: number,
) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    throw new NotFoundException(i18n.translate('common.user.notFound'));
  }
  return user;
}

export async function validateUsers(
  userIds: number[],
  prismaService: PrismaService,
  i18nService: I18nService,
): Promise<void> {
  if (!userIds || userIds.length === 0) return;
  const usersExist = await prismaService.user.findMany({
    where: { id: { in: userIds } },
    select: { id: true },
  });
  const existingIds = usersExist.map((u) => u.id);
  const missingUserIds = userIds.filter((id) => !existingIds.includes(id));
  if (missingUserIds.length > 0) {
    throw new BadRequestException({
      message: i18nService.translate('common.user.missingUsers'),
      missingUsers: missingUserIds,
    });
  }
}
