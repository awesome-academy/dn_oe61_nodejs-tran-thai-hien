import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ArrayMinSize, IsArray, ValidateNested } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';
import { StatusBulkRequest } from './status-bulk.request.dto';

export class StatusVenueUpdateBulkRequest {
  @ApiProperty({
    description: 'List of buildings to be updated',
    type: [StatusBulkRequest],
  })
  @IsArray({
    message: i18nValidationMessage('common.validation.isArray', {
      field: 'venues',
    }),
  })
  @ArrayMinSize(1, {
    message: i18nValidationMessage('common.validation.arrayMinSize', {
      field: 'venues',
      minSize: 1,
    }),
  })
  @ValidateNested({ each: true })
  @Type(() => StatusBulkRequest)
  venues: StatusBulkRequest[];
}
