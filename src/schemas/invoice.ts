import { z } from 'zod';
import { quantityStringSchema, moneyStringSchema } from './common';
import { MESSAGES } from '../constants/messages';

export const invoiceLineSchema = z.object({
  product: z.number().nullable().optional(),
  product_name: z.string().trim().optional(),
  description: z.string().trim().optional(),
  hsn_sac: z.string().trim().optional(),
  unit_name: z.string().trim().optional(),
  gst_rate: z.union([z.string(), z.number()]).nullable().optional(),
  quantity: quantityStringSchema,
  rate: moneyStringSchema,
});

export type InvoiceLineFormValues = z.infer<typeof invoiceLineSchema>;

export const invoiceFormSchema = z.object({
  invoice_number: z.string().trim().optional(),
  customer: z.number().min(1, 'Customer selection is required.'),
  invoice_date: z.string().min(1, MESSAGES.validation.required),
  invoice_type: z.enum(['GST', 'NON_GST']).default('GST'),
  advance_amount: z.string().optional(),
  notes: z.string().trim().optional(),

  // Consignee fields
  consignee_name: z.string().trim().optional(),
  consignee_address: z.string().trim().optional(),
  consignee_gstin: z.string().trim().optional(),
  consignee_state: z.string().trim().optional(),
  consignee_state_code: z.string().trim().optional(),

  // Dispatch fields
  e_way_bill_no: z.string().trim().optional(),
  delivery_note: z.string().trim().optional(),
  payment_terms: z.string({ required_error: MESSAGES.validation.required }).trim().min(1, MESSAGES.validation.required),
  reference_no_date: z.string().trim().optional(),
  other_references: z.string().trim().optional(),
  buyer_order_no: z.string().trim().optional(),
  order_date: z.string().nullable().optional(),
  dispatch_doc_no: z.string().trim().optional(),
  delivery_note_date: z.string().nullable().optional(),
  dispatched_through: z.string().trim().optional(),
  destination: z.string().trim().optional(),
  bill_of_lading_no: z.string().trim().optional(),
  motor_vehicle_no: z.string().trim().optional(),
  terms_of_delivery: z.string().trim().optional(),

  lines: z.array(invoiceLineSchema).min(1, 'At least one line item is required.'),
});

export type InvoiceFormValues = z.infer<typeof invoiceFormSchema>;
