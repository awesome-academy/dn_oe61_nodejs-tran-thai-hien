import { ApiPropertyOptional } from '@nestjs/swagger';
import { UserStatus } from '@prisma/client';
import { Transform } from 'class-transformer';
import { IsEnum, IsOptional } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';

export class StatusUpdateRequestDto {
  @ApiPropertyOptional({
    description:
      'New status of the user account. Must be one of the allowed values.',
    enum: UserStatus,
    example: UserStatus.ACTIVE,
    nullable: true,
  })
  @Transform(({ value }) => {
    if (value == null) return undefined;
    return String(value).toUpperCase();
  })
  @IsEnum(UserStatus, {
    message: i18nValidationMessage('common.validation.isEnum', {
      field: 'status',
      enum: '(active/deactived)',
    }),
  })
  @IsOptional()
  status: string;
}
