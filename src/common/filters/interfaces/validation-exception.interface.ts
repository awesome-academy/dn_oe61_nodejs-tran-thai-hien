import { ValidationError } from 'class-validator';

export interface ValidationExceptionResponse {
  statusCode: number;
  message: ValidationError[] | string[];
  error: string;
}
