import { describe, it, expect } from 'vitest';
import { invoiceFormSchema, invoiceLineSchema } from '../invoice';

describe('invoice schemas', () => {
  it('validates a correct invoice line', () => {
    const validLine = {
      product: 1,
      quantity: '10.000',
      rate: '100.00',
    };
    expect(invoiceLineSchema.safeParse(validLine).success).toBe(true);
  });

  it('validates a complete invoice form', () => {
    const validInvoice = {
      customer: 1,
      invoice_date: '2026-11-20',
      payment_terms: 'Immediate',
      notes: 'Net 15 days',
      lines: [
        {
          product: 1,
          quantity: '10.000',
          rate: '100.00',
        },
      ],
    };
    expect(invoiceFormSchema.safeParse(validInvoice).success).toBe(true);
  });

  it('fails invoice without lines', () => {
    const invalidInvoice = {
      customer: 1,
      invoice_date: '2026-11-20',
      payment_terms: 'Immediate',
      lines: [],
    };
    expect(invoiceFormSchema.safeParse(invalidInvoice).success).toBe(false);
  });

  it('fails invoice without payment_terms', () => {
    const invalidInvoice = {
      customer: 1,
      invoice_date: '2026-11-20',
      lines: [
        {
          product: 1,
          quantity: '10.000',
          rate: '100.00',
        },
      ],
    };
    const result = invoiceFormSchema.safeParse(invalidInvoice);
    expect(result.success).toBe(false);
  });

  it('fails invoice with whitespace payment_terms', () => {
    const invalidInvoice = {
      customer: 1,
      invoice_date: '2026-11-20',
      payment_terms: '   ',
      lines: [
        {
          product: 1,
          quantity: '10.000',
          rate: '100.00',
        },
      ],
    };
    const result = invoiceFormSchema.safeParse(invalidInvoice);
    expect(result.success).toBe(false);
  });
});
