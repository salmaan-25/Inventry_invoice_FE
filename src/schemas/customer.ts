import { z } from 'zod';
import { phoneSchema, gstinSchema } from './common';
import { MESSAGES } from '../constants/messages';

export const customerSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, MESSAGES.validation.required),
  phone: phoneSchema,
  gstin: gstinSchema.optional(),
  state: z
    .string()
    .trim()
    .min(1, MESSAGES.validation.required),
  billing_address: z
    .string()
    .trim()
    .min(1, MESSAGES.validation.required),
  is_active: z.boolean().optional(),
});

export type CustomerFormValues = z.infer<typeof customerSchema>;
