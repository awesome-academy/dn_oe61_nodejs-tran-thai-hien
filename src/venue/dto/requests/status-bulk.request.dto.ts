import { VenueStatus } from '@prisma/client';
import { Transform, Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { i18nValidationMessage } from 'nestjs-i18n';

export class StatusBulkRequest {
  @ApiProperty({
    description: 'Venue Id',
    example: 1,
  })
  @Type(() => Number)
  @IsInt({
    message: i18nValidationMessage('common.valdidation.isInt', {
      field: 'id',
    }),
  })
  id: number;
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
  status: VenueStatus;
  @ApiProperty({
    description: 'Reason for rejection or status change',
    example: '',
  })
  @IsOptional()
  @IsString()
  reason?: string;
}
