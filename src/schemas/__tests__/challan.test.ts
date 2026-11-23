import { describe, it, expect } from 'vitest';
import { createChallanSchema } from '../challan';

describe('createChallanSchema', () => {
  it('validates a correct challan payload', () => {
    const valid = {
      invoice: 1,
      delivery_date: '2026-11-20',
      delivered_by: 'Driver Ramesh',
      received_by: 'Gate Security',
      items: [
        {
          invoice_item: 10,
          quantity: '5.000',
        },
      ],
    };

    const res = createChallanSchema.safeParse(valid);
    expect(res.success).toBe(true);
  });

  it('rejects missing invoice or empty items array', () => {
    const invalid = {
      invoice: 0,
      delivery_date: '2026-11-20',
      delivered_by: 'Driver',
      received_by: 'Security',
      items: [],
    };

    const res = createChallanSchema.safeParse(invalid);
    expect(res.success).toBe(false);
    if (!res.success) {
      expect(res.error.errors.some((e) => e.path.includes('invoice'))).toBe(true);
      expect(res.error.errors.some((e) => e.path.includes('items'))).toBe(true);
    }
  });

  it('rejects negative or zero item quantities', () => {
    const invalid = {
      invoice: 1,
      delivery_date: '2026-11-20',
      delivered_by: 'Driver',
      received_by: 'Security',
      items: [
        {
          invoice_item: 1,
          quantity: '0.000',
        },
      ],
    };

    const res = createChallanSchema.safeParse(invalid);
    expect(res.success).toBe(false);
  });
});
