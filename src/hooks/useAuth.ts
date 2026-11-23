import { useAppSelector } from '../store/hooks';
import {
  selectCurrentUser,
  selectAuthStatus,
  selectIsAuthenticated,
  selectIsAdmin,
  selectUserRole,
} from '../store/slice/authSlice';
import type { Role } from '../constants/enums';

export function useAuth() {
  const user = useAppSelector(selectCurrentUser);
  const status = useAppSelector(selectAuthStatus);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const isAdmin = useAppSelector(selectIsAdmin);
  const role = useAppSelector(selectUserRole);

  const hasRole = (allowedRoles?: readonly Role[]): boolean => {
    if (!allowedRoles || allowedRoles.length === 0) return true;
    if (!role) return false;
    return allowedRoles.includes(role);
  };

  return {
    user,
    status,
    isAuthenticated,
    isAdmin,
    role,
    hasRole,
  };
}
