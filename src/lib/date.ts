export function localDayKey(date = new Date()) {
  return date.toLocaleDateString('en-CA');
}
export function timezoneAt(date = new Date()) {
  return (
    Intl.DateTimeFormat().resolvedOptions().timeZone ||
    date.getTimezoneOffset().toString()
  );
}

export function greetingForHour(hour: number) {
  if (hour < 12) return 'Bom dia';
  if (hour < 18) return 'Boa tarde';
  return 'Boa noite';
}
