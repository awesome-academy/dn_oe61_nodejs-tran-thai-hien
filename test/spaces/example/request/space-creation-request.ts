import { SpaceCreationRequestDto } from 'src/space/dto/requests/space-creation-request.dto';

export const SpaceCreationRequestExample: SpaceCreationRequestDto = {
  venueId: 4,
  name: 'Test Space',
  type: 'PRIVATE OFFICE',
  capacity: 10,
  description: 'A test space',
  prices: [{ type: 'HOUR', price: 1000 }],
  openHour: '09:00',
  closeHour: '18:00',
  amenities: [1, 2],
  managers: [3, 4],
};
