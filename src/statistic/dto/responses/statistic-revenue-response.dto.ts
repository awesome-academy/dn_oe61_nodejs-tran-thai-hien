import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class StatisticRevenueResponseDto {
  @ApiPropertyOptional({
    description: 'Venue ID',
    example: 1,
  })
  venueId?: number;

  @ApiPropertyOptional({
    description: 'Start date of the revenue statistics',
    example: '2025-08-01T00:00:00.000Z',
    type: String,
    format: 'date-time',
  })
  startDate?: Date;

  @ApiPropertyOptional({
    description: 'End date of the revenue statistics',
    example: '2025-08-31T23:59:59.999Z',
    type: String,
    format: 'date-time',
  })
  endDate?: Date;

  @ApiProperty({
    description: 'Total revenue',
    example: 1000000,
  })
  total: number;

  @ApiProperty({
    description: 'Revenue grouped by month',
    example: [{ month: '2025-08', total: 500000 }],
    type: [Object],
  })
  byMonth: { month: string; total: number }[];

  @ApiProperty({
    description: 'Revenue grouped by type',
    example: [{ type: 'PRIVATE_OFFICE', total: 300000 }],
    type: [Object],
  })
  byType: { type: string; total: number }[];

  @ApiProperty({
    description: 'Revenue grouped by space',
    example: [
      { name: 'Meeting Room A', type: 'PRIVATE_OFFICE', total: 200000 },
    ],
    type: [Object],
  })
  bySpace: { name: string; type: string; total: number }[];
}
