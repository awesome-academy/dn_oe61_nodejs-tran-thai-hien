import { ApiProperty } from '@nestjs/swagger';

export class TopVenueResponseDto {
  @ApiProperty({
    example: 1,
    description: 'ID of the venue',
  })
  id: number;

  @ApiProperty({
    example: 'Downtown Conference Center',
    description: 'Name of the venue',
  })
  name: string;

  @ApiProperty({
    example: 150,
    description: 'Total number of bookings for the venue',
  })
  totalBookings: number;
}
