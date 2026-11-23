import React, { type ReactNode } from 'react';
import { Box, Typography, Stack, Divider } from '@mui/material';

export interface KeyValueItem {
  label: string;
  value: ReactNode;
}

export interface KeyValueListProps {
  items: readonly KeyValueItem[];
  dense?: boolean;
}

export const KeyValueList: React.FC<KeyValueListProps> = ({ items, dense = false }) => {
  return (
    <Stack spacing={dense ? 1 : 1.5} divider={<Divider flexItem />}>
      {items.map((item) => (
        <Box
          key={item.label}
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Typography variant="body2" color="text.secondary">
            {item.label}
          </Typography>
          <Typography variant="body2" fontWeight={500} component="div">
            {item.value ?? '-'}
          </Typography>
        </Box>
      ))}
    </Stack>
  );
};
