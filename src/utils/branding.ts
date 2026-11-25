export interface CompanyBranding {
  readonly business_name: string;
  readonly logo?: string;
}

const BRANDING_STORAGE_KEY = 'company_branding';

export function getCachedCompanyBranding(): CompanyBranding | undefined {
  if (typeof window === 'undefined') {
    return undefined;
  }
  try {
    const raw = window.localStorage.getItem(BRANDING_STORAGE_KEY);
    if (!raw) return undefined;
    const parsed = JSON.parse(raw) as Partial<CompanyBranding>;
    if (typeof parsed.business_name === 'string' && parsed.business_name.trim() !== '') {
      return {
        business_name: parsed.business_name.trim(),
        logo: typeof parsed.logo === 'string' && parsed.logo.trim() !== '' ? parsed.logo.trim() : undefined,
      };
    }
  } catch {
    // Ignore storage parse errors
  }
  return undefined;
}

export function setCachedCompanyBranding(branding: CompanyBranding): void {
  if (typeof window === 'undefined') {
    return;
  }
  try {
    window.localStorage.setItem(BRANDING_STORAGE_KEY, JSON.stringify(branding));
  } catch {
    // Ignore storage quota errors
  }
}
