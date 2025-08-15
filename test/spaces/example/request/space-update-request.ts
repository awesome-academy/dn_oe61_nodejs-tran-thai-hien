import { SpaceType } from '@prisma/client';
import { SpaceUpdateRequestDto } from 'src/space/dto/requests/space-update-request.dto';
export const SpaceUpdateRequestExample: SpaceUpdateRequestDto = {
  name: 'Meeting Room A',
  type: SpaceType.PRIVATE_OFFICE,
  capacity: 20,
  description: 'Spacious room with projector',
  prices: [
    {
      type: 'HOUR',
      price: 100000,
    },
  ],
  openHour: '08:00',
  closeHour: '19:00',
  amenities: [1],
  managers: [101],
};
