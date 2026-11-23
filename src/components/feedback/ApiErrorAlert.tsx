import React from 'react';
import { Alert, AlertTitle, Box, type SxProps, type Theme } from '@mui/material';
import type { ApiError } from '../../types/api/common';

export interface ApiErrorAlertProps {
  error: ApiError | string | null | undefined;
  onClose?: () => void;
  sx?: SxProps<Theme>;
}

export const ApiErrorAlert: React.FC<ApiErrorAlertProps> = ({ error, onClose, sx }) => {
  if (!error) return null;

  const code = typeof error === 'string' ? 'Error' : error.code || 'Error';
  const detail = typeof error === 'string' ? error : error.detail;

  return (
    <Box sx={{ mb: 2, ...sx }}>
      <Alert severity="error" onClose={onClose}>
        <AlertTitle>{code}</AlertTitle>
        {detail}
      </Alert>
    </Box>
  );
};
