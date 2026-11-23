import { describe, it, expect } from 'vitest';
import {
  autoAllocateOldestFirst,
  calculateUnallocated,
  isExactAllocation,
} from '../allocation';
import type { CustomerOpenInvoice } from '../../types/api/customer';

describe('allocation utils', () => {
  const mockInvoices: CustomerOpenInvoice[] = [
    {
      id: 1,
      invoice_number: 'INV-001',
      invoice_date: '2026-11-01',
      grand_total: '1000.00',
      total_paid: '0.00',
      balance_due: '1000.00',
    },
    {
      id: 2,
      invoice_number: 'INV-002',
      invoice_date: '2026-11-10',
      grand_total: '500.00',
      total_paid: '100.00',
      balance_due: '400.00',
    },
    {
      id: 3,
      invoice_number: 'INV-003',
      invoice_date: '2026-11-15',
      grand_total: '300.00',
      total_paid: '0.00',
      balance_due: '300.00',
    },
  ];

  describe('autoAllocateOldestFirst', () => {
    it('allocates fully across multiple invoices oldest first', () => {
      const res = autoAllocateOldestFirst(mockInvoices, '1200.00');
      expect(res[1]).toBe('1000.00'); // fully paid
      expect(res[2]).toBe('200.00');  // partial
      expect(res[3]).toBe('0.00');    // none
    });

    it('allocates exact total when equal to sum of dues', () => {
      const res = autoAllocateOldestFirst(mockInvoices, '1700.00');
      expect(res[1]).toBe('1000.00');
      expect(res[2]).toBe('400.00');
      expect(res[3]).toBe('300.00');
    });

    it('handles zero or empty amounts gracefully', () => {
      const res = autoAllocateOldestFirst(mockInvoices, '0.00');
      expect(res[1]).toBe('0.00');
      expect(res[2]).toBe('0.00');
      expect(res[3]).toBe('0.00');
    });
  });

  describe('calculateUnallocated and isExactAllocation', () => {
    it('calculates unallocated remaining amount correctly', () => {
      const allocations = { 1: '500.00', 2: '200.00' };
      const unallocated = calculateUnallocated('1000.00', allocations);
      expect(unallocated).toBe('300.00');
      expect(isExactAllocation('1000.00', allocations)).toBe(false);
    });

    it('identifies exact allocation match', () => {
      const allocations = { 1: '600.00', 2: '400.00' };
      const unallocated = calculateUnallocated('1000.00', allocations);
      expect(unallocated).toBe('0.00');
      expect(isExactAllocation('1000.00', allocations)).toBe(true);
    });

    it('handles overallocation negative balance', () => {
      const allocations = { 1: '800.00', 2: '300.00' };
      const unallocated = calculateUnallocated('1000.00', allocations);
      expect(unallocated).toBe('-100.00');
      expect(isExactAllocation('1000.00', allocations)).toBe(false);
    });
  });
});
