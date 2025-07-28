import { SetMetadata } from '@nestjs/common';
import { Role } from '../enums/role.enum';
export const HAS_ROLE_KEY = 'has_role_key';
export const HasRole = (...roles: Role[]) => SetMetadata(HAS_ROLE_KEY, roles);
