import type { PaymentMethod } from '../../constants/enums';
import type { PaginationParams, DateRangeParams } from './common';

export interface ExpenseCategory {
  id: number;
  name: string;
  is_active: boolean;
}

export interface CreateExpenseCategoryRequest {
  name: string;
}

export interface Expense {
  id: number;
  date: string;
  category: number;
  category_name: string;
  description: string;
  amount: string;
  payment_method: PaymentMethod;
  paid_to: string;
  notes?: string;
  created_at: string;
}

export interface CreateExpenseRequest {
  date: string;
  category: number;
  description: string;
  amount: string;
  payment_method: PaymentMethod;
  paid_to: string;
  notes?: string;
}

export interface UpdateExpenseRequest {
  id: number;
  date?: string;
  category?: number;
  description?: string;
  amount?: string;
  payment_method?: PaymentMethod;
  paid_to?: string;
  notes?: string;
}

export interface ExpenseListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  total_amount: string;
  results: Expense[];
}

export interface ExpenseListParams extends PaginationParams, DateRangeParams {
  category?: number | string;
}
