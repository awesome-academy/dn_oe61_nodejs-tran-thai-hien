import { SpaceType } from '@prisma/client';
export const SpaceSummaryResponse = {
  id: 10,
  name: 'Meeting Room A',
  type: SpaceType.PRIVATE_OFFICE,
  capacity: 20,
  description: 'Spacious room with projector',
  openHour: '08:00',
  closeHour: '19:00',
  venueId: 4,
  venueName: 'Downtown Venue',
  prices: [
    {
      unit: 'HOUR',
      price: 10000,
    },
  ],
  amenities: [
    {
      id: 1,
      name: 'Projector',
    },
  ],
  managers: [
    {
      id: 101,
      name: 'John Doe',
    },
  ],
};

export const SpaceSummaryResponseTest = {
  id: 10,
  name: 'Meeting Room A',
  type: SpaceType.PRIVATE_OFFICE,
  capacity: 20,
};
