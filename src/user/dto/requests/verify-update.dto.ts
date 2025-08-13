import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsBoolean } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';

export class VerifyUpdateRequestDto {
  @ApiProperty({
    description: 'Indicates whether the property is verified',
    example: true,
    type: Boolean,
  })
  @IsBoolean({
    message: i18nValidationMessage('common.validation.isBoolean'),
  })
  @Type(() => Boolean)
  isVerify: boolean;
}
