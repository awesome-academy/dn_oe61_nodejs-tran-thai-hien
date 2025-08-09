import { ApiProperty } from '@nestjs/swagger';
import { NotificationType } from '@prisma/client';
import { Transform, Type } from 'class-transformer';
import { IsEnum, IsInt, IsString } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';

export class NotificationCreationRequestDto {
  @ApiProperty({
    description: 'The ID of the user who will receive the notification',
    example: 42,
  })
  @Type(() => Number)
  @IsInt({
    message: i18nValidationMessage('common.validation.isInt', {
      field: 'receiverId',
    }),
  })
  receiverId: number;

  @ApiProperty({
    description: 'The title of the notification',
    example: 'Venue Created',
  })
  @IsString({
    message: i18nValidationMessage('common.validation.isString', {
      field: 'title',
    }),
  })
  title: string;

  @ApiProperty({
    description: 'The message content of the notification',
    example:
      'Venue named ABC-space ID: 1 has been created by Thai Hien at 2025-04-29',
  })
  @IsString({
    message: i18nValidationMessage('common.validation.isString', {
      field: 'message',
    }),
  })
  message: string;

  @ApiProperty({
    description: 'The type of notification',
    enum: NotificationType,
    example: 'Venue Created',
  })
  @Transform(({ value }) =>
    value ? String(value).replace(' ', '_').toUpperCase() : undefined,
  )
  @IsEnum(NotificationType, {
    message: i18nValidationMessage('common.validation.isEnum', {
      field: 'type',
    }),
  })
  type: NotificationType;
}
