import { AmenityLite, OwnerLite, PriceLite } from 'src/common/interfaces/type';

export class SpaceSummaryResponseDto {
  id: number;
  name: string;
  type: string;
  capacity: number;
  description: string | null;
  openHour: string;
  closeHour: string;
  venueId: number;
  venueName: string;
  prices: PriceLite[];
  amenities: AmenityLite[];
  managers: OwnerLite[];
}
