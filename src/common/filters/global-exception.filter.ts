import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { I18nService } from 'nestjs-i18n';
@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  constructor(private readonly i18nService: I18nService) {}
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    let status = 400;
    let detail: object | string | undefined;
    let code = 'UNKNOWN_ERROR';
    let message: string | object = 'unknown message';
    if (exception instanceof HttpException) {
      status = exception.getStatus();
      message = exception.getResponse();
      code = 'HttpException';
    }
    response.status(status).json({
      code,
      message,
      path: request.url,
      timestamp: new Date().toISOString(),
      details: detail,
    });
  }
}
