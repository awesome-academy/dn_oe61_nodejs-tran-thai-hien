import { AmenityStatus, Space } from '@prisma/client';
import {
  AmenityLite,
  OwnerLite,
  PriceLite,
  VenueLite,
} from 'src/common/interfaces/type';

export type SpaceSummaryType = Space & {
  spaceAmenities: { status: AmenityStatus; amenity: AmenityLite }[];
  venue: VenueLite;
  spacePrices: PriceLite[];
  spaceManagers: { manager: OwnerLite }[];
};
