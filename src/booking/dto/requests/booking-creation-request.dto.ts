import { ApiProperty } from '@nestjs/swagger';
import { SpacePriceUnit } from '@prisma/client';
import { Transform } from 'class-transformer';
import { IsDate, IsEnum, IsInt, Min } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';

export class BookingCreationRequestDto {
  @ApiProperty({
    description: 'The ID of the space to be booked',
    example: 123,
    minimum: 1,
  })
  @IsInt({ message: i18nValidationMessage('common.validation.isInt') })
  @Min(1, {
    message: i18nValidationMessage('common.validation.min', {
      field: 'spaceId',
    }),
  })
  spaceId: number;

  @ApiProperty({
    description: 'Start time of the booking',
    example: '2025-08-10 09:00',
    type: String,
    format: 'date-time',
  })
  @Transform(({ value }) =>
    value ? new Date(String(value).replace(' ', 'T')) : null,
  )
  @IsDate({
    message: i18nValidationMessage('common.validation.isDate', {
      field: 'startTime',
    }),
  })
  startTime: Date;

  @ApiProperty({
    description: 'End time of the booking',
    example: '2025-08-10 12:00',
    type: String,
    format: 'date-time',
  })
  @Transform(({ value }) =>
    value ? new Date(String(value).replace(' ', 'T')) : null,
  )
  @IsDate({
    message: i18nValidationMessage('common.validation.isDate', {
      field: 'endTime',
    }),
  })
  endTime: Date;

  @ApiProperty({
    description: 'The unit price type for the booking',
    enum: SpacePriceUnit,
    example: SpacePriceUnit.HOUR,
  })
  @Transform(({ value }) =>
    value == null ? undefined : String(value).toUpperCase(),
  )
  @IsEnum(SpacePriceUnit, {
    message: i18nValidationMessage('common.validation.isEnum', {
      field: 'unitPrice',
    }),
  })
  unitPrice: SpacePriceUnit;
}
