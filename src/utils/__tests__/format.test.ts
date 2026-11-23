import { describe, it, expect } from 'vitest';
import { formatCurrency, formatQuantity, formatDate, formatDateTime } from '../format';

describe('format utils', () => {
  it('formats currency in Indian numbering style', () => {
    expect(formatCurrency('0')).toBe('₹ 0.00');
    expect(formatCurrency('1250.00')).toBe('₹ 1,250.00');
    expect(formatCurrency('1234567.89')).toBe('₹ 12,34,567.89');
    expect(formatCurrency('-500.50')).toBe('-₹ 500.50');
    expect(formatCurrency(undefined)).toBe('₹ 0.00');
  });

  it('formats quantities with optional unit', () => {
    expect(formatQuantity('10.5')).toBe('10.500');
    expect(formatQuantity('10.5', 'kg')).toBe('10.500 kg');
    expect(formatQuantity(undefined, 'meter')).toBe('0.000 meter');
  });

  it('formats dates safely', () => {
    expect(formatDate('2026-11-20')).toBe('20 Nov 2026');
    expect(formatDate(undefined)).toBe('-');
    expect(formatDate('')).toBe('-');
  });

  it('formats date and time safely', () => {
    expect(formatDateTime('2026-11-20T10:30:00Z')).toMatch(/20 Nov 2026/);
    expect(formatDateTime(undefined)).toBe('-');
  });
});
