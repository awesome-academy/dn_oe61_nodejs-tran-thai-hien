import { ApiResponse } from '@nestjs/swagger';

function createApiErrorResponse(
  status: number,
  code: string,
  message: string,
  examplePath: string,
  description: string,
  extra: object | [] = {},
) {
  return ApiResponse({
    status,
    description: description,
    schema: {
      example: {
        code,
        message,
        path: examplePath,
        timestamp: new Date().toISOString(),
        ...extra,
      },
    },
  });
}
export function ApiErrorBadRequestValidation(
  description: string,
  details?: Record<string, unknown>[],
  path = '/path',
) {
  return createApiErrorResponse(
    400,
    'Bad Request',
    'Validation Error',
    path,
    description,
    {
      details: details,
    },
  );
}

export function ApiErrorBadRequest(
  description: string,
  message: string,
  path = '/path',
  details?: Record<string, unknown>[] | object,
) {
  return createApiErrorResponse(
    400,
    'Bad Request',
    message,
    path,
    description,
    { details: details },
  );
}

export function ApiErrorNotFound(
  description: string,
  message: string,
  path = '/path',
) {
  return createApiErrorResponse(404, 'Not Found', message, path, description);
}

export function ApiErrorConflict(
  description: string,
  message = 'Conflict occurred',
  path = '/path',
) {
  return createApiErrorResponse(409, 'Conflict', message, path, description);
}

export function ApiErrorInternal(path = '/path') {
  return createApiErrorResponse(
    500,
    'Internal Server Error',
    'An unexpected error occurred',
    path,
    'Internal Server Error',
  );
}
export function ApiErrorUnauthorized(
  description: 'Unauthorized',
  message = 'Unauthorized',
  path = '/path',
) {
  return createApiErrorResponse(
    401,
    'Unauthorized',
    message,
    path,
    description,
  );
}

export function ApiErrorForbidden(
  description: 'Forbidden',
  message = 'Forbidden',
  path = '/path',
) {
  return createApiErrorResponse(403, 'Forbidden', message, path, description);
}
