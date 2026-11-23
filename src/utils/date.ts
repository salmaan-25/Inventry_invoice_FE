import dayjs, { type Dayjs } from 'dayjs';

export function toApiDate(date: Dayjs | Date | string | null | undefined): string | undefined {
  if (!date) return undefined;
  const d = dayjs(date);
  return d.isValid() ? d.format('YYYY-MM-DD') : undefined;
}

export function todayApiDate(): string {
  return dayjs().format('YYYY-MM-DD');
}

export function isValidRange(from?: string, to?: string): boolean {
  if (!from || !to) return true;
  const fromDay = dayjs(from);
  const toDay = dayjs(to);
  if (!fromDay.isValid() || !toDay.isValid()) return false;
  return fromDay.isSame(toDay, 'day') || fromDay.isBefore(toDay, 'day');
}
