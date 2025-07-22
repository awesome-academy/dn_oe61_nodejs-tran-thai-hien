export function omitData<T, K extends keyof T>(obj: T, keyExculeds: K[]) {
  const clone = { ...obj };
  keyExculeds.forEach((key) => delete clone[key]);
  return clone;
}
