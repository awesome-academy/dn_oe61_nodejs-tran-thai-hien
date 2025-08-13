import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { SpaceType } from '@prisma/client';
import {
  AmenityLite,
  OwnerDetail,
  SpaceDetail,
} from 'src/common/interfaces/type';

export class AmenityLiteDto implements AmenityLite {
  @ApiProperty({ description: 'Amenity ID', example: 1 })
  id: number;

  @ApiProperty({ description: 'Amenity name', example: 'Free WiFi' })
  name: string;
}

export class SpaceDetailDto implements SpaceDetail {
  @ApiProperty({ description: 'Space ID', example: 101 })
  id: number;

  @ApiProperty({ description: 'Space name', example: 'Conference Room A' })
  name: string;

  @ApiProperty({ description: 'Type of space', example: 'MEETING_ROOM' })
  type: SpaceType;

  @ApiProperty({ description: 'Capacity of space', example: 50 })
  capacity: number;

  @ApiPropertyOptional({
    description: 'Description of the space',
    example: 'Spacious room with projector and air conditioning.',
  })
  description: string | null;
}

export class VenueDetailResponseDto {
  @ApiProperty({ description: 'Venue ID', example: 1 })
  id: number;

  @ApiProperty({ description: 'Venue name', example: 'Sunrise Building' })
  name: string;

  @ApiProperty({ description: 'Street name', example: '123 Main Street' })
  street: string;

  @ApiProperty({ description: 'City name', example: 'Da Nang' })
  city: string;

  @ApiProperty({ description: 'Venue latitude', example: 16.047079 })
  latitude: number;

  @ApiProperty({ description: 'Venue longitude', example: 108.20623 })
  longitude: number;

  @ApiProperty({ description: 'Status of the venue', example: 'APPROVED' })
  status: string;

  @ApiProperty({
    description: 'Date the venue was created',
    example: '2025-07-29T08:35:53.535Z',
  })
  createdDate: Date;

  @ApiProperty({
    description: 'Owner details',
    example: { id: 1, name: 'John Doe', email: 'john@example.com' },
  })
  owner: OwnerDetail;

  @ApiProperty({
    description: 'List of amenities in the venue',
    type: [AmenityLiteDto],
  })
  amenities: AmenityLiteDto[];

  @ApiProperty({
    description: 'List of spaces in the venue',
    type: [SpaceDetailDto],
  })
  spaces: SpaceDetailDto[];
}
