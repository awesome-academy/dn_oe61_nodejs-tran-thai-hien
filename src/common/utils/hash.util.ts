import * as bcrypt from 'bcrypt';
export async function hashPassword(
  rawPassword: string,
  saltRound: number = 10,
): Promise<string> {
  return await bcrypt.hash(rawPassword, saltRound);
}
export async function comparePassword(
  plainPassword: string,
  hashedPassword: string,
): Promise<boolean> {
  return await bcrypt.compare(plainPassword, hashedPassword);
}
