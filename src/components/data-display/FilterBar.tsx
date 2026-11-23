import React, { type ReactNode } from 'react';
import { Box, Stack } from '@mui/material';

export interface FilterBarProps {
  children: ReactNode;
  actions?: ReactNode;
}

export const FilterBar: React.FC<FilterBarProps> = ({ children, actions }) => {
  return (
    <Box
      sx={{
        p: 2,
        mb: 2,
        backgroundColor: 'background.paper',
        borderRadius: 1,
        border: '1px solid',
        borderColor: 'divider',
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 2,
      }}
    >
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={2}
        flexWrap="wrap"
        alignItems={{ xs: 'stretch', sm: 'center' }}
        sx={{ flex: 1 }}
      >
        {children}
      </Stack>
      {actions && (
        <Stack direction="row" spacing={1} alignItems="center">
          {actions}
        </Stack>
      )}
    </Box>
  );
};
