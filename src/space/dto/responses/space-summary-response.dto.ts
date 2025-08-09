import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AmenityLiteResponse } from 'src/common/constants/amenity-lit-response.dto';
import { OwnerLiteResponse } from 'src/common/constants/owner-lite-response.dto';
import { PriceLiteResponse } from 'src/common/constants/price-lite-response.dto';
export class SpaceSummaryResponseDto {
  @ApiProperty({ example: 10, description: 'Space ID' })
  id: number;

  @ApiProperty({ example: 'Meeting Room A', description: 'Space name' })
  name: string;

  @ApiProperty({ example: 'PRIVATE OFFICE', description: 'Space type' })
  type: string;

  @ApiProperty({ example: 20, description: 'Capacity of the space' })
  capacity: number;

  @ApiPropertyOptional({
    example: 'Spacious room with projector',
    description: 'Description of the space',
  })
  description: string | null;

  @ApiProperty({ example: '08:00', description: 'Opening hour' })
  openHour: string;

  @ApiProperty({ example: '19:00', description: 'Closing hour' })
  closeHour: string;

  @ApiProperty({ example: 4, description: 'Venue ID' })
  venueId: number;

  @ApiProperty({ example: 'Downtown Venue', description: 'Venue name' })
  venueName: string;

  @ApiProperty({ type: [PriceLiteResponse], description: 'List of prices' })
  prices: PriceLiteResponse[];

  @ApiPropertyOptional({
    type: [AmenityLiteResponse],
    description: 'List of amenities',
  })
  amenities?: AmenityLiteResponse[];

  @ApiProperty({
    type: [OwnerLiteResponse],
    description: 'List of space managers',
  })
  managers: OwnerLiteResponse[];
}
