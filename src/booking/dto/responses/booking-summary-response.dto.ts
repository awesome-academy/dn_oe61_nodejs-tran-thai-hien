import { ApiProperty } from '@nestjs/swagger';
import { BookingStatus, SpacePriceUnit } from '@prisma/client';
import { SpaceLiteResponse } from 'src/common/constants/space-lite-response.dto';
import { OwnerLite, SpaceLite } from 'src/common/interfaces/type';

export class BookingSummaryResponseDto {
  @ApiProperty({
    example: 1,
    description: 'ID of the booking',
  })
  id: number;
  @ApiProperty({
    example: BookingStatus.CONFIRMED,
    description: 'Status of the booking',
    enum: BookingStatus,
  })
  status: BookingStatus;

  @ApiProperty({
    example: '2025-08-09 08:00',
    description: 'Start date and time of the booking',
    type: String,
    format: 'date-time',
  })
  startTime: Date;

  @ApiProperty({
    example: '2025-08-09 12:00',
    description: 'End date and time of the booking',
    type: String,
    format: 'date-time',
  })
  endTime: Date;

  @ApiProperty({
    example: 250000,
    description: 'Total price of the booking',
  })
  totalPrice: number;

  @ApiProperty({
    example: SpacePriceUnit.HOUR,
    description: 'Unit of the price',
    enum: SpacePriceUnit,
    required: false,
  })
  unit?: SpacePriceUnit;
  @ApiProperty({
    type: SpaceLiteResponse,
  })
  space: SpaceLite;
  @ApiProperty({
    example: {
      id: 5,
      name: 'John Doe',
      email: 'john.doe@example.com',
    },
    description: 'Information about the user who made the booking',
  })
  user: OwnerLite;
}
