import { ApiProperty } from '@nestjs/swagger';
import { SpacePriceUnit } from '@prisma/client';
import { Transform } from 'class-transformer';
import { IsEnum, IsNumber, Min } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';

export class PriceDto {
  @ApiProperty({
    example: 'HOUR',
    description: 'Unit type for pricing',
    enum: SpacePriceUnit,
  })
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

  @ApiProperty({
    example: 100000,
    description: 'Price value for the unit',
    minimum: 0,
  })
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
