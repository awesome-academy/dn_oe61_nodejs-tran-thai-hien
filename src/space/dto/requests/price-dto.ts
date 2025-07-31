import { SpacePriceUnit } from '@prisma/client';
import { Transform } from 'class-transformer';
import { IsEnum, IsNumber, Min } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';

export class PriceDto {
  @Transform(({ value }) => {
    if (value == null) return undefined;
    return String(value).toUpperCase();
  })
  @IsEnum(SpacePriceUnit, {
    message: i18nValidationMessage('common.validation.isEnum', {
      field: 'type',
    }),
  })
  type: string;
  @IsNumber(
    {},
    {
      message: i18nValidationMessage('common.validation.isNumber', {
        field: 'price',
      }),
    },
  )
  @Min(0, { message: i18nValidationMessage('common.validation.min') })
  price: number;
}
