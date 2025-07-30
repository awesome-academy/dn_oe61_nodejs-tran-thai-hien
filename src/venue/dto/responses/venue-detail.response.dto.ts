import {
  AmenityLite,
  OwnerDetail,
  SpaceDetail,
} from 'src/common/interfaces/type';
export class VenueDetailResponseDto {
  id: number;
  name: string;
  street: string;
  city: string;
  latitude: number;
  longitude: number;
  status: string;
  createdDate: Date;
  owner: OwnerDetail;
  amenities: AmenityLite[];
  spaces: SpaceDetail[];
}
