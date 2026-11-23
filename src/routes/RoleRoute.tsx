import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import type { Role } from '../constants/enums';
import { ROUTES } from '../constants/routes';

export interface RoleRouteProps {
  roles: readonly Role[];
}

export const RoleRoute: React.FC<RoleRouteProps> = ({ roles }) => {
  const { hasRole } = useAuth();

  if (!hasRole(roles)) {
    return <Navigate to={ROUTES.forbidden} replace />;
  }

  return <Outlet />;
};
