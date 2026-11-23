import type { PaymentMethod } from '../../constants/enums';
import type { PaginationParams, DateRangeParams } from './common';

export interface IncomeCategory {
  id: number;
  name: string;
  is_active: boolean;
}

export interface CreateIncomeCategoryRequest {
  name: string;
}

export interface OtherIncome {
  id: number;
  date: string;
  category: number;
  category_name: string;
  description: string;
  amount: string;
  payment_method: PaymentMethod;
  received_from: string;
  reference?: string;
  notes?: string;
  created_at: string;
}

export interface CreateOtherIncomeRequest {
  date: string;
  category: number;
  description: string;
  amount: string;
  payment_method: PaymentMethod;
  received_from: string;
  reference?: string;
  notes?: string;
}

export interface UpdateOtherIncomeRequest {
  id: number;
  date?: string;
  category?: number;
  description?: string;
  amount?: string;
  payment_method?: PaymentMethod;
  received_from?: string;
  notes?: string;
}

export interface IncomeListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  total_amount: string;
  results: OtherIncome[];
}

export interface IncomeListParams extends PaginationParams, DateRangeParams {
  category?: number | string;
}
