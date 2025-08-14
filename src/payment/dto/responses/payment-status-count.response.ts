import { ApiProperty } from '@nestjs/swagger';

export class PaymentStatusCountDto {
  @ApiProperty({
    description: 'Payment status count',
    example: {
      PAID: 50,
      PENDING: 20,
      FAILED: 5,
    },
    type: 'object',
    additionalProperties: { type: 'number' },
  })
  counts: Record<string, number>;
}
