import { IsInt, IsString } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';

export class SendMessageDto {
  @IsInt({
    message: i18nValidationMessage('common.validation.isInt', {
      field: 'toReceiverId',
    }),
  })
  toReceiverId: number;

  @IsString()
  content: string;
}
