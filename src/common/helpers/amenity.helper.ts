import { BadRequestException } from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';
import { PrismaService } from 'src/prisma/prisma.service';

export async function validateAmenities(
  amenities: number[],
  prismaService: PrismaService,
  i18nService: I18nService,
): Promise<void> {
  const amenitiesExist = await prismaService.amenity.findMany({
    where: { id: { in: amenities } },
    select: { id: true },
  });
  const existingIds = amenitiesExist.map((a) => a.id);
  const missingAmenityIds = amenities.filter((id) => !existingIds.includes(id));
  if (missingAmenityIds.length > 0) {
    throw new BadRequestException({
      message: i18nService.translate('common.venue.missingAmenities'),
      missingAmenities: missingAmenityIds,
    });
  }
}
