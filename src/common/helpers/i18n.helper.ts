import { I18nService } from 'nestjs-i18n';
import { CustomLogger } from '../logger/custom-logger.service';

export function getTranslatedMessage(
  i18n: I18nService,
  key: string,
  fallback = 'Operation completed',
  logger?: CustomLogger,
): string {
  const translated = i18n.translate<string>(key) as string;
  if (!translated || translated === key) {
    logger?.warn?.(`i18n key "${key}" not found. Fallback: "${fallback}"`);
    return fallback;
  }
  return translated;
}
