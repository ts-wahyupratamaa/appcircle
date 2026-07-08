const WIB_OFFSET_MS = 7 * 60 * 60 * 1000;
const DAY_MS = 86_400_000;

const DAY_LABELS = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'] as const;

function wibParts(date = new Date()) {
  const wib = new Date(date.getTime() + WIB_OFFSET_MS);
  return {
    year: wib.getUTCFullYear(),
    month: wib.getUTCMonth(),
    day: wib.getUTCDate(),
    weekday: wib.getUTCDay(),
  };
}

export function getDateKeyWIB(date: Date = new Date()): string {
  const { year, month, day } = wibParts(date);
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

export function getTodayWIB(): string {
  return getDateKeyWIB(new Date());
}

export function parseDateKeyWIB(key: string): Date {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d) - WIB_OFFSET_MS);
}

export function addDaysWIB(key: string, days: number): string {
  const next = parseDateKeyWIB(key).getTime() + days * DAY_MS;
  return getDateKeyWIB(new Date(next));
}

export function getYesterdayWIB(from: string = getTodayWIB()): string {
  return addDaysWIB(from, -1);
}

export function isNewDayWIB(lastSettledDate: string | null, today: string = getTodayWIB()): boolean {
  if (!lastSettledDate) {
    return true;
  }
  return lastSettledDate < today;
}

/** Senin–Minggu (ISO week style, Senin = start) */
export function getWeekRangeWIB(date: Date | string = new Date()): { start: string; end: string } {
  const key = typeof date === 'string' ? date : getDateKeyWIB(date);
  const { weekday } = wibParts(parseDateKeyWIB(key));
  const mondayOffset = weekday === 0 ? -6 : 1 - weekday;
  const start = addDaysWIB(key, mondayOffset);
  const end = addDaysWIB(start, 6);
  return { start, end };
}

export function getMonthKeyWIB(date: Date | string = new Date()): string {
  const key = typeof date === 'string' ? date : getDateKeyWIB(date);
  return key.slice(0, 7);
}

export function getDayLabelWIB(key: string): string {
  const { weekday } = wibParts(parseDateKeyWIB(key));
  return DAY_LABELS[weekday];
}

export function formatDateWIB(key: string): string {
  const { day, month, year } = wibParts(parseDateKeyWIB(key));
  const months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
    'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des',
  ];
  return `${day} ${months[month]} ${year}`;
}

export function wibNowIso(): string {
  return new Date().toISOString();
}
