import { Role, User } from '@prisma/client';

export type UserSummaryType = User & { role: Role };
