import { describe, it, expect } from 'vitest';
import { createPaymentSchema } from '../payment';
import { PAYMENT_METHOD } from '../../constants/enums';

describe('createPaymentSchema', () => {
  it('validates a correct payment payload where sum matches amount', () => {
    const valid = {
      customer: 1,
      payment_date: '2026-11-20',
      amount: '1500.00',
      method: PAYMENT_METHOD.BANK_TRANSFER,
      reference: 'UTR123456',
      client_token: 'uuid-1234-abcd',
      allocations: [
        { invoice: 1, amount: '1000.00' },
        { invoice: 2, amount: '500.00' },
      ],
    };

    const res = createPaymentSchema.safeParse(valid);
    expect(res.success).toBe(true);
  });

  it('rejects when sum of allocations does not match payment amount', () => {
    const invalid = {
      customer: 1,
      payment_date: '2026-11-20',
      amount: '1500.00',
      method: PAYMENT_METHOD.UPI,
      client_token: 'uuid-1234-abcd',
      allocations: [
        { invoice: 1, amount: '1000.00' },
        { invoice: 2, amount: '400.00' }, // total 1400 != 1500
      ],
    };

    const res = createPaymentSchema.safeParse(invalid);
    expect(res.success).toBe(false);
    if (!res.success) {
      expect(res.error.errors.some((e) => e.path.includes('allocations'))).toBe(true);
    }
  });

  it('rejects invalid payment method or zero amount', () => {
    const invalid = {
      customer: 1,
      payment_date: '2026-11-20',
      amount: '0.00',
      method: 'BITCOIN',
      client_token: 'uuid-1234',
      allocations: [{ invoice: 1, amount: '0.00' }],
    };

    const res = createPaymentSchema.safeParse(invalid);
    expect(res.success).toBe(false);
  });
});
