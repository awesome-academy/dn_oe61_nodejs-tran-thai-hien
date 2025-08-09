import { ApiProperty } from '@nestjs/swagger';

class BookingInfo {
  @ApiProperty({ example: 101, description: 'Booking ID' })
  id: number;

  @ApiProperty({
    example: '2025-09-15T08:00:00Z',
    description: 'Booking start time',
    type: String,
    format: 'date-time',
  })
  startTime: Date;

  @ApiProperty({
    example: '2025-09-15T12:00:00Z',
    description: 'Booking end time',
    type: String,
    format: 'date-time',
  })
  endTime: Date;
}

class UserInfo {
  @ApiProperty({ example: 55, description: 'User ID' })
  id: number;

  @ApiProperty({ example: 'John Doe', description: 'User name' })
  name: string;
}

export class PaymentHistoryResponseDto {
  @ApiProperty({ example: 789, description: 'Payment ID' })
  id: number;

  @ApiProperty({ example: 1500000, description: 'Payment amount' })
  amount: number;

  @ApiProperty({ example: 'Bank Transfer', description: 'Payment method' })
  method: string;

  @ApiProperty({ example: 'Paid', description: 'Payment status' })
  status: string;

  @ApiProperty({
    example: '2025-09-15T10:00:00Z',
    description: 'Payment date/time',
    type: String,
    format: 'date-time',
  })
  paidAt: Date | null;

  @ApiProperty({
    type: () => BookingInfo,
    description: 'Associated booking info',
  })
  booking: BookingInfo;

  @ApiProperty({
    type: () => UserInfo,
    description: 'User who made the payment',
  })
  user: UserInfo;

  @ApiProperty({
    example: '2025-08-01T09:00:00Z',
    description: 'Record creation time',
    type: String,
    format: 'date-time',
  })
  createdAt: Date;
}
