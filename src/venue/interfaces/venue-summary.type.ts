import { Venue } from '@prisma/client';
import {
  AmenityWithStatus,
  OwnerLite,
  SpaceLite,
} from 'src/common/interfaces/type';

export type VenueSummaryType = Venue & {
  owner: OwnerLite;
  spaces: SpaceLite[];
  venueAmenities: AmenityWithStatus[];
};
