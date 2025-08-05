import { IsInt } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';

export class JoinRoomDto {
  @IsInt({
    message: i18nValidationMessage('common.validation.isInt', {
      field: 'userId',
    }),
  })
  userId: number;
}
