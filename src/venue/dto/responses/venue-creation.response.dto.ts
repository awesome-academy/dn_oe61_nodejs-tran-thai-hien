import { ApiProperty } from '@nestjs/swagger';

export class VenueCreationResponseDto {
  @ApiProperty({ example: 1, description: 'Unique ID of the venue' })
  id: number;

  @ApiProperty({
    example: 'Sunshine Coworking Space',
    description: 'Name of the venue',
  })
  name: string;

  @ApiProperty({
    example: '123 Main St',
    description: 'Street address of the venue',
  })
  street: string;

  @ApiProperty({
    example: 'Ho Chi Minh City',
    description: 'City where the venue is located',
  })
  city: string;

  @ApiProperty({
    example: 10.762622,
    description: 'Latitude coordinate of the venue',
  })
  latitude: number;

  @ApiProperty({
    example: 106.660172,
    description: 'Longitude coordinate of the venue',
  })
  longitude: number;

  @ApiProperty({ example: 42, description: 'ID of the venue owner' })
  ownerId: number;

  @ApiProperty({
    example: 'Nguyen Van A',
    description: 'Full name of the venue owner',
  })
  ownerName: string;

  @ApiProperty({
    example: ['Wifi', 'Parking', 'Elevator'],
    description: 'List of amenities shared by all venues in the building',
    type: [String],
  })
  amenitiesName: string[];
}
