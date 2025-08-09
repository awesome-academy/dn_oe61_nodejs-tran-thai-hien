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
  @IsNotEmpty({
    message: i18nValidationMessage(
      'common.auth.signup.validation.userNameNotEmpty',
    ),
  })
  userName: string;
  @ApiProperty({
    example: 'trana',
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
  @Matches(/^(0?)(3[2-9]|5[6|8|9]|7[0|6-9]|8[1-9]|9[0-9])[0-9]{7}$/, {
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
