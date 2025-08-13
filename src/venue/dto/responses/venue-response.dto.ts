import { ApiProperty } from '@nestjs/swagger';

export class VenueResponseDto {
  @ApiProperty({
    description: 'Unique identifier of the venue',
    example: 1,
  })
  id: number;

  @ApiProperty({
    description: 'Name of the venue',
    example: 'Sunrise Sports Complex',
  })
  name: string;

  @ApiProperty({
    description: 'Street address of the venue',
    example: '123 Main Street',
  })
  street: string;

  @ApiProperty({
    description: 'City where the venue is located',
    example: 'Ho Chi Minh City',
  })
  city: string;

  @ApiProperty({
    description: 'Latitude of the venue location',
    example: 10.762622,
  })
  latitude: number;

  @ApiProperty({
    description: 'Longitude of the venue location',
    example: 106.660172,
  })
  longitude: number;

  @ApiProperty({
    description: 'Status of the venue',
    example: 'active',
  })
  status: string;

  @ApiProperty({
    description: 'ID of the venue owner',
    example: 42,
  })
  ownerId: number;

  @ApiProperty({
    description: 'Date when the venue was created',
    type: String,
    format: 'date-time',
    example: '2025-08-09T12:34:56Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Date when the venue was last updated',
    type: String,
    format: 'date-time',
    example: '2025-08-10T14:20:00Z',
  })
  updatedAt: Date;

  @ApiProperty({
    description: 'Date when the venue was deleted, if applicable',
    type: String,
    format: 'date-time',
    nullable: true,
    example: null,
  })
  DeletedAt: Date | null;

  @ApiProperty({
    description:
      'Distance from the search location to the venue (in kilometers)',
    example: 71.96743752405091,
  })
  distance: number;
}
