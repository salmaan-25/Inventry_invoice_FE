import { describe, it, expect, beforeEach } from 'vitest';
import { readCsrfToken } from '../csrf';

describe('csrf utils', () => {
  beforeEach(() => {
    // Clear cookies
    document.cookie.split(';').forEach((cookie) => {
      const eqPos = cookie.indexOf('=');
      const name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
      document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT`;
    });
  });

  it('extracts csrftoken from document.cookie', () => {
    document.cookie = 'csrftoken=test-csrf-token-123; path=/';
    expect(readCsrfToken()).toBe('test-csrf-token-123');
  });

  it('returns null if csrftoken is not found', () => {
    document.cookie = 'other=value; path=/';
    expect(readCsrfToken()).toBeNull();
  });
});
