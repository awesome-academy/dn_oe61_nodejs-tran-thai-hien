import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  UnauthorizedException,
} from '@nestjs/common';
import { Response, Request } from 'express';

@Catch(UnauthorizedException)
export class RedirectUnauthorizedFilter implements ExceptionFilter {
  catch(exception: UnauthorizedException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    if (
      request.headers.accept &&
      request.headers.accept.includes('text/html')
    ) {
      return response.redirect('/login');
    }
    response.status(exception.getStatus()).json({
      code: exception.getStatus(),
      message: exception.message,
      path: request.url,
      timestamp: new Date().toISOString(),
    });
  }
}
