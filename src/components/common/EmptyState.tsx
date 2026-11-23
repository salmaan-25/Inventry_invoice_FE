import React, { type ReactNode } from 'react';
import { Box, Typography, Stack } from '@mui/material';
import InboxOutlinedIcon from '@mui/icons-material/InboxOutlined';
import { MESSAGES } from '../../constants/messages';

export interface EmptyStateProps {
  title?: string;
  message?: string;
  icon?: ReactNode;
  action?: ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = MESSAGES.general.emptyData,
  message,
  icon = <InboxOutlinedIcon sx={{ fontSize: 48, color: 'text.secondary' }} />,
  action,
}) => {
  return (
    <Box
      sx={{
        py: 6,
        px: 2,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
      }}
    >
      <Box sx={{ mb: 2 }}>{icon}</Box>
      <Typography variant="subtitle1" fontWeight={500} color="text.primary">
        {title}
      </Typography>
      {message && (
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, maxWidth: 400 }}>
          {message}
        </Typography>
      )}
      {action && <Stack sx={{ mt: 2.5 }}>{action}</Stack>}
    </Box>
  );
};
