import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserStatus } from '@prisma/client';
import { Transform, Type } from 'class-transformer';
import { IsBoolean, IsEnum, IsInt, IsOptional } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';
import { Role } from 'src/common/enums/role.enum';

export class StatusUserUpdateRequest {
  @ApiProperty({
    description: 'User Id',
    example: 1,
  })
  @Type(() => Number)
  @IsInt({
    message: i18nValidationMessage('common.validation.isInt', {
      field: 'userId',
    }),
  })
  id: number;
  @ApiProperty({
    description: 'The new role to assign to the user',
    enum: Role,
    example: Role.USER,
  })
  @Transform(({ value }) => {
    if (value == null) return undefined;
    return String(value).toUpperCase();
  })
  @IsOptional()
  @IsEnum(Role, {
    message: i18nValidationMessage('common.validation.isEnum', {
      field: 'role',
      enum: '(user/moderator/admin)',
    }),
  })
  role?: Role;
  @ApiPropertyOptional({
    description:
      'New status of the user account. Must be one of the allowed values.',
    enum: UserStatus,
    example: UserStatus.ACTIVE,
    nullable: true,
  })
  @Transform(({ value }) => {
    if (value == null) return undefined;
    return String(value).toUpperCase();
  })
  @IsOptional()
  @IsEnum(UserStatus, {
    message: i18nValidationMessage('common.validation.isEnum', {
      field: 'status',
      enum: '(active/deactived)',
    }),
  })
  status?: UserStatus;
  @ApiProperty({
    description: 'Indicates whether the property is verified',
    example: true,
    type: Boolean,
  })
  @IsOptional()
  @IsBoolean({
    message: i18nValidationMessage('common.validation.isBoolean'),
  })
  @Type(() => Boolean)
  isVerified?: boolean;
}
