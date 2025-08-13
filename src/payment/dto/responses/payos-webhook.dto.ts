import {
  IsBoolean,
  IsObject,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { PayOSDataReponseDto } from './payos-data-response.dto';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class PayOSWebhookDTO {
  @ApiPropertyOptional({ example: '200', description: 'Response code' })
  @IsOptional()
  @IsString()
  code: string;

  @ApiPropertyOptional({
    example: 'Payment successful',
    description: 'Response description',
  })
  @IsOptional()
  @IsString()
  desc: string;

  @ApiPropertyOptional({
    example: true,
    description: 'Indicates success status',
  })
  @IsOptional()
  @IsBoolean()
  success: boolean;

  @ApiPropertyOptional({
    type: () => PayOSDataReponseDto,
    description: 'Response data payload',
  })
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => PayOSDataReponseDto)
  data: PayOSDataReponseDto;

  @ApiPropertyOptional({
    example: 'a1b2c3d4zxczxc...',
    description: 'Payload signature',
  })
  @IsOptional()
  @IsString()
  signature: string;
}
