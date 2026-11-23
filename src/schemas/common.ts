import { z } from 'zod';
import { GSTIN_REGEX, PHONE_REGEX } from '../constants/validation';
import { MESSAGES } from '../constants/messages';
import { isValidRange } from '../utils/date';

export const gstinSchema = z
  .string()
  .trim()
  .toUpperCase()
  .refine((val) => val === '' || GSTIN_REGEX.test(val), {
    message: MESSAGES.validation.invalidGstin,
  });

export const phoneSchema = z
  .string()
  .trim()
  .refine((val) => PHONE_REGEX.test(val), {
    message: MESSAGES.validation.invalidPhone,
  });

export const optionalPhoneSchema = z
  .string()
  .trim()
  .refine((val) => val === '' || PHONE_REGEX.test(val), {
    message: MESSAGES.validation.invalidPhone,
  });

export const dateRangeSchema = z
  .object({
    from: z.string().optional(),
    to: z.string().optional(),
  })
  .refine((data) => isValidRange(data.from, data.to), {
    message: MESSAGES.validation.dateRangeInvalid,
    path: ['to'],
  });

export const moneyStringSchema = z
  .string()
  .trim()
  .refine((val) => !Number.isNaN(Number(val)) && Number(val) >= 0, {
    message: MESSAGES.validation.positiveNumber,
  });

export const quantityStringSchema = z
  .string()
  .trim()
  .refine((val) => !Number.isNaN(Number(val)) && Number(val) > 0, {
    message: MESSAGES.validation.positiveNumber,
  });
