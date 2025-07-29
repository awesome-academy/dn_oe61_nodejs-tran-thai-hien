import { IsDate, IsEmail, IsString } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';

export class BookingCanceledPayloadDto {
  @IsEmail(
    {},
    {
      message: i18nValidationMessage('common.validation.isEmail', {
        field: 'email',
      }),
    },
  )
  to: string;
  @IsString()
  name: string;
  @IsString()
  spaceName: string;
  @IsDate()
  startTime: Date;
  @IsDate()
  endTime: Date;
}
