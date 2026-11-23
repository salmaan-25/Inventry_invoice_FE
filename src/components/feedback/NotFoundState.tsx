import React, { type ReactNode } from 'react';
import { Box, Typography, Button, Paper } from '@mui/material';
import SearchOffIcon from '@mui/icons-material/SearchOff';
import { Link as RouterLink } from 'react-router-dom';
import { ROUTES } from '../../constants/routes';

export interface NotFoundStateProps {
  title?: string;
  message?: string;
  action?: ReactNode;
}

export const NotFoundState: React.FC<NotFoundStateProps> = ({
  title = 'Page Not Found',
  message = 'The resource or page you requested could not be found.',
  action,
}) => {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '60vh',
        p: 3,
      }}
    >
      <Paper
        sx={{
          p: 5,
          maxWidth: 480,
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <SearchOffIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
        <Typography variant="h5" gutterBottom fontWeight={600}>
          {title}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          {message}
        </Typography>
        {action ?? (
          <Button
            component={RouterLink}
            to={ROUTES.dashboard}
            variant="contained"
            color="primary"
          >
            Back to Dashboard
          </Button>
        )}
      </Paper>
    </Box>
  );
};
