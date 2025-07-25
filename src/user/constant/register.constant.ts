export const REGISTER_TYPE = {
  NEW_REGISTER: 'NEW_REGISTER',
  PENDING_VERIFY: 'PENDING_VERIFY',
} as const;

export type RegisterType = (typeof REGISTER_TYPE)[keyof typeof REGISTER_TYPE];
