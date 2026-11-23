import { z } from 'zod';
import { moneyStringSchema } from './common';
import { PAYMENT_METHOD, type PaymentMethod } from '../constants/enums';
import { MESSAGES } from '../constants/messages';
import { sumMoney, toFixed2 } from '../utils/money';

export const paymentAllocationSchema = z.object({
  invoice: z.number().min(1, 'Invoice selection is required.'),
  amount: moneyStringSchema,
});

export const createPaymentSchema = z
  .object({
    customer: z.number().min(1, 'Customer selection is required.'),
    payment_date: z.string().min(1, MESSAGES.validation.required),
    amount: moneyStringSchema,
    method: z.enum([
      PAYMENT_METHOD.CASH,
      PAYMENT_METHOD.BANK_TRANSFER,
      PAYMENT_METHOD.UPI,
      PAYMENT_METHOD.CHEQUE,
    ] as [PaymentMethod, ...PaymentMethod[]]),
    reference: z.string().trim().optional(),
    note: z.string().trim().optional(),
    client_token: z.string().min(1, 'Client token is required.'),
    allocations: z
      .array(paymentAllocationSchema)
      .min(1, 'At least one invoice allocation is required.'),
  })
  .refine(
    (data) => {
      const allocatedTotal = sumMoney(data.allocations.map((a) => a.amount));
      return allocatedTotal === toFixed2(data.amount);
    },
    {
      message: 'Sum of invoice allocations must exactly equal the payment amount.',
      path: ['allocations'],
    }
  );

export type CreatePaymentFormValues = z.infer<typeof createPaymentSchema>;
