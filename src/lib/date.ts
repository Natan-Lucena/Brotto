export function localDayKey(date = new Date()) {
  return date.toLocaleDateString('en-CA');
}
export function timezoneAt(date = new Date()) {
  return (
    Intl.DateTimeFormat().resolvedOptions().timeZone ||
    date.getTimezoneOffset().toString()
  );
}
