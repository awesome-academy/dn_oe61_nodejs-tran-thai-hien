import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { ValidationError } from 'class-validator';
import { Request, Response } from 'express';
import { I18nService } from 'nestjs-i18n';
import { MailErrorCode } from 'src/mail/constants/mail-error.constant';
import { MailException } from 'src/mail/exceptions/mail.exception';
import { ValidationErrorResponse } from '../interfaces/type';
import { CustomLogger } from '../logger/custom-logger.service';
import {
  HTTP_EXCEPTION_CODE,
  UNKNOWN_ERROR_CODE,
} from './constant/code-error.constant';
import { UNKNOWN_MESSAGE } from './constant/message-error.constant';
@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  constructor(
    private readonly i18nService: I18nService,
    private readonly loggerService: CustomLogger,
  ) {}
  async catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    let status = 400;
    let detail: object | string | undefined;
    let code: string | number = UNKNOWN_ERROR_CODE;
    let message: string | object = UNKNOWN_MESSAGE;
    this.loggerService.error(
      'Error catch by filter',
      JSON.stringify(exception),
    );
    if (exception instanceof MailException) {
      status = this.mapMailStatus(exception.code);
      code = exception.code;
      message = this.i18nService.translate(
        `common.mail.send.${this.mapMailKey(exception.code)}`,
      );
      detail = exception?.detail;
    }
    if (exception instanceof HttpException) {
      code = HTTP_EXCEPTION_CODE;
      status = exception.getStatus();
      message = exception.message;
      const errorResponse = exception.getResponse();
      this.loggerService.log(
        'Response error validation:: ',
        JSON.stringify(errorResponse),
      );
      if (typeof errorResponse === 'string') {
        message = errorResponse;
        code = HttpStatus[status];
      } else if (typeof errorResponse === 'object' && errorResponse !== null) {
        const {
          message: msg,
          error: err,
          statusCode,
          ...rest
        } = errorResponse as Record<string, unknown>;
        message = (msg as string) ?? HTTP_EXCEPTION_CODE;
        detail = Object.keys(rest).length > 0 ? rest : undefined;
        code =
          (typeof err === 'string' ? err : HttpStatus[status]) ??
          HTTP_EXCEPTION_CODE;
        status = typeof statusCode === 'number' ? statusCode : status;
      }
      const validationErrorResponse =
        exception.getResponse() as ValidationErrorResponse;
      const validationMessage = validationErrorResponse.message;
      if (Array.isArray(validationMessage)) {
        status = HttpStatus.BAD_REQUEST;
        message = this.i18nService.translate('common.validation.error');
        detail = await this.formatErrors(validationMessage);
      }
    }
    response.status(status).json({
      code,
      message,
      path: request.url,
      timestamp: new Date().toISOString(),
      details: detail,
    });
  }
  private mapMailKey(code: MailErrorCode): string {
    switch (code) {
      case MailErrorCode.TIME_OUT:
        return 'timeout';
      case MailErrorCode.TEMPLATE_ERROR:
        return 'templateError';
      case MailErrorCode.INVALID_RECIPIENT:
        return 'invalidRecipient';
      case MailErrorCode.INVALID_PAYLOAD:
        return 'invaliPayload';
      default:
        return 'serverError';
    }
  }
  private mapMailStatus(code: MailErrorCode): number {
    switch (code) {
      case MailErrorCode.INVALID_RECIPIENT:
        return HttpStatus.BAD_REQUEST;
      case MailErrorCode.TIME_OUT:
        return HttpStatus.GATEWAY_TIMEOUT;
      case MailErrorCode.TEMPLATE_ERROR:
      case MailErrorCode.SERVER_ERROR:
      default:
        return HttpStatus.INTERNAL_SERVER_ERROR;
    }
  }
  // private async formatErrors(
  //   errors: ValidationError[],
  // ): Promise<{ field: string; message: string[] }[]> {
  //   return Promise.all(
  //     errors.map(async (err) => {
  //       const translated = await Promise.all(
  //         Object.values(err.constraints || {}).map((constraint) => {
  //           const [key, argsRaw] = constraint.split('|');
  //           let args: Record<string, unknown> = {};
  //           try {
  //             args = argsRaw
  //               ? (JSON.parse(argsRaw) as Record<string, unknown>)
  //               : {};
  //           } catch (exception) {
  //             this.loggerService.error(
  //               'Parse constraint field failed',
  //               JSON.stringify(exception),
  //             );
  //             args = {};
  //           }
  //           if (Array.isArray(args.constraints)) {
  //             args.constraints.forEach(
  //               (value, index) =>
  //                 (args[`constraint${index + 1}`] = value) as string,
  //             );
  //           }
  //           return this.i18nService.translate<string>(key, { args }) as string;
  //         }),
  //       );
  //       return { field: err.property, message: translated };
  //     }),
  //   );
  // }
  private async formatErrors(
    errors: ValidationError[],
    parentField = '',
  ): Promise<{ field: string; message: string[] }[]> {
    const formatted: { field: string; message: string[] }[] = [];

    for (const err of errors) {
      const field = parentField
        ? `${parentField}.${err.property}`
        : err.property;
      if (err.constraints) {
        const translated = await Promise.all(
          Object.values(err.constraints).map((constraint) => {
            const [key, argsRaw] = constraint.split('|');
            let args: Record<string, unknown> = {};
            try {
              args = argsRaw
                ? (JSON.parse(argsRaw) as Record<string, unknown>)
                : {};
            } catch {
              args = {};
            }
            if (Array.isArray(args.constraints)) {
              args.constraints.forEach((value, index) => {
                args[`constraint${index + 1}`] = value;
              });
            }
            return this.i18nService.translate<string>(key, { args }) as string;
          }),
        );
        formatted.push({ field, message: translated });
      }

      if (err.children && err.children.length > 0) {
        const childErrors = await this.formatErrors(err.children, field);
        formatted.push(...childErrors);
      }
    }

    return formatted;
  }
}
