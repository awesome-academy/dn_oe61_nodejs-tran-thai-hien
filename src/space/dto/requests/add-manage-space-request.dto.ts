import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsInt, IsNotEmpty, Min } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';

export class AddManageSpaceRequestDto {
  @ApiProperty({
    type: [Number],
    description: 'Array of user IDs to add as managers',
    example: [1, 2, 3, 5, 6],
  })
  @IsArray()
  @IsNotEmpty()
  @IsInt({
    each: true,
    message: i18nValidationMessage('common.validation.ids.isInt'),
  })
  @Min(1, {
    each: true,
    message: i18nValidationMessage('common.validation.ids.min'),
  })
  userIds: number[];
}
