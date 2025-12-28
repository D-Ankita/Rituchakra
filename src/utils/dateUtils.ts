import {
  format,
  differenceInDays,
  startOfDay,
  addDays,
  isSameDay,
  isWithinInterval,
} from 'date-fns';

export function formatDate(date: Date): string {
  return format(date, 'MMM d, yyyy');
}

export function formatShortDate(date: Date): string {
  return format(date, 'MMM d');
}

export function formatDayMonth(date: Date): string {
  return format(date, 'd MMM');
}

export function getMidnight(date: Date): Date {
  return startOfDay(date);
}

export function getMidnightTimestamp(date: Date): number {
  return startOfDay(date).getTime();
}

export function daysBetween(start: Date, end: Date): number {
  return differenceInDays(startOfDay(end), startOfDay(start));
}

export function isDateInRange(
  date: Date,
  start: Date,
  end: Date
): boolean {
  return isWithinInterval(startOfDay(date), {
    start: startOfDay(start),
    end: startOfDay(end),
  });
}

export function isSameDate(a: Date, b: Date): boolean {
  return isSameDay(a, b);
}

export { addDays, format };
