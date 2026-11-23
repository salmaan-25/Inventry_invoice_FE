import { describe, it, expect } from 'vitest';
import { customerSchema } from '../customer';

describe('customerSchema', () => {
  it('validates a correct customer object', () => {
    const valid = {
      name: 'Acme Corp Pvt Ltd',
      phone: '9840123456',
      gstin: '33ABCDE1234F1Z5',
      state: 'Tamil Nadu',
      billing_address: '45 Industrial Estate, Guindy, Chennai',
      is_active: true,
    };
    expect(customerSchema.safeParse(valid).success).toBe(true);
  });

  it('validates customer without optional GSTIN', () => {
    const valid = {
      name: 'Retail Customer',
      phone: '9840123456',
      state: 'Tamil Nadu',
      billing_address: '12 Main St, Chennai',
    };
    expect(customerSchema.safeParse(valid).success).toBe(true);
  });

  it('fails with invalid phone number', () => {
    const invalid = {
      name: 'Retail Customer',
      phone: '123',
      state: 'Tamil Nadu',
      billing_address: '12 Main St, Chennai',
    };
    expect(customerSchema.safeParse(invalid).success).toBe(false);
  });
});
