export function casablancaDay(date: Date = new Date()): string {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Africa/Casablanca',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
  return parts.replaceAll('/', '-');
}

export function casablancaWeek(date: Date = new Date()): string {
  const [y, m, d] = casablancaDay(date).split('-').map(Number);
  const utc = Date.UTC(y, m - 1, d);
  const dow = (new Date(utc).getUTCDay() + 6) % 7;
  const monday = new Date(Date.UTC(y, m - 1, d - dow));
  return monday.toISOString().slice(0, 10);
}

export function casablancaDateAt(day: string, hour = 0, minute = 0, second = 0): Date {
  const [y, m, d] = day.split('-').map(Number);
  return new Date(
    `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}T${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}:${String(second).padStart(2, '0')}+01:00`
  );
}

export function yesterdayCasablanca(day: string): string {
  return shiftCasablanca(day, -1);
}

export function tomorrowCasablanca(day: string): string {
  return shiftCasablanca(day, 1);
}

export function shiftCasablanca(day: string, days: number): string {
  const [y, m, d] = day.split('-').map(Number);
  const shifted = new Date(Date.UTC(y, m - 1, d + days));
  return shifted.toISOString().slice(0, 10);
}