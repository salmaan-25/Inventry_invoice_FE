import React, { useEffect, type ReactNode } from 'react';
import { useGetCsrfQuery, useGetMeQuery } from '../../store/api/authApi';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import {
  setCredentials,
  clearCredentials,
  selectAuthStatus,
} from '../../store/slice/authSlice';
import { LoadingScreen } from '../common/LoadingScreen';

export interface AuthBootstrapProps {
  children: ReactNode;
}

export const AuthBootstrap: React.FC<AuthBootstrapProps> = ({ children }) => {
  const dispatch = useAppDispatch();
  const authStatus = useAppSelector(selectAuthStatus);

  // 1. Fetch CSRF token cookie first
  const { isLoading: isCsrfLoading } = useGetCsrfQuery();

  // 2. Fetch current session (Me)
  const {
    data: meData,
    error: meError,
    isLoading: isMeLoading,
    isSuccess: isMeSuccess,
  } = useGetMeQuery(undefined, {
    // Only query Me once CSRF has settled
    skip: isCsrfLoading,
  });

  useEffect(() => {
    if (isMeSuccess && meData) {
      dispatch(setCredentials(meData));
    } else if (meError) {
      dispatch(clearCredentials());
    }
  }, [isMeSuccess, meData, meError, dispatch]);

  const isBootstrapping =
    isCsrfLoading || isMeLoading || (authStatus === 'idle' && !meError);

  if (isBootstrapping) {
    return <LoadingScreen message="Initializing session..." minHeight="100vh" />;
  }

  return <>{children}</>;
};
