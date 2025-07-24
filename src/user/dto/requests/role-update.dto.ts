import { IsEnum, IsNotEmpty } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';
import { Role } from 'src/common/enums/role.enum';

export class RoleUpdateRequestDto {
  @IsEnum(Role, {
    message: i18nValidationMessage('common.validation.isEnum', {
      field: 'role',
    }),
  })
  @IsNotEmpty({
    message: i18nValidationMessage('common.user.action.roleMissing'),
  })
  role: string;
}
