import { ApiProperty } from '@nestjs/swagger';

export class AmenityLiteResponse {
  @ApiProperty({ example: 1, description: 'Amenity ID' })
  id: number;

  @ApiProperty({ example: 'Projector', description: 'Amenity name' })
  name: string;
}
