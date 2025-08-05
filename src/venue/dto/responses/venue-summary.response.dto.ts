import { ApiProperty } from '@nestjs/swagger';
import { AmenityLite, SpaceLite } from 'src/common/interfaces/type';

export class VenueSummaryResponseDto {
  @ApiProperty({
    example: 1,
    description: 'Unique identifier of the venue',
  })
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
    description: 'Latitude coordinate of the venue location',
  })
  latitude: number;

  @ApiProperty({
    example: 106.660172,
    description: 'Longitude coordinate of the venue location',
  })
  longitude: number;

  @ApiProperty({ description: 'Status of the venue', example: 'APPROVED' })
  status: string;
  @ApiProperty({
    example: 42,
    description: 'User ID of the venue owner',
  })
  ownerId: number;

  @ApiProperty({
    example: 'John Doe',
    description: 'Name of the venue owner',
  })
  ownerName: string;

  @ApiProperty({
    type: [Object],
    description: 'List of amenities available at the venue',
    example: [
      { id: 1, name: 'WiFi' },
      { id: 2, name: 'Parking' },
    ],
  })
  amenities: AmenityLite[];
  @ApiProperty({
    type: [Object],
    description: 'List of spaces available in the venue',
    example: [
      { id: 1, name: 'Conference Room A' },
      { id: 2, name: 'Private Office' },
    ],
  })
  spaces: SpaceLite[];
}
