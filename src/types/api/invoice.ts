import type { ItemType, InvoiceStatus, PaymentStatus } from '../../constants/enums';
import type { PaginationParams, DateRangeParams } from './common';

export type InvoiceType = 'GST' | 'NON_GST';

export interface InvoiceLineInput {
  product?: number | null;
  product_name?: string;
  description?: string;
  hsn_sac?: string;
  unit_name?: string;
  gst_rate?: string | number | null;
  quantity: string;
  rate: string;
}

export interface CalculateInvoiceRequest {
  customer?: number;
  invoice_type?: InvoiceType;
  advance_amount?: string;
  lines: InvoiceLineInput[];
}

export interface CalculationLine {
  line_no: number;
  product_name: string;
  quantity: string;
  rate: string;
  gst_rate: string;
  line_total: string;
  cgst_amount: string;
  sgst_amount: string;
}

export interface InvoiceCalculation {
  is_gst: boolean;
  invoice_type?: InvoiceType;
  subtotal: string;
  cgst_amount: string;
  sgst_amount: string;
  total_tax: string;
  round_off: string;
  grand_total: string;
  advance_amount?: string;
  balance_amount?: string;
  has_advance?: boolean;
  lines: CalculationLine[];
}

export interface InvoiceItem {
  id: number;
  line_no: number;
  product?: number | null;
  product_name: string;
  description?: string;
  product_code?: string;
  hsn_sac?: string;
  unit_name?: string;
  item_type?: ItemType;
  gst_rate?: string | null;
  quantity: string;
  rate: string;
  line_total: string;
  cgst_amount: string;
  sgst_amount: string;
}

export interface BusinessSnapshot {
  name: string;
  gstin: string;
  address: string;
  state: string;
  state_code?: string;
}

export interface CustomerSnapshot {
  name: string;
  gstin?: string;
  billing_address: string;
  state: string;
  state_code?: string;
}

export interface InvoiceListItem {
  id: number;
  invoice_number: string;
  invoice_type: InvoiceType;
  customer: number;
  customer_name: string;
  invoice_date: string;
  status: InvoiceStatus;
  subtotal: string;
  total_cgst: string;
  total_sgst: string;
  total_tax: string;
  round_off: string;
  grand_total: string;
  advance_amount: string;
  balance_amount: string;
  paid_amount: string;
  balance_due: string;
  payment_status: PaymentStatus;
  delivery_status: string;
  created_at: string;
  updated_at: string;
}

export interface Invoice {
  id: number;
  invoice_number: string;
  invoice_type: InvoiceType;
  customer: number;
  customer_name: string;
  invoice_date: string;
  notes?: string;
  status: InvoiceStatus;
  subtotal: string;
  total_cgst: string;
  total_sgst: string;
  total_tax: string;
  round_off: string;
  grand_total: string;
  advance_amount: string;
  balance_amount: string;
  paid_amount: string;
  balance_due: string;
  payment_status: PaymentStatus;
  delivery_status: string;
  
  // Consignee fields
  consignee_name?: string;
  consignee_address?: string;
  consignee_gstin?: string;
  consignee_state?: string;
  consignee_state_code?: string;

  // Dispatch / Transport fields
  e_way_bill_no?: string;
  delivery_note?: string;
  payment_terms?: string;
  reference_no_date?: string;
  other_references?: string;
  buyer_order_no?: string;
  order_date?: string | null;
  dispatch_doc_no?: string;
  delivery_note_date?: string | null;
  dispatched_through?: string;
  destination?: string;
  bill_of_lading_no?: string;
  motor_vehicle_no?: string;
  terms_of_delivery?: string;

  business_snapshot?: BusinessSnapshot;
  customer_snapshot?: CustomerSnapshot;
  items: InvoiceItem[];
  created_by: number;
  created_at: string;
  updated_at: string;
  issued_by?: number;
  issued_by_name?: string;
  issued_at?: string;
}

export interface CreateInvoiceRequest {
  invoice_number?: string;
  customer: number;
  invoice_date: string;
  invoice_type?: InvoiceType;
  advance_amount?: string;
  notes?: string;

  // Consignee fields
  consignee_name?: string;
  consignee_address?: string;
  consignee_gstin?: string;
  consignee_state?: string;
  consignee_state_code?: string;

  // Dispatch fields
  e_way_bill_no?: string;
  delivery_note?: string;
  payment_terms?: string;
  reference_no_date?: string;
  other_references?: string;
  buyer_order_no?: string;
  order_date?: string | null;
  dispatch_doc_no?: string;
  delivery_note_date?: string | null;
  dispatched_through?: string;
  destination?: string;
  bill_of_lading_no?: string;
  motor_vehicle_no?: string;
  terms_of_delivery?: string;

  lines: InvoiceLineInput[];
}

export interface UpdateInvoiceRequest extends Partial<CreateInvoiceRequest> {
  id: number;
}

export interface InvoiceListParams extends PaginationParams, DateRangeParams {
  status?: InvoiceStatus;
  customer?: number | string;
}

export interface AwaitingDispatchItem {
  invoice_item_id: number;
  product_name: string;
  unit: string;
  invoiced_quantity: string;
  already_dispatched: string;
  remaining_quantity: string;
}
