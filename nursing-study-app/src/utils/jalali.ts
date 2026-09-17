// تقویم هجری شمسی (جلالی)
// Every date the user sees — Leitner review dates, "last read", streak dates —
// is shown in the Persian solar calendar, because that is the calendar an
// Iranian user actually plans their week around. Storage stays ISO/Gregorian;
// only the display layer converts.

export const JALALI_MONTHS = [
  'فروردین', 'اردیبهشت', 'خرداد',
  'تیر', 'مرداد', 'شهریور',
  'مهر', 'آبان', 'آذر',
  'دی', 'بهمن', 'اسفند',
];

export const JALALI_WEEKDAYS = [
  'یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنجشنبه', 'جمعه', 'شنبه',
];

// Persian seasons — used for the subtle seasonal accent on the home screen.
export type PersianSeason = 'بهار' | 'تابستان' | 'پاییز' | 'زمستان';

export interface JalaliDate {
  year: number;
  month: number; // 1-12
  day: number; // 1-31
}

function div(a: number, b: number): number {
  return Math.floor(a / b);
}

/**
 * Gregorian → Jalali. Standard algorithm (Borkowski / Jalaali variants).
 */
export function toJalali(gy: number, gm: number, gd: number): JalaliDate {
  const gDaysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  const jDaysInMonth = [31, 31, 31, 31, 31, 31, 30, 30, 30, 30, 30, 29];

  let gy2 = gm > 2 ? gy + 1 : gy;
  let days =
    355666 +
    365 * gy +
    div(gy2 + 3, 4) -
    div(gy2 + 99, 100) +
    div(gy2 + 399, 400) +
    gd +
    gDaysInMonth.slice(0, gm - 1).reduce((a, b) => a + b, 0);

  let jy = -1595 + 33 * div(days, 12053);
  days %= 12053;

  jy += 4 * div(days, 1461);
  days %= 1461;

  if (days > 365) {
    jy += div(days - 1, 365);
    days = (days - 1) % 365;
  }

  let jm: number;
  let jd: number;
  if (days < 186) {
    jm = 1 + div(days, 31);
    jd = 1 + (days % 31);
  } else {
    jm = 7 + div(days - 186, 30);
    jd = 1 + ((days - 186) % 30);
  }

  // jDaysInMonth is kept for callers that need month lengths
  void jDaysInMonth;

  return { year: jy, month: jm, day: jd };
}

export function dateToJalali(date: Date): JalaliDate {
  return toJalali(date.getFullYear(), date.getMonth() + 1, date.getDate());
}

const FA_DIGITS = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
function fa(n: number | string): string {
  return String(n).replace(/[0-9]/g, (d) => FA_DIGITS[Number(d)]);
}

/** "۲۴ مهر ۱۴۰۴" */
export function formatJalali(date: Date): string {
  const j = dateToJalali(date);
  return `${fa(j.day)} ${JALALI_MONTHS[j.month - 1]} ${fa(j.year)}`;
}

/** "۲۴ مهر" — for compact contexts like list rows */
export function formatJalaliShort(date: Date): string {
  const j = dateToJalali(date);
  return `${fa(j.day)} ${JALALI_MONTHS[j.month - 1]}`;
}

/** "پنجشنبه، ۲۴ مهر ۱۴۰۴" */
export function formatJalaliWithWeekday(date: Date): string {
  return `${JALALI_WEEKDAYS[date.getDay()]}، ${formatJalali(date)}`;
}

export function seasonOf(date: Date): PersianSeason {
  const m = dateToJalali(date).month;
  if (m <= 3) return 'بهار';
  if (m <= 6) return 'تابستان';
  if (m <= 9) return 'پاییز';
  return 'زمستان';
}

/**
 * Human-friendly relative wording for Leitner due dates, in Persian.
 * Review scheduling is the place the user reads dates most often, so the
 * common cases get words rather than a date they have to decode.
 */
export function relativeDayLabel(target: Date, from: Date = new Date()): string {
  const startOf = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  const diffDays = Math.round((startOf(target) - startOf(from)) / 86400000);

  if (diffDays === 0) return 'امروز';
  if (diffDays === 1) return 'فردا';
  if (diffDays === 2) return 'پس‌فردا';
  if (diffDays === -1) return 'دیروز';
  if (diffDays === -2) return 'پریروز';
  if (diffDays < 0) return `${fa(Math.abs(diffDays))} روز پیش`;
  if (diffDays <= 30) return `${fa(diffDays)} روز دیگر`;
  return formatJalaliShort(target);
}

/**
 * Nowruz and a few widely-kept Iranian seasonal markers (not religious dates).
 * Used only for a small, optional greeting line on the home screen.
 */
export function culturalNote(date: Date = new Date()): string | null {
  const j = dateToJalali(date);
  if (j.month === 1 && j.day <= 4) return 'نوروزتان پیروز — سال نو مبارک';
  if (j.month === 1 && j.day >= 12 && j.day <= 13) return 'سیزده‌به‌در خوش بگذرد';
  if (j.month === 9 && j.day === 30) return 'شب یلدا مبارک — طولانی‌ترین شب سال';
  if (j.month === 11 && j.day === 10) return 'جشن سده';
  if (j.month === 12 && j.day >= 24) return 'چهارشنبه‌سوری و بهار نزدیک است';
  return null;
}
