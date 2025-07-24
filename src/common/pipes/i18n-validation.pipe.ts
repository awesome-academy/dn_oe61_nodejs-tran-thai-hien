import {
  ArgumentMetadata,
  BadRequestException,
  HttpException,
  Injectable,
  ValidationPipe,
} from '@nestjs/common';
import { ValidationError } from 'class-validator';
import { I18nService } from 'nestjs-i18n';
import { ValidationErrorResponse } from '../interfaces/type';
@Injectable()
export class I18nValidationPipe extends ValidationPipe {
  constructor(private readonly i18n: I18nService) {
    super({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
      exceptionFactory: (errors: ValidationError[]) => errors,
    });
  }

  private async formatErrors(
    errors: ValidationError[],
  ): Promise<{ field: string; message: string[] }[]> {
    return Promise.all(
      errors.map(async (err) => {
        const translated = await Promise.all(
          Object.values(err.constraints || {}).map((constraint) => {
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
              args.constraints.forEach(
                (value, index) =>
                  (args[`constraint${index + 1}`] = value) as string,
              );
            }

            return this.i18n.translate<string>(key, { args }) as string;
          }),
        );

        return { field: err.property, message: translated };
      }),
    );
  }

  private isValidationErrorResponse(
    response: unknown,
  ): response is ValidationErrorResponse {
    return (
      typeof response === 'object' &&
      response !== null &&
      'message' in response &&
      Array.isArray((response as { message?: unknown }).message)
    );
  }

  async transform(
    value: unknown,
    metadata: ArgumentMetadata,
  ): Promise<unknown> {
    try {
      return await super.transform(value, metadata);
    } catch (error) {
      if (error instanceof HttpException) {
        const response = error.getResponse();
        if (this.isValidationErrorResponse(response)) {
          const formatted = await this.formatErrors(response.message);
          throw new BadRequestException(formatted);
        }
        throw error;
      }
      if (
        Array.isArray(error) &&
        error.every((e) => e instanceof ValidationError)
      ) {
        const formatted = await this.formatErrors(error);
        throw new BadRequestException(formatted);
      }

      throw error;
    }
  }
}
