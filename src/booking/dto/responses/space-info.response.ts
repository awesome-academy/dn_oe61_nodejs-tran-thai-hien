import { ApiProperty } from '@nestjs/swagger';

export class SpaceInfoResponse {
  @ApiProperty({ example: 1, description: 'Unique identifier of the space' })
  id: number;

  @ApiProperty({
    example: 'Conference Room A',
    description: 'Name of the space',
  })
  name: string;

  @ApiProperty({ example: 'Meeting Room', description: 'Type of the space' })
  type: string;

  @ApiProperty({
    example: 'Main Office Venue',
    description: 'Name of the venue',
  })
  venueName: string;

  @ApiProperty({
    example: '123 Main Street, City',
    description: 'Address of the space',
  })
  address: string;
}
