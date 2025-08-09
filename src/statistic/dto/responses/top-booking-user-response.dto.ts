import { ApiProperty } from '@nestjs/swagger';

export class TopBookingUserResponseDto {
  @ApiProperty({
    example: 1,
    description: 'User ID',
  })
  id: number;

  @ApiProperty({
    example: 'John Doe',
    description: 'User full name',
  })
  name: string;

  @ApiProperty({
    example: 10,
    description: 'Total number of bookings made by the user',
  })
  totalBookings: number;
}
