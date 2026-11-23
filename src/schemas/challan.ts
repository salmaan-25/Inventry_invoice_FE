import { z } from 'zod';
import { quantityStringSchema } from './common';
import { MESSAGES } from '../constants/messages';

export const challanItemInputSchema = z.object({
  invoice_item: z.number().min(1, 'Invoice item reference is required.'),
  quantity: quantityStringSchema,
});

export const createChallanSchema = z.object({
  invoice: z.number().min(1, 'Invoice reference is required.'),
  delivery_date: z.string().min(1, MESSAGES.validation.required),
  delivered_by: z.string().trim().min(1, MESSAGES.validation.required),
  received_by: z.string().trim().min(1, MESSAGES.validation.required),
  items: z.array(challanItemInputSchema).min(1, 'At least one item must be dispatched.'),
});

export type CreateChallanFormValues = z.infer<typeof createChallanSchema>;
