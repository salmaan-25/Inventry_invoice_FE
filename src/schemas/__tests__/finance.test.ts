import { describe, it, expect } from 'vitest';
import { categorySchema, expenseSchema, otherIncomeSchema } from '../finance';
import { PAYMENT_METHOD } from '../../constants/enums';

describe('finance schemas', () => {
  describe('categorySchema', () => {
    it('validates a non-empty category name', () => {
      const res = categorySchema.safeParse({ name: 'Rent' });
      expect(res.success).toBe(true);
    });

    it('rejects blank name', () => {
      const res = categorySchema.safeParse({ name: '   ' });
      expect(res.success).toBe(false);
    });
  });

  describe('expenseSchema', () => {
    it('validates a complete expense payload', () => {
      const res = expenseSchema.safeParse({
        date: '2026-11-20',
        category: 1,
        description: 'Office internet bill',
        amount: '1200.00',
        payment_method: PAYMENT_METHOD.BANK_TRANSFER,
        paid_to: 'Airtel Broadband',
      });
      expect(res.success).toBe(true);
    });

    it('rejects zero or invalid amount', () => {
      const res = expenseSchema.safeParse({
        date: '2026-11-20',
        category: 1,
        description: 'Test',
        amount: '0.00',
        payment_method: PAYMENT_METHOD.CASH,
        paid_to: 'Vendor',
      });
      expect(res.success).toBe(false);
    });
  });

  describe('otherIncomeSchema', () => {
    it('validates a complete other income payload', () => {
      const res = otherIncomeSchema.safeParse({
        date: '2026-11-20',
        category: 2,
        description: 'Sale of old cardboard boxes',
        amount: '450.00',
        payment_method: PAYMENT_METHOD.CASH,
        received_from: 'Scrap Buyer',
      });
      expect(res.success).toBe(true);
    });
  });
});
