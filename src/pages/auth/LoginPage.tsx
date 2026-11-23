import React, { useState, useEffect } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Box,
  Typography,
  Button,
  CircularProgress,
  InputAdornment,
  IconButton,
  Alert,
} from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { useNavigate, useLocation } from 'react-router-dom';

import { AuthLayout } from '../../components/layout/AuthLayout';
import { FormTextField } from '../../components/form/FormTextField';
import { loginSchema, type LoginFormValues } from '../../schemas/auth';
import { useLoginMutation } from '../../store/api/authApi';
import { useAppDispatch } from '../../store/hooks';
import { setCredentials } from '../../store/slice/authSlice';
import { useAuth } from '../../hooks/useAuth';
import { useNotify } from '../../hooks/useNotify';
import { ROUTES } from '../../constants/routes';
import { MESSAGES } from '../../constants/messages';
import { API_ERROR_CODE } from '../../constants/apiErrorCodes';
import { parseApiError } from '../../utils/apiError';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();
  const { isAuthenticated } = useAuth();
  const { notifySuccess } = useNotify();

  const [login, { isLoading }] = useLoginMutation();
  const [showPassword, setShowPassword] = useState(false);
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [throttledSeconds, setThrottledSeconds] = useState(0);

  const methods = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: '',
      password: '',
    },
  });

  const targetPath =
    (location.state as { from?: { pathname: string } } | undefined)?.from?.pathname ??
    ROUTES.dashboard;

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate(targetPath, { replace: true });
    }
  }, [isAuthenticated, navigate, targetPath]);

  // Countdown timer when throttled
  useEffect(() => {
    if (throttledSeconds <= 0) return;
    const timer = setInterval(() => {
      setThrottledSeconds((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [throttledSeconds]);

  const onSubmit = async (values: LoginFormValues) => {
    setGeneralError(null);
    try {
      const user = await login(values).unwrap();
      dispatch(setCredentials(user));
      notifySuccess(MESSAGES.auth.loginSuccess);
      navigate(targetPath, { replace: true });
    } catch (err: unknown) {
      const parsed = parseApiError(err);
      if (parsed.code === API_ERROR_CODE.THROTTLED) {
        setThrottledSeconds(60);
        setGeneralError(MESSAGES.auth.throttled);
      } else if (parsed.status === 400 || parsed.status === 401) {
        setGeneralError(MESSAGES.auth.invalidCredentials);
      } else {
        setGeneralError(parsed.detail || MESSAGES.general.unexpectedError);
      }
    }
  };

  const isSubmitDisabled = isLoading || throttledSeconds > 0;

  return (
    <AuthLayout>
      <Box
        sx={{
          p: 1.5,
          backgroundColor: 'primary.main',
          borderRadius: '50%',
          mb: 1.5,
          display: 'flex',
          color: 'primary.contrastText',
        }}
      >
        <LockOutlinedIcon />
      </Box>

      <Typography component="h1" variant="h5" fontWeight={600} gutterBottom>
        Sign In
      </Typography>
      <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 3 }}>
        Billing &amp; Inventory Management System
      </Typography>

      {generalError && (
        <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
          {generalError}
        </Alert>
      )}

      <FormProvider {...methods}>
        <Box
          component="form"
          onSubmit={methods.handleSubmit(onSubmit)}
          noValidate
          sx={{ width: '100%' }}
        >
          <FormTextField
            name="username"
            label="Username"
            autoComplete="username"
            autoFocus
            disabled={isLoading}
            sx={{ mb: 2 }}
          />

          <FormTextField
            name="password"
            label="Password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="current-password"
            disabled={isLoading}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle password visibility"
                    onClick={() => setShowPassword((prev) => !prev)}
                    edge="end"
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
            sx={{ mb: 3 }}
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            disabled={isSubmitDisabled}
            startIcon={
              isLoading ? <CircularProgress size={16} color="inherit" /> : undefined
            }
            sx={{ py: 1.2 }}
          >
            {throttledSeconds > 0
              ? `Wait ${throttledSeconds}s`
              : isLoading
                ? 'Signing In...'
                : 'Sign In'}
          </Button>
        </Box>
      </FormProvider>
    </AuthLayout>
  );
};

export default LoginPage;
