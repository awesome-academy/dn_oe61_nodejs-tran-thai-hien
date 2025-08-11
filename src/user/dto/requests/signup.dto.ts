import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MinLength,
} from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';
import { MIN_PASSWORD } from 'src/common/constants/auth.constant';
import { REGEX_PHONE_NUMBER_VI } from 'src/common/constants/phone-number.dto';
export class SignupDto {
  @ApiProperty({ example: 'Tran A', description: 'Full name' })
  @IsNotEmpty({
    message: i18nValidationMessage(
      'common.auth.signup.validation.nameNotEmpty',
    ),
  })
  name: string;
  @IsEmail()
  @ApiProperty({
    example: 'tran@example.com',
    description: 'Email address',
  })
  email: string;
  @ApiProperty({
    example: 'leo123',
    description: 'Username',
  })
  @IsNotEmpty({
    message: i18nValidationMessage(
      'common.auth.signup.validation.userNameNotEmpty',
    ),
  })
  userName: string;
  @ApiProperty({
    example: 'password123',
    description: 'Password',
  })
  @MinLength(MIN_PASSWORD, {
    message: i18nValidationMessage(
      'common.auth.signup.validation.passwordMindLength',
    ),
  })
  password: string;
  @ApiProperty({
    example: 'Im student 4 year in DN',
    description: 'Bio',
  })
  @IsOptional()
  @IsString()
  bio?: string;
  @IsOptional()
  @IsString()
  @ApiProperty({
    example: 'Da Nang Street',
    description: 'Address',
  })
  address?: string;
  @IsOptional()
  @Matches(REGEX_PHONE_NUMBER_VI, {
    message: i18nValidationMessage(
      'common.auth.signup.validation.invalidFormatPhone',
    ),
  })
  @ApiProperty({
    example: '0769609113',
    description: 'Phone number',
  })
  phone?: string;
}
