import { describe, it, expect } from 'vitest';
import { companySchema } from '../company';

describe('companySchema', () => {
  it('validates valid company details', () => {
    const valid = {
      business_name: 'Salmaan Tech Solutions',
      address: '123 Commercial Road, Chennai, Tamil Nadu',
      phone: '04424567890',
      email: 'contact@salmaantech.com',
      gstin: '33AAAAA0000A1Z5',
    };
    const result = companySchema.safeParse(valid);
    expect(result.success).toBe(true);
  });

  it('fails with invalid email', () => {
    const invalid = {
      business_name: 'Salmaan Tech Solutions',
      address: '123 Commercial Road',
      phone: '04424567890',
      email: 'not-an-email',
      gstin: '33AAAAA0000A1Z5',
    };
    const result = companySchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });

  it('fails with invalid GSTIN', () => {
    const invalid = {
      business_name: 'Salmaan Tech Solutions',
      address: '123 Commercial Road',
      phone: '04424567890',
      email: 'valid@example.com',
      gstin: 'BADGSTIN',
    };
    const result = companySchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });
});
