import { SpacePriceUnit } from '@prisma/client';
import { Transform } from 'class-transformer';
import { IsDate, IsEnum, IsInt, Min } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';

export class BookingCreationRequestDto {
  @IsInt({ message: i18nValidationMessage('common.validation.isInt') })
  @Min(1, {
    message: i18nValidationMessage('common.validation.min', {
      field: 'spaceId',
    }),
  })
  spaceId: number;

  @Transform(({ value }) =>
    value ? new Date(String(value).replace(' ', 'T')) : null,
  )
  @IsDate({
    message: i18nValidationMessage('common.validation.isDate', {
      field: 'startTime',
    }),
  })
  startTime: Date;

  @Transform(({ value }) =>
    value ? new Date(String(value).replace(' ', 'T')) : null,
  )
  @IsDate({
    message: i18nValidationMessage('common.validation.isDate', {
      field: 'endTime',
    }),
  })
  endTime: Date;

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
