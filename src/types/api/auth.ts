import type { Role } from '../../constants/enums';

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  id: number;
  username: string;
  full_name: string;
  role: Role;
}

export type MeResponse = LoginResponse;

export interface CsrfResponse {
  detail: string;
}

export interface LogoutResponse {
  detail: string;
}
