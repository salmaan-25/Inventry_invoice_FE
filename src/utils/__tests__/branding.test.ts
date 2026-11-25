import { describe, it, expect, beforeEach } from 'vitest';
import { getCachedCompanyBranding, setCachedCompanyBranding } from '../branding';

describe('branding util', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('returns undefined when no branding is stored', () => {
    expect(getCachedCompanyBranding()).toBeUndefined();
  });

  it('stores and retrieves company branding', () => {
    setCachedCompanyBranding({
      business_name: 'Anifa Traders',
      logo: 'https://example.com/logo.png',
    });

    const cached = getCachedCompanyBranding();
    expect(cached).toBeDefined();
    expect(cached?.business_name).toBe('Anifa Traders');
    expect(cached?.logo).toBe('https://example.com/logo.png');
  });

  it('handles corrupted localStorage gracefully', () => {
    window.localStorage.setItem('company_branding', 'invalid-json{');
    expect(getCachedCompanyBranding()).toBeUndefined();
  });
});
