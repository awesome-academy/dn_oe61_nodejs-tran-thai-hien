import { IsString, Matches } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';
import { REGEX_PHONE_NUMBER_VI } from 'src/common/constants/phone-number.dto';

export class SmsSendPayloadDto {
  @Matches(REGEX_PHONE_NUMBER_VI, {
    message: i18nValidationMessage(
      'common.auth.signup.validation.invalidFormatPhone',
    ),
  })
  to: string;
  @IsString({
    message: i18nValidationMessage('common.validation.isString', {
      field: 'text',
    }),
  })
  text: string;
}
