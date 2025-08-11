import { ApiProperty } from '@nestjs/swagger';

export class StatisticSummaryResponseDto {
  @ApiProperty({
    description: 'Total venues',
    example: 120,
  })
  totalVenues: number;
  @ApiProperty({
    description: 'Total spaces',
    example: 80,
  })
  totalSpaces: number;
  @ApiProperty({
    description: 'Total bookings',
    example: 80,
  })
  totalBookings: number;
  @ApiProperty({
    description: 'Total revenues',
    example: 60000000,
  })
  totalRevenues: number;
  @ApiProperty({
    description: 'Total users',
    example: 80,
  })
  totalUsers: number;
}
