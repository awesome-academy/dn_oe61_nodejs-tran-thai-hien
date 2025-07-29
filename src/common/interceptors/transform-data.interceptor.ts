import {
  CallHandler,
  ExecutionContext,
  HttpStatus,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Response } from 'express';
import { I18nService } from 'nestjs-i18n';
import { map, Observable } from 'rxjs';
import { MESSAGE_ACTION_PREFIX } from '../constants/transform-data.constant';
import {
  MESSAGE_RESOURCE_ACTION,
  MESSAGE_RESOURCE_KEY,
} from '../decorators/resource.decorator';
import { StatusKey } from '../enums/status-key.enum';
import { getResourceName } from '../helpers/resource-name.helper';
import { resolveSuccess } from '../helpers/response.helper';
import { CustomLogger } from '../logger/custom-logger.service';
import {
  isBaseResponse,
  normalizePayload,
  parseStatusKey,
} from '../utils/data.util';
import { getTranslatedMessage } from '../helpers/i18n.helper';

@Injectable()
export class TransformDataInterceptor implements NestInterceptor {
  constructor(
    private readonly reflector: Reflector,
    private readonly i18nService: I18nService,
    private readonly loggerService: CustomLogger,
  ) {}
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const ctx = context.switchToHttp();
    const response = ctx.getResponse<Response>();
    const resourceName =
      this.reflector.getAllAndOverride<string>(MESSAGE_RESOURCE_KEY, [
        context.getHandler(),
      ]) || getResourceName(context).toLowerCase();
    const resourceAction =
      this.reflector.getAllAndOverride<string>(MESSAGE_RESOURCE_ACTION, [
        context.getHandler(),
      ]) || context.getHandler().name;
    return next.handle().pipe(
      map((data) => {
        const statusCode = response.statusCode;
        const isResponse = isBaseResponse(data);
        const statusKey = parseStatusKey(
          isResponse ? data.statusKey : undefined,
          statusCode,
        );
        if (statusKey == StatusKey.UNCHANGED) {
          response.status(HttpStatus.NO_CONTENT);
        }
        let messageActionPrefix = MESSAGE_ACTION_PREFIX;
        if (!messageActionPrefix) {
          messageActionPrefix = 'action';
          this.loggerService.warn(
            "MESSAGE_ACTION_PREFIX is undefined - fallback to 'action'",
          );
        }
        const messageKey = `common.${resourceName}.${messageActionPrefix}.${resourceAction}.${statusKey}`;
        this.loggerService.debug(
          this.i18nService.translate(messageKey) instanceof Promise
            ? 'Promise'
            : 'Non-Promise',
        );
        const message = getTranslatedMessage(
          this.i18nService,
          messageKey,
          'Operation completed',
          this.loggerService,
        );
        const payload = isResponse
          ? normalizePayload(data.data)
          : normalizePayload(data);
        return {
          success: resolveSuccess(statusCode, statusKey),
          statusCode: statusCode,
          message,
          payload,
        };
      }),
    );
  }
}
