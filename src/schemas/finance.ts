import { z } from 'zod';
import { moneyStringSchema } from './common';
import { PAYMENT_METHOD, type PaymentMethod } from '../constants/enums';
import { MESSAGES } from '../constants/messages';

export const positiveMoneyStringSchema = moneyStringSchema.refine(
  (val) => Number(val) > 0,
  { message: 'Amount must be greater than zero.' }
);

export const categorySchema = z.object({
  name: z.string().trim().min(1, MESSAGES.validation.required),
});

export const expenseSchema = z.object({
  date: z.string().min(1, MESSAGES.validation.required),
  category: z.number().min(1, 'Category selection is required.'),
  description: z.string().trim().min(1, MESSAGES.validation.required),
  amount: positiveMoneyStringSchema,
  payment_method: z.enum([
    PAYMENT_METHOD.CASH,
    PAYMENT_METHOD.BANK_TRANSFER,
    PAYMENT_METHOD.UPI,
    PAYMENT_METHOD.CHEQUE,
  ] as [PaymentMethod, ...PaymentMethod[]]),
  paid_to: z.string().trim().min(1, MESSAGES.validation.required),
  notes: z.string().trim().optional(),
});

export const otherIncomeSchema = z.object({
  date: z.string().min(1, MESSAGES.validation.required),
  category: z.number().min(1, 'Category selection is required.'),
  description: z.string().trim().min(1, MESSAGES.validation.required),
  amount: positiveMoneyStringSchema,
  payment_method: z.enum([
    PAYMENT_METHOD.CASH,
    PAYMENT_METHOD.BANK_TRANSFER,
    PAYMENT_METHOD.UPI,
    PAYMENT_METHOD.CHEQUE,
  ] as [PaymentMethod, ...PaymentMethod[]]),
  received_from: z.string().trim().min(1, MESSAGES.validation.required),
  notes: z.string().trim().optional(),
});

export type CategoryFormValues = z.infer<typeof categorySchema>;
export type ExpenseFormValues = z.infer<typeof expenseSchema>;
export type OtherIncomeFormValues = z.infer<typeof otherIncomeSchema>;
