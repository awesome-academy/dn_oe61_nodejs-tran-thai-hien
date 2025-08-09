import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';
import { Role } from 'src/common/enums/role.enum';

export class RoleUpdateRequestDto {
  @ApiProperty({
    description: 'The new role to assign to the user',
    enum: Role,
    example: Role.MODERATOR,
  })
  @IsEnum(Role, {
    message: i18nValidationMessage('common.validation.isEnum', {
      field: 'role',
      enum: '(user/moderator/admin)',
    }),
  })
  @IsNotEmpty({
    message: i18nValidationMessage('common.user.action.roleMissing'),
  })
  role: string;
}
