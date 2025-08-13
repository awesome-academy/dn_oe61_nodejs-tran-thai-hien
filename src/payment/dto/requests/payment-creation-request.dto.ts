import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsNumber, IsOptional, IsString } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';

export class PaymentCreationRequestDto {
  @ApiProperty({
    example: 123,
    description: 'ID của booking',
  })
  @IsInt({
    message: i18nValidationMessage('common.validation.isInt', {
      field: 'bookingId',
    }),
  })
  bookingId: number;

  @ApiProperty({
    example: 45,
    description: 'ID của user thực hiện thanh toán',
  })
  @IsInt({
    message: i18nValidationMessage('common.validation.isInt', {
      field: 'userId',
    }),
  })
  userId: number;

  @ApiProperty({
    example: 1500000,
    description: 'Số tiền thanh toán',
  })
  @IsNumber(
    {},
    {
      message: i18nValidationMessage('common.validation.isNumber', {
        field: 'amount',
      }),
    },
  )
  amount: number;

  @ApiPropertyOptional({
    example: 'Thanh toán cho booking XYZ',
    description: 'Mô tả chi tiết về thanh toán',
  })
  @IsOptional()
  @IsString({
    message: i18nValidationMessage('common.validation.isString', {
      field: 'description',
    }),
  })
  description: string;

  @ApiProperty({
    example: 1691577600000,
    description: 'Thời gian hết hạn (timestamp mili giây)',
  })
  expiredAt: number;
}
