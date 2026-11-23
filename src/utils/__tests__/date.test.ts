import { describe, it, expect } from 'vitest';
import { toApiDate, todayApiDate, isValidRange } from '../date';

describe('date utils', () => {
  it('formats to API YYYY-MM-DD date format', () => {
    expect(toApiDate('2026-11-20T10:00:00Z')).toBe('2026-11-20');
    expect(toApiDate(null)).toBeUndefined();
  });

  it('returns today in API format', () => {
    expect(todayApiDate()).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it('validates date ranges correctly', () => {
    expect(isValidRange('2026-11-01', '2026-11-20')).toBe(true);
    expect(isValidRange('2026-11-20', '2026-11-20')).toBe(true);
    expect(isValidRange('2026-11-25', '2026-11-20')).toBe(false);
    expect(isValidRange(undefined, '2026-11-20')).toBe(true);
    expect(isValidRange('invalid', '2026-11-20')).toBe(false);
  });
});
