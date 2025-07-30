import { AmenityLite, SpaceLite } from 'src/common/interfaces/type';

export class VenueSummaryResponseDto {
  id: number;
  name: string;
  street: string;
  city: string;
  latitude: number;
  longitude: number;
  status: string;
  ownerId: number;
  ownerName: string;
  amenities: AmenityLite[];
  spaces: SpaceLite[];
}
