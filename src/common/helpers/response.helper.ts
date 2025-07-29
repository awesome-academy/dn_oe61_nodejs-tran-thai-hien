import { HttpStatus } from '@nestjs/common';
import { StatusKey } from '../enums/status-key.enum';

export function resolveSuccess(
  statusCode: HttpStatus,
  statusKey: StatusKey,
): boolean {
  if (statusCode < HttpStatus.OK || statusCode >= HttpStatus.AMBIGUOUS) {
    return false;
  }
  if ([StatusKey.FAILED].includes(statusKey)) {
    return false;
  }
  return true;
}
