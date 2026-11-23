import { describe, it, expect } from 'vitest';
import { gstinSchema, phoneSchema, dateRangeSchema } from '../common';

describe('common zod schemas', () => {
  it('validates GSTIN schema', () => {
    expect(gstinSchema.safeParse('33AAAAA0000A1Z5').success).toBe(true);
    expect(gstinSchema.safeParse('').success).toBe(true);
    expect(gstinSchema.safeParse('BADGSTIN').success).toBe(false);
  });

  it('validates Phone schema', () => {
    expect(phoneSchema.safeParse('9840123456').success).toBe(true);
    expect(phoneSchema.safeParse('123').success).toBe(false);
  });

  it('validates date range schema', () => {
    expect(dateRangeSchema.safeParse({ from: '2026-11-01', to: '2026-11-20' }).success).toBe(true);
    expect(dateRangeSchema.safeParse({ from: '2026-11-25', to: '2026-11-20' }).success).toBe(false);
  });
});
