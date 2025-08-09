import { ApiProperty } from '@nestjs/swagger';

export class SpaceLiteResponse {
  @ApiProperty({ example: 10, description: 'ID of the space' })
  id: number;

  @ApiProperty({ example: 'Meeting Room A', description: 'Name of the space' })
  name: string;
}
