import { VenueStatus } from '@prisma/client';
import { Transform } from 'class-transformer';
import { IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { i18nValidationMessage } from 'nestjs-i18n';

export class StatusVenueUpdateRequestDto {
  @ApiProperty({
    description: 'New status of the venue',
    enum: VenueStatus,
    example: VenueStatus.APPROVED,
  })
  @Transform(({ value }) => {
    if (value == null) return undefined;
    return String(value).toUpperCase();
  })
  @IsEnum(VenueStatus, {
    message: i18nValidationMessage('common.validation.isEnum', {
      field: 'status',
    }),
  })
  status: string;
}
