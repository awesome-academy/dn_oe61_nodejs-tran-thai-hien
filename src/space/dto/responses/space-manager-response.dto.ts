import { ApiProperty } from '@nestjs/swagger';
import { OwnerLite } from 'src/common/interfaces/type';

export class SpaceManagerResponseDto {
  @ApiProperty({
    example: 1,
    description: 'ID of the space',
  })
  id: number;

  @ApiProperty({
    example: 'Meeting Room A',
    description: 'Name of the space',
  })
  name: string;

  @ApiProperty({
    example: 'PRIVATE_OFFICE',
    description: 'Type of the space',
  })
  type: string;

  @ApiProperty({
    type: [Object],
    description: 'List of managers',
    example: [
      { id: 5, name: 'John Doe' },
      { id: 6, name: 'Jane Smith' },
    ],
  })
  managers: OwnerLite[];
}
