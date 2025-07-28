import { HttpStatus } from '@nestjs/common';
import { StatusKey } from '../enums/status-key.enum';
import { BaseResponse } from '../interfaces/base-response';

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
export function buildBaseResponse<T>(
  key: StatusKey,
  data?: T,
): BaseResponse<T> {
  return {
    statusKey: key,
    data: data,
  };
}
export function isBaseResponse(obj: unknown): obj is BaseResponse<unknown> {
  return obj !== null && typeof obj === 'object' && 'statusKey' in obj;
}
export function normalizePayload(
  data: unknown,
): null | Record<string, unknown> | unknown[] | string | number | boolean {
  if (data === undefined || data === null) return null;
  if (Array.isArray(data)) return data as unknown[];
  if (typeof data === 'object') return data as Record<string, unknown>;
  return data as string | number | boolean;
}
export function parseStatusKey(
  statusKey: string | undefined,
  statusCode: HttpStatus,
): StatusKey {
  if (statusKey && Object.values(StatusKey).includes(statusKey as StatusKey)) {
    return statusKey as StatusKey;
  }
  if (statusCode === HttpStatus.NO_CONTENT) return StatusKey.UNCHANGED;
  if (statusCode >= HttpStatus.OK && statusCode < HttpStatus.AMBIGUOUS)
    return StatusKey.SUCCESS;
  return StatusKey.FAILED;
}
