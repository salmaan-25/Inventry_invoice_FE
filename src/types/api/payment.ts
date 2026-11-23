import type { PaymentMethod } from '../../constants/enums';
import type { PaginationParams, DateRangeParams } from './common';

export interface PaymentAllocation {
  id: number;
  invoice: number;
  invoice_number: string;
  invoice_date: string;
  grand_total: string;
  amount: string;
}

export interface PaymentListItem {
  id: number;
  customer: number;
  customer_name: string;
  payment_date: string;
  amount: string;
  method: PaymentMethod;
  reference?: string;
  note?: string;
  client_token: string;
  received_by: number;
  received_by_name: string;
  created_at: string;
}

export interface Payment extends PaymentListItem {
  allocations: PaymentAllocation[];
}

export interface CreatePaymentAllocationInput {
  invoice: number;
  amount: string;
}

export interface CreatePaymentRequest {
  customer: number;
  payment_date: string;
  amount: string;
  method: PaymentMethod;
  reference?: string;
  note?: string;
  client_token: string;
  allocations: CreatePaymentAllocationInput[];
}

export interface PaymentListParams extends PaginationParams, DateRangeParams {
  customer?: number | string;
}
