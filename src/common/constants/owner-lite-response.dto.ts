import { ApiProperty } from '@nestjs/swagger';

export class OwnerLiteResponse {
  @ApiProperty({ example: 5, description: 'Manager ID' })
  id: number;

  @ApiProperty({ example: 'John Doe', description: 'Manager name' })
  name: string;
}
