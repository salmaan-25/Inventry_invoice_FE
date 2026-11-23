import type { PaginationParams, DateRangeParams } from './common';

export interface CustomerDto {
  id: number;
  code: string;
  name: string;
  phone: string;
  gstin: string | null;
  state: string;
  billing_address: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Customer {
  id: number;
  code: string;
  name: string;
  phone: string;
  gstin?: string;
  state: string;
  billing_address: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateCustomerRequest {
  name: string;
  phone: string;
  gstin?: string;
  state: string;
  billing_address: string;
}

export interface UpdateCustomerRequest {
  id: number;
  name?: string;
  phone?: string;
  gstin?: string;
  state?: string;
  billing_address?: string;
  is_active?: boolean;
}

export interface CustomerListParams extends PaginationParams {
  is_active?: boolean;
}

export interface CustomerOpenInvoice {
  id: number;
  invoice_number: string;
  invoice_date: string;
  grand_total: string;
  total_paid: string;
  balance_due: string;
}

export interface StatementEntry {
  date: string;
  type: 'INVOICE' | 'PAYMENT';
  reference: string;
  debit: string;
  credit: string;
  running_balance: string;
}

export interface CustomerStatement {
  customer: {
    id: number;
    code: string;
    name: string;
  };
  total_invoiced: string;
  total_paid: string;
  outstanding_balance: string;
  entries: StatementEntry[];
}

export type CustomerStatementParams = DateRangeParams;
