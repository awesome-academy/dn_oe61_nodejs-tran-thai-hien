import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class StatisticBookingResponseDto {
  @ApiPropertyOptional({
    description: 'ID of the venue',
    example: 1,
  })
  venueId?: number;

  @ApiPropertyOptional({
    description: 'Start date of the statistic range',
    example: '2025-08-01T00:00:00.000Z',
    type: String,
    format: 'date-time',
  })
  startDate?: Date;

  @ApiPropertyOptional({
    description: 'End date of the statistic range',
    example: '2025-08-31T23:59:59.999Z',
    type: String,
    format: 'date-time',
  })
  endDate?: Date;

  @ApiProperty({
    description: 'Total count of bookings',
    example: 100,
  })
  total: number;

  @ApiProperty({
    description: 'Booking count grouped by status',
    type: [Object],
    example: [
      { status: 'CONFIRMED', total: 40 },
      { status: 'PENDING', total: 30 },
      { status: 'CANCELLED', total: 30 },
    ],
  })
  byStatus: { status: string; total: number }[];

  @ApiProperty({
    description: 'Booking count grouped by month',
    type: [Object],
    example: [
      { month: '2025-01', total: 10 },
      { month: '2025-02', total: 20 },
    ],
  })
  byMonth: { month: string; total: number }[];

  @ApiProperty({
    description: 'Booking count grouped by booking type',
    type: [Object],
    example: [
      { type: 'MEETING_ROOM', total: 50 },
      { type: 'PRIVATE_OFFICE', total: 50 },
    ],
  })
  byType: { type: string; total: number }[];

  @ApiProperty({
    description: 'Booking count grouped by space',
    type: [Object],
    example: [
      { name: 'Room A', type: 'MEETING_ROOM', total: 25 },
      { name: 'Room B', type: 'PRIVATE_OFFICE', total: 75 },
    ],
  })
  bySpace: { name: string; type: string; total: number }[];
}
