import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsNumber, IsOptional, IsString } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';

export class PayOSDataReponseDto {
  @ApiPropertyOptional({ example: 123456, description: 'Order code' })
  @IsOptional()
  @IsInt({
    message: i18nValidationMessage('common.validation.isInt', {
      field: 'orderCode',
    }),
  })
  orderCode: number;

  @ApiPropertyOptional({
    example: 1500000.5,
    description: 'Amount of the transaction',
  })
  @IsOptional()
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
    example: 'Payment for invoice #1234',
    description: 'Description',
  })
  @IsOptional()
  @IsString({
    message: i18nValidationMessage('common.validation.isString', {
      field: 'description',
    }),
  })
  description?: string;

  @ApiPropertyOptional({ example: '123456789', description: 'Account number' })
  @IsOptional()
  @IsString({
    message: i18nValidationMessage('common.validation.isString', {
      field: 'accountNumber',
    }),
  })
  accountNumber?: string;

  @ApiPropertyOptional({ example: 'REF123456', description: 'Reference' })
  @IsOptional()
  @IsString({
    message: i18nValidationMessage('common.validation.isString', {
      field: 'reference',
    }),
  })
  reference?: string;

  @ApiPropertyOptional({
    example: '2025-08-09T08:00:00Z',
    description: 'Transaction date and time',
  })
  @IsOptional()
  @IsString({
    message: i18nValidationMessage('common.validation.isString', {
      field: 'transactionDateTime',
    }),
  })
  transactionDateTime?: string;

  @ApiPropertyOptional({ example: 'VND', description: 'Currency code' })
  @IsOptional()
  @IsString({
    message: i18nValidationMessage('common.validation.isString', {
      field: 'currency',
    }),
  })
  currency?: string;

  @ApiPropertyOptional({
    example: 'http://payoslink131azz...',
    description: 'Payment link ID',
  })
  @IsOptional()
  @IsString({
    message: i18nValidationMessage('common.validation.isString', {
      field: 'paymentLinkId',
    }),
  })
  paymentLinkId?: string;

  @ApiPropertyOptional({ example: '00', description: 'Response code' })
  @IsOptional()
  @IsString({
    message: i18nValidationMessage('common.validation.isString', {
      field: 'code',
    }),
  })
  code?: string;

  @ApiPropertyOptional({
    example: 'Success',
    description: 'Response description',
  })
  @IsOptional()
  @IsString({
    message: i18nValidationMessage('common.validation.isString', {
      field: 'desc',
    }),
  })
  desc?: string;

  @ApiPropertyOptional({
    example: '001',
    description: 'Counter account bank ID',
  })
  @IsOptional()
  @IsString({
    message: i18nValidationMessage('common.validation.isString', {
      field: 'counterAccountBankId',
    }),
  })
  counterAccountBankId?: string;

  @ApiPropertyOptional({
    example: 'Mb Bank',
    description: 'Counter account bank name',
  })
  @IsOptional()
  @IsString({
    message: i18nValidationMessage('common.validation.isString', {
      field: 'counterAccountBankName',
    }),
  })
  counterAccountBankName?: string;

  @ApiPropertyOptional({
    example: 'Nguyen Van A',
    description: 'Counter account name',
  })
  @IsOptional()
  @IsString({
    message: i18nValidationMessage('common.validation.isString', {
      field: 'counterAccountName',
    }),
  })
  counterAccountName?: string;

  @ApiPropertyOptional({
    example: '123456789',
    description: 'Counter account number',
  })
  @IsOptional()
  @IsString({
    message: i18nValidationMessage('common.validation.isString', {
      field: 'counterAccountNumber',
    }),
  })
  counterAccountNumber?: string;

  @ApiPropertyOptional({
    example: 'Virtual Account XYZ',
    description: 'Virtual account name',
  })
  @IsOptional()
  @IsString({
    message: i18nValidationMessage('common.validation.isString', {
      field: 'virtualAccountName',
    }),
  })
  virtualAccountName?: string;

  @ApiPropertyOptional({
    example: '987654321',
    description: 'Virtual account number',
  })
  @IsOptional()
  @IsString({
    message: i18nValidationMessage('common.validation.isString', {
      field: 'virtualAccountNumber',
    }),
  })
  virtualAccountNumber?: string;
}
