import { Type } from 'class-transformer';
import { IsInt, IsOptional, Min } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class ChatQueryDto {
  @ApiPropertyOptional({
    description: 'Page number for pagination',
    example: 1,
    minimum: 0,
    type: Number,
    default: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({
    message: i18nValidationMessage('common.validation.isInt', {
      field: 'page',
    }),
  })
  @Min(0, {
    message: i18nValidationMessage('common.validation.min', {
      field: 'page',
    }),
  })
  page: number = 1;

  @ApiPropertyOptional({
    description: 'Number of items per page',
    example: 20,
    minimum: 0,
    type: Number,
    default: 20,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({
    message: i18nValidationMessage('common.validation.isInt', {
      field: 'pageSize',
    }),
  })
  @Min(0, {
    message: i18nValidationMessage('common.validation.min', {
      field: 'pageSize',
    }),
  })
  pageSize: number = 20;
}
