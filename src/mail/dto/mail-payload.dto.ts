import { IsEmail, IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { MAIL_TYPE, MailType } from '../constants/mail-type.constant';
import { i18nValidationMessage } from 'nestjs-i18n';

export class MailPayloadDto {
  @IsEmail()
  @IsNotEmpty()
  to: string;
  @IsEnum(MAIL_TYPE, {
    message: i18nValidationMessage('common.mail.send.invalid_type'),
  })
  @IsNotEmpty({
    message: i18nValidationMessage('common.mail.send.type_not_null'),
  })
  type: MailType;
  @IsString()
  @IsNotEmpty({
    message: i18nValidationMessage('common.mail.send.username_not_null'),
  })
  recipientUserName: string;
  recipientName?: string;
  @IsString()
  @IsNotEmpty({
    message: i18nValidationMessage('common.mail.send.token_not_null'),
  })
  token: string;
  @IsString()
  @IsNotEmpty({
    message: i18nValidationMessage('common.mail.send.expires_at_not_null'),
  })
  expiresAt: string;
}
