import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { BookingStatus } from '@prisma/client';
import { SpaceInfoResponse } from './space-info.response';

class OwnerLiteResponse {
  @ApiProperty({ example: 101, description: 'User ID' })
  id: number;

  @ApiProperty({ example: 'John Doe', description: 'User full name' })
  name: string;
}

export class BookingInfoResponse {
  @ApiProperty({ example: 123, description: 'Booking unique identifier' })
  id: number;
  @ApiProperty({
    type: () => SpaceInfoResponse,
    description: 'Information about the booked space',
  })
  space: SpaceInfoResponse;

  @ApiProperty({
    example: '2025-08-10T08:00:00Z',
    description: 'Booking start time',
    type: String,
    format: 'date-time',
  })
  startTime: Date;

  @ApiProperty({
    example: '2025-08-12T20:00:00Z',
    description: 'Booking end time',
    type: String,
    format: 'date-time',
  })
  endTime: Date;
  @ApiProperty({
    enum: BookingStatus,
    description: 'Status of the booking',
    example: BookingStatus.CONFIRMED,
  })
  status: BookingStatus;
  @ApiProperty({
    example: 1500000,
    description: 'Total price of the booking in VND',
  })
  totalPrice: number;
  @ApiPropertyOptional({
    type: () => OwnerLiteResponse,
    description: 'Information about the user who made the booking',
  })
  user?: OwnerLiteResponse;
  @ApiProperty({
    example: '2025-08-01T09:30:00Z',
    description: 'Booking creation timestamp',
    type: String,
    format: 'date-time',
  })
  createdAt: Date;
}
