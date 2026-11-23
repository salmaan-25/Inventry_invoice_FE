import { z } from 'zod';
import { gstinSchema, phoneSchema } from './common';
import { MESSAGES } from '../constants/messages';

export const companySchema = z.object({
  business_name: z
    .string()
    .trim()
    .min(1, MESSAGES.validation.required),
  address: z
    .string()
    .trim()
    .min(1, MESSAGES.validation.required),
  phone: phoneSchema,
  email: z
    .string()
    .trim()
    .email(MESSAGES.validation.invalidEmail),
  gstin: gstinSchema,
});

export type CompanyFormValues = z.infer<typeof companySchema>;
