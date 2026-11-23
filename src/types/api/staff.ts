import type { PaginationParams } from './common';

export interface StaffMember {
  id: number;
  employee_id: string;
  name: string;
  contact: string;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

export interface CreateStaffRequest {
  employee_id: string;
  name: string;
  contact?: string;
  notes?: string;
}

export interface UpdateStaffRequest {
  id: number;
  employee_id?: string;
  name?: string;
  contact?: string;
  notes?: string;
}

export interface SetStaffPasswordRequest {
  id: number;
  new_password: string;
  confirm_password: string;
}

export interface StaffListParams extends PaginationParams {
  all?: boolean;
}
