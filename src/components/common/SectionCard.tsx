import React, { type ReactNode } from 'react';
import { Card, CardHeader, CardContent, Divider, Box } from '@mui/material';

export interface SectionCardProps {
  title?: ReactNode;
  subheader?: ReactNode;
  action?: ReactNode;
  children: ReactNode;
  noPadding?: boolean;
}

export const SectionCard: React.FC<SectionCardProps> = ({
  title,
  subheader,
  action,
  children,
  noPadding = false,
}) => {
  return (
    <Card sx={{ mb: 3 }}>
      {(title || action) && (
        <>
          <CardHeader title={title} subheader={subheader} action={action} />
          <Divider />
        </>
      )}
      <CardContent sx={noPadding ? { p: 0, '&:last-child': { pb: 0 } } : undefined}>
        <Box>{children}</Box>
      </CardContent>
    </Card>
  );
};
