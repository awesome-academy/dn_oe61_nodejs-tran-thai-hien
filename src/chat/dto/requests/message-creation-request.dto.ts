import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsString } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';

export class MessageCreationRequestDto {
  @ApiProperty({
    description: 'ID of the sender',
    example: 1,
  })
  @IsInt({
    message: i18nValidationMessage('common.validation.isInt', {
      field: 'senderId',
    }),
  })
  senderId: number;

  @ApiProperty({
    description: 'ID of the receiver',
    example: 2,
  })
  @IsInt({
    message: i18nValidationMessage('common.validation.isInt', {
      field: 'receiverId',
    }),
  })
  receiverId: number;

  @ApiProperty({
    description: 'Content of the message',
    example: 'Hello, how are you?',
  })
  @IsString({
    message: i18nValidationMessage('common.validation.isString', {
      field: 'content',
    }),
  })
  content: string;
}
