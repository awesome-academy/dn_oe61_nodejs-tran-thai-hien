export function formatPhoneNumberSms(number: string): string {
  if (number.startsWith('+')) {
    return number;
  }
  if (number.startsWith('0')) {
    return '+84' + number.slice(1);
  }
  return number;
}
