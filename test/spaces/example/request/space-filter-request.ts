import { SpacePriceUnit, SpaceType } from '@prisma/client';
import { SortDirection } from 'src/common/enums/query.enum';
import { SpaceFilterRequestDto } from 'src/space/dto/requests/space-filter-request.dto';
export const SpaceFilterRequestExample: SpaceFilterRequestDto = {
  name: 'abc',
  city: 'Hanoi',
  street: 'a',
  type: [SpaceType.PRIVATE_OFFICE, SpaceType.WORKING_DESK],
  priceUnit: SpacePriceUnit.HOUR,
  minPrice: 0,
  maxPrice: 1000000,
  startTime: '08:00',
  endTime: '19:00',
  page: 1,
  pageSize: 10,
  sortBy: 'name',
  direction: SortDirection.ASC,
};
