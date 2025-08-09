import { NotificationType } from '@prisma/client';
import { Transform, Type } from 'class-transformer';
import { IsEnum, IsInt, IsString } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';

export class NotificationCreationRequestDto {
  @Type(() => Number)
  @IsInt({
    message: i18nValidationMessage('common.validation.isInt', {
      field: 'receiverId',
    }),
  })
  receiverId: number;
  @IsString({
    message: i18nValidationMessage('common.validation.isString', {
      field: 'title',
    }),
  })
  title: string;
  @IsString({
    message: i18nValidationMessage('common.validation.isString', {
      field: 'message',
    }),
  })
  message: string;
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
