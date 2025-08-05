import { ApiProperty } from '@nestjs/swagger';

export class VenueMapResponseDto {
  @ApiProperty({
    description: 'Unique ID of the venue',
    example: 1,
  })
  id: number;

  @ApiProperty({
    description: 'Name of the venue',
    example: 'Sunshine Coworking Space',
  })
  name: string;

  @ApiProperty({
    description: 'Latitude coordinate of the venue',
    example: 10.762622,
  })
  latitude: number;

  @ApiProperty({
    description: 'Longitude coordinate of the venue',
    example: 106.660172,
  })
  longitude: number;

  @ApiProperty({
    description: 'City where the venue is located',
    example: 'Ho Chi Minh City',
  })
  city: string;

  @ApiProperty({
    description: 'Street address of the venue',
    example: '123 Nguyen Trai Street',
  })
  street: string;
}
