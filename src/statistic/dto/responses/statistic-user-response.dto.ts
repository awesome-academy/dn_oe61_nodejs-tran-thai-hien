import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class StatisticUserResponseDto {
  @ApiPropertyOptional({
    description: 'Start date of the statistic period',
    type: String,
    format: 'date-time',
    example: '2025-08-01T00:00:00.000Z',
  })
  startDate?: Date;

  @ApiPropertyOptional({
    description: 'End date of the statistic period',
    type: String,
    format: 'date-time',
    example: '2025-08-31T23:59:59.999Z',
  })
  endDate?: Date;

  @ApiProperty({
    description: 'Total number of users',
    example: 1000,
  })
  total: number;

  @ApiProperty({
    description: 'Number of users who have made bookings',
    example: 600,
  })
  usersWithBooking: number;

  @ApiProperty({
    description: 'Number of users who have not made bookings',
    example: 400,
  })
  usersWithoutBooking: number;

  @ApiProperty({
    description: 'User counts grouped by status',
    type: [Object],
    example: [
      { status: 'active', total: 700 },
      { status: 'inactive', total: 300 },
    ],
  })
  byStatus: { status: string; total: number }[];

  @ApiProperty({
    description: 'User counts grouped by month',
    type: [Object],
    example: [
      { month: '2025-01', total: 100 },
      { month: '2025-02', total: 150 },
    ],
  })
  byMonth: { month: string; total: number }[];
}
