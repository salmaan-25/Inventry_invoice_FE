import { describe, it, expect } from 'vitest';
import { createStaffSchema, setPasswordSchema, updateStaffSchema } from '../staff';

describe('staff schemas', () => {
  it('validates createStaffSchema correctly', () => {
    const valid = {
      employee_id: 'EMP-001',
      name: 'John Doe',
      contact: '9876543211',
      notes: 'Driver',
    };
    expect(createStaffSchema.safeParse(valid).success).toBe(true);
  });

  it('fails createStaffSchema on missing required fields', () => {
    const invalid = {
      employee_id: '',
      name: '',
    };
    const result = createStaffSchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });

  it('validates updateStaffSchema', () => {
    const valid = {
      name: 'John Doe Updated',
      contact: '9876543211',
    };
    expect(updateStaffSchema.safeParse(valid).success).toBe(true);
  });

  it('validates setPasswordSchema', () => {
    const valid = {
      new_password: 'NewPassword123!',
      confirm_password: 'NewPassword123!',
    };
    expect(setPasswordSchema.safeParse(valid).success).toBe(true);
  });
});
