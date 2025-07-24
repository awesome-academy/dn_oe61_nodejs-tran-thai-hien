export class VenueCreationResponseDto {
  id: number;
  name: string;
  street: string;
  city: string;
  latitude: number;
  longitude: number;
  ownerId: number;
  ownerName: string;
  amenitiesName: string[];
}
