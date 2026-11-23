import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { Role } from '../../constants/enums';

export interface AuthUser {
  id: number;
  username: string;
  full_name: string;
  role: Role;
}

export type AuthStatus = 'idle' | 'loading' | 'authenticated' | 'unauthenticated';

export interface AuthState {
  user?: AuthUser;
  status: AuthStatus;
}

const initialState: AuthState = {
  user: undefined,
  status: 'idle',
};

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setLoading: (state) => {
      state.status = 'loading';
    },
    setCredentials: (state, action: PayloadAction<AuthUser>) => {
      state.user = action.payload;
      state.status = 'authenticated';
    },
    clearCredentials: (state) => {
      state.user = undefined;
      state.status = 'unauthenticated';
    },
    sessionExpired: (state) => {
      state.user = undefined;
      state.status = 'unauthenticated';
    },
  },
});

export const { setLoading, setCredentials, clearCredentials, sessionExpired } = authSlice.actions;

export const selectCurrentUser = (state: { auth: AuthState }) => state.auth.user;
export const selectAuthStatus = (state: { auth: AuthState }) => state.auth.status;
export const selectIsAuthenticated = (state: { auth: AuthState }) =>
  state.auth.status === 'authenticated' && state.auth.user !== undefined;
export const selectUserRole = (state: { auth: AuthState }) => state.auth.user?.role;
export const selectIsAdmin = (state: { auth: AuthState }) => state.auth.user?.role === 'ADMIN';

export default authSlice.reducer;
