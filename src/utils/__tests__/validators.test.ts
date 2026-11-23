import { describe, it, expect } from 'vitest';
import { isValidGstin, isValidPhone } from '../validators';

describe('validators utils', () => {
  it('validates 15-character Indian GSTINs correctly', () => {
    expect(isValidGstin('33AAAAA0000A1Z5')).toBe(true);
    expect(isValidGstin('33ABCDE1234F1Z5')).toBe(true);
    expect(isValidGstin('INVALID_GSTIN')).toBe(false);
    expect(isValidGstin('')).toBe(false);
    expect(isValidGstin(undefined)).toBe(false);
  });

  it('validates phone numbers between 10 and 15 digits', () => {
    expect(isValidPhone('9840123456')).toBe(true);
    expect(isValidPhone('04424567890')).toBe(true);
    expect(isValidPhone('123')).toBe(false);
    expect(isValidPhone('abcdefghij')).toBe(false);
    expect(isValidPhone(undefined)).toBe(false);
  });
});
