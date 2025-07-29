import dayjs from 'dayjs';
import { SupportedLocalesType } from '../constants/locales.constant';

export function parseExpiresInToDate(expiresIn: number | string): Date {
  let seconds = 0;
  const numberRegex = /^\d+$/;
  if (typeof expiresIn == 'number') seconds = expiresIn;
  else if (numberRegex.test(expiresIn)) {
    seconds = parseInt(expiresIn, 10);
  } else {
    const timeUnitRegex = /[dhms]/i;
    if (!timeUnitRegex.test(expiresIn)) {
      throw new Error('ExpiresIn must include a time unit (s/m/h/d)');
    }
    const regex = /^(\d+)\s*(d|h|m|s)$/i;
    const match = expiresIn.match(regex);
    if (!match) throw new Error('Expiresin invalid format');
    const value = parseInt(match[1], 10);
    switch (match[2].toLowerCase()) {
      case 'd':
        seconds = value * 86400;
        break;
      case 'h':
        seconds = value * 3600;
        break;
      case 'm':
        seconds = value * 60;
        break;
      case 's':
        seconds = value;
        break;
    }
  }
  return new Date(Date.now() + seconds * 1000);
}
export function formatDateTime(
  date: Date,
  lang: SupportedLocalesType = 'vi',
): string {
  return dayjs(date)
    .locale(lang)
    .format(lang === 'vi' ? 'DD/MM/YY HH:mm' : 'MMM D,YYYY, h:mm A');
}
export function convertTimeToDate(baseDate: Date, timeStr: string): Date {
  const [hours, minutes] = timeStr.split(':').map(Number);
  const date = new Date(baseDate);
  date.setHours(hours, minutes, 0, 0);
  return date;
}
export function isSameDay(date1: Date, date2: Date): boolean {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
}
