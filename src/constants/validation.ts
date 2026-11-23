export const GSTIN_REGEX = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
export const PHONE_REGEX = /^[0-9]{10,15}$/;

export const FILE_LIMITS = {
  MAX_LOGO_SIZE_BYTES: 2 * 1024 * 1024, // 2MB
  ACCEPTED_LOGO_TYPES: ['image/png', 'image/jpeg', 'image/jpg'],
} as const;

export const NUMBER_LIMITS = {
  MONEY_DECIMAL_PLACES: 2,
  QUANTITY_DECIMAL_PLACES: 3,
} as const;
