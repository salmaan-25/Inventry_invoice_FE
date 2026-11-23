import React from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';
import { MESSAGES } from '../../constants/messages';

export interface LoadingScreenProps {
  message?: string;
  minHeight?: number | string;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({
  message = MESSAGES.general.loading,
  minHeight = '50vh',
}) => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight,
        gap: 2,
      }}
    >
      <CircularProgress size={40} />
      {message && (
        <Typography variant="body2" color="text.secondary">
          {message}
        </Typography>
      )}
    </Box>
  );
};
