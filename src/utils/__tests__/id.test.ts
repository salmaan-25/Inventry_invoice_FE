import { describe, it, expect } from 'vitest';
import { generateClientToken } from '../id';

describe('id utils', () => {
  it('generates a valid UUID string', () => {
    const token1 = generateClientToken();
    const token2 = generateClientToken();
    expect(token1).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);
    expect(token1).not.toBe(token2);
  });
});
