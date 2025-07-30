import { NotFoundException } from '@nestjs/common';
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
