export function omitData<T, K extends keyof T>(obj: T, keyExculeds: K[]) {
  const clone = { ...obj };
  keyExculeds.forEach((key) => delete clone[key]);
  return clone;
}
export function removeEmpty<T extends object>(obj: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(obj).filter(
      ([, value]) => value !== undefined && value !== null,
    ),
  ) as Partial<T>;
}
