import React from 'react';
import { Box, Typography, Button, Paper } from '@mui/material';
import BlockIcon from '@mui/icons-material/Block';
import { Link as RouterLink } from 'react-router-dom';
import { ROUTES } from '../../constants/routes';

export const ForbiddenPage: React.FC = () => {
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
        <BlockIcon sx={{ fontSize: 64, color: 'error.main', mb: 2 }} />
        <Typography variant="h5" gutterBottom fontWeight={600}>
          Access Denied
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          You do not have administrative privileges to view this page.
        </Typography>
        <Button
          component={RouterLink}
          to={ROUTES.dashboard}
          variant="contained"
          color="primary"
        >
          Back to Dashboard
        </Button>
      </Paper>
    </Box>
  );
};

export default ForbiddenPage;
