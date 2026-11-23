import { GSTIN_REGEX, PHONE_REGEX } from '../constants/validation';

export function isValidGstin(gstin: string | undefined | null): boolean {
  if (!gstin) return false;
  return GSTIN_REGEX.test(gstin.trim().toUpperCase());
}

export function isValidPhone(phone: string | undefined | null): boolean {
  if (!phone) return false;
  return PHONE_REGEX.test(phone.trim());
}
