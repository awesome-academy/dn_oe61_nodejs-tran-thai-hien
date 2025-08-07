import { IsInt, IsString } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';

export class MessageCreationRequestDto {
  @IsInt({
    message: i18nValidationMessage('common.validation.isInt', {
      field: 'senderId',
    }),
  })
  senderId: number;
  @IsInt({
    message: i18nValidationMessage('common.validation.isInt', {
      field: 'receiverId',
    }),
  })
  receiverId: number;
  @IsString({
    message: i18nValidationMessage('common.validation.isString', {
      field: 'content',
    }),
  })
  content: string;
}
