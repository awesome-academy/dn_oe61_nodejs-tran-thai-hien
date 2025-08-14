import { SpaceType } from '@prisma/client';
import { PaginationResult } from 'src/common/interfaces/paginate-type';
import { SpaceSummaryResponseDto } from 'src/space/dto/responses/space-summary-response.dto';
import { PaginationMetadataExample } from 'test/fixture/dto/pagination-metadata';
import { SpaceSummaryResponse } from './space-summary-example';

export const SpaceSummaryArrayExample: SpaceSummaryResponseDto[] = [
  {
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
  },
  {
    id: 10,
    name: 'Meeting Room ANC',
    type: SpaceType.PRIVATE_OFFICE,
    capacity: 20,
    description: 'Spacious room with projector123',
    openHour: '08:00',
    closeHour: '19:00',
    venueId: 4,
    venueName: 'Downtown VenueA',
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
  },
];
export const MetaExample = {
  totalItems: 4,
  itemCount: 2,
  itemsPerPage: 10,
  totalPages: 1,
  currentPage: 1,
};
export const PaginatedSpacesResponseExample: PaginationResult<SpaceSummaryResponseDto> =
  {
    data: [SpaceSummaryResponse],
    meta: PaginationMetadataExample,
  };
