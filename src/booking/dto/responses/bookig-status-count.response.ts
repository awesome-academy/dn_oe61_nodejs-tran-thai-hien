import { ApiProperty } from '@nestjs/swagger';

export class BookingStatusCountDto {
  @ApiProperty({
    description: 'Map status to count',
    example: {
      Pending: 50,
      Confirmed: 20,
      Rejected: 5,
    },
    type: 'object',
    additionalProperties: { type: 'number' },
  })
  counts: Record<string, number>;
}
