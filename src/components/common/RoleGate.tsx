import React, { type ReactNode } from 'react';
import { useAuth } from '../../hooks/useAuth';
import type { Role } from '../../constants/enums';

export interface RoleGateProps {
  roles: readonly Role[];
  children: ReactNode;
  fallback?: ReactNode;
}

export const RoleGate: React.FC<RoleGateProps> = ({
  roles,
  children,
  fallback = null,
}) => {
  const { hasRole } = useAuth();

  if (!hasRole(roles)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};
