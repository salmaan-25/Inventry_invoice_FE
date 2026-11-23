import { z } from 'zod';
import { moneyStringSchema, quantityStringSchema } from './common';
import { ITEM_TYPE } from '../constants/enums';
import { MESSAGES } from '../constants/messages';

export const createProductSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, MESSAGES.validation.required),
    code: z.string().trim().optional(),
    description: z.string().trim().optional(),
    item_type: z.enum([
      ITEM_TYPE.GOODS,
      ITEM_TYPE.GOODS_HARDWARE,
      ITEM_TYPE.SERVICE,
    ]),
    unit: z.number().min(1, 'Unit is required.'),
    selling_price: moneyStringSchema,
    hsn_sac: z
      .string()
      .trim()
      .min(1, MESSAGES.validation.required),
    gst_rate: moneyStringSchema,
    reorder_level: z.string().trim().optional(),
    opening_stock: z.string().trim().optional(),
  })
  .refine(
    (data) => {
      // If SERVICE, opening_stock and reorder_level must not be filled
      if (data.item_type === ITEM_TYPE.SERVICE) {
        return !data.reorder_level && !data.opening_stock;
      }
      return true;
    },
    {
      message: 'Service items cannot have opening stock or reorder level.',
      path: ['reorder_level'],
    }
  );

export type CreateProductFormValues = z.infer<typeof createProductSchema>;

export const updateProductSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, MESSAGES.validation.required),
  description: z.string().trim().optional(),
  selling_price: moneyStringSchema,
  hsn_sac: z
    .string()
    .trim()
    .min(1, MESSAGES.validation.required),
  gst_rate: moneyStringSchema,
  reorder_level: z.string().trim().optional(),
  is_active: z.boolean().optional(),
});

export type UpdateProductFormValues = z.infer<typeof updateProductSchema>;

export const stockInSchema = z.object({
  quantity: quantityStringSchema,
  reason: z.string().trim().optional(),
});

export type StockInFormValues = z.infer<typeof stockInSchema>;

export const adjustStockSchema = z.object({
  quantity_change: z
    .string()
    .trim()
    .refine((val) => {
      const num = Number(val);
      return !Number.isNaN(num) && num !== 0;
    }, 'Quantity change must be a non-zero signed number (e.g. +10 or -5).'),
  reason: z
    .string()
    .trim()
    .min(1, 'Reason is required for stock adjustments.'),
});

export type AdjustStockFormValues = z.infer<typeof adjustStockSchema>;
