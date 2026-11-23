import { describe, it, expect } from 'vitest';
import { loginSchema } from '../auth';

describe('loginSchema', () => {
  it('validates correct login credentials', () => {
    const valid = {
      username: 'admin_user',
      password: 'Password123!',
    };
    const result = loginSchema.safeParse(valid);
    expect(result.success).toBe(true);
  });

  it('fails when username is empty', () => {
    const invalid = {
      username: '   ',
      password: 'Password123!',
    };
    const result = loginSchema.safeParse(invalid);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.errors[0]?.message).toBe('Username is required.');
    }
  });

  it('fails when password is empty', () => {
    const invalid = {
      username: 'admin_user',
      password: '',
    };
    const result = loginSchema.safeParse(invalid);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.errors[0]?.message).toBe('Password is required.');
    }
  });
});
