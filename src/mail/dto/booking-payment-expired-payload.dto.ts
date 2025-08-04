import { Type } from 'class-transformer';
import { IsDate, IsEmail, IsString } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';

export class BookingPaymentExpiredPayloadDto {
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
  userName: string;
  @IsString()
  spaceName: string;
  @Type(() => Date)
  @IsDate()
  startTime: Date;
  @Type(() => Date)
  @IsDate()
  endTime: Date;
}
