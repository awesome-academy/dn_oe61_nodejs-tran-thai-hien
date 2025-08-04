// dto/requests/payos-webhook.dto.ts
import {
  IsBoolean,
  IsObject,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { PayOSDataReponseDto } from './payos-data-response.dto';
import { Type } from 'class-transformer';

export class PayOSWebhookDTO {
  @IsOptional()
  @IsString()
  code: string;
  @IsOptional()
  @IsString()
  desc: string;
  @IsOptional()
  @IsBoolean()
  success: boolean;
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => PayOSDataReponseDto)
  data: PayOSDataReponseDto;
  @IsOptional()
  @IsString()
  signature: string;
}
