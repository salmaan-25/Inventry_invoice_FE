import Decimal from 'decimal.js';
import { sumMoney, subMoney, compareMoney } from './money';
import type { CustomerOpenInvoice } from '../types/api/customer';

/**
 * Automatically allocates a total payment amount across open invoices
 * starting from the oldest invoice first (by invoice_date ascending, then id ascending).
 * Returns a map of invoice_id -> allocated_amount.
 */
export function autoAllocateOldestFirst(
  openInvoices: readonly CustomerOpenInvoice[],
  totalAmount: string | number
): Record<number, string> {
  const result: Record<number, string> = {};
  let remaining = new Decimal(totalAmount || 0);

  if (remaining.lessThanOrEqualTo(0) || openInvoices.length === 0) {
    openInvoices.forEach((inv) => {
      result[inv.id] = '0.00';
    });
    return result;
  }

  // Sort oldest first
  const sorted = [...openInvoices].sort((a, b) => {
    const dateComp = a.invoice_date.localeCompare(b.invoice_date);
    if (dateComp !== 0) return dateComp;
    return a.id - b.id;
  });

  for (const inv of sorted) {
    const due = new Decimal(inv.balance_due || 0);

    if (remaining.greaterThan(0) && due.greaterThan(0)) {
      const allocateDec = Decimal.min(remaining, due);
      result[inv.id] = allocateDec.toFixed(2);
      remaining = remaining.minus(allocateDec);
    } else {
      result[inv.id] = '0.00';
    }
  }

  return result;
}

/**
 * Calculates unallocated amount: totalAmount - sum(allocations)
 * If positive: amount left to allocate.
 * If negative: overallocated.
 */
export function calculateUnallocated(
  totalAmount: string,
  allocations: Record<number, string>
): string {
  const allocatedSum = sumMoney(Object.values(allocations));
  return subMoney(totalAmount || '0.00', allocatedSum);
}

/**
 * Checks whether allocations exactly match the payment amount.
 */
export function isExactAllocation(
  totalAmount: string,
  allocations: Record<number, string>
): boolean {
  const unallocated = calculateUnallocated(totalAmount, allocations);
  return compareMoney(unallocated, '0.00') === 0 && compareMoney(totalAmount, '0.00') > 0;
}
