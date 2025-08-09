import { ApiProperty } from '@nestjs/swagger';

export class PriceLiteResponse {
  @ApiProperty({ example: 'HOUR', description: 'Unit of the price' })
  unit: string;

  @ApiProperty({ example: '10000', description: 'Price' })
  price: number;
}
