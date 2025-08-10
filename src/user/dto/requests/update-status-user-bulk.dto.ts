import { ApiProperty } from '@nestjs/swagger';
import { ArrayMinSize, IsArray, ValidateNested } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';
import { StatusUserUpdateRequest } from './status-user-update.dto';
import { Type } from 'class-transformer';

export class UpdateStatusUserBulkRequest {
  @ApiProperty({
    description: 'Danh sách các user cần cập nhật',
    type: [StatusUserUpdateRequest],
  })
  @IsArray({
    message: i18nValidationMessage('common.validation.isArray', {
      field: 'users',
    }),
  })
  @ArrayMinSize(1, {
    message: i18nValidationMessage('common.validation.arrayMinSize', {
      field: 'users',
      minSize: 1,
    }),
  })
  @ValidateNested({ each: true })
  @Type(() => StatusUserUpdateRequest)
  users: StatusUserUpdateRequest[];
}
