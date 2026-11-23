import { z } from 'zod';

export const createStaffSchema = z.object({
  employee_id: z.string().trim().min(1, 'Employee ID is required.'),
  name: z.string().trim().min(1, 'Name is required.'),
  contact: z.string().trim().optional().default(''),
  notes: z.string().trim().optional().default(''),
});

export type CreateStaffFormValues = z.infer<typeof createStaffSchema>;

export const updateStaffSchema = z.object({
  employee_id: z.string().trim().min(1, 'Employee ID is required.').optional(),
  name: z.string().trim().min(1, 'Name is required.').optional(),
  contact: z.string().trim().optional(),
  notes: z.string().trim().optional(),
});

export type UpdateStaffFormValues = z.infer<typeof updateStaffSchema>;

export const setPasswordSchema = z
  .object({
    new_password: z.string().min(8, 'Password must be at least 8 characters.'),
    confirm_password: z.string().min(8, 'Confirm password must be at least 8 characters.'),
  })
  .refine((data) => data.new_password === data.confirm_password, {
    message: 'Passwords do not match.',
    path: ['confirm_password'],
  });

export type SetPasswordFormValues = z.infer<typeof setPasswordSchema>;
