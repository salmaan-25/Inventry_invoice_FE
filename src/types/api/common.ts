export interface Paginated<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface ApiError {
  code: string;
  detail: string;
  fieldErrors: Record<string, string[]>;
  status?: number;
}

export interface DateRangeParams {
  from?: string;
  to?: string;
}

export interface PaginationParams {
  page?: number;
  page_size?: number;
  search?: string;
}

export type MoneyString = string; // e.g. "1250.00" (2 decimal places)
export type QuantityString = string; // e.g. "10.500" (3 decimal places)
export type IsoDate = string; // e.g. "YYYY-MM-DD"
export type IsoDateTime = string; // e.g. "2026-11-20T12:00:00Z"
