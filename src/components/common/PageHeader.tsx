import React, { type ReactNode } from 'react';
import { Box, Typography, Breadcrumbs, Link, Stack } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

export interface BreadcrumbItem {
  label: string;
  path?: string;
}

export interface PageHeaderProps {
  title: string;
  titleExtra?: ReactNode;
  subtitle?: string;
  breadcrumbs?: readonly BreadcrumbItem[];
  action?: ReactNode;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  titleExtra,
  subtitle,
  breadcrumbs,
  action,
}) => {
  return (
    <Box sx={{ mb: 3 }}>
      {breadcrumbs && breadcrumbs.length > 0 && (
        <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 1 }}>
          {breadcrumbs.map((crumb, index) => {
            const isLast = index === breadcrumbs.length - 1;
            if (isLast || !crumb.path) {
              return (
                <Typography key={crumb.label} color="text.primary" variant="body2">
                  {crumb.label}
                </Typography>
              );
            }
            return (
              <Link
                key={crumb.label}
                component={RouterLink}
                to={crumb.path}
                underline="hover"
                color="inherit"
                variant="body2"
              >
                {crumb.label}
              </Link>
            );
          })}
        </Breadcrumbs>
      )}

      <Stack
        direction={{ xs: 'column', md: 'row' }}
        justifyContent="space-between"
        alignItems={{ xs: 'flex-start', md: 'center' }}
        spacing={2}
      >
        <Box sx={{ width: { xs: '100%', md: 'auto' } }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
            <Typography
              variant="h5"
              component="h1"
              fontWeight={600}
              sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem' } }}
            >
              {title}
            </Typography>
            {titleExtra}
          </Box>
          {subtitle && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              {subtitle}
            </Typography>
          )}
        </Box>
        {action && (
          <Box
            sx={{
              flexShrink: 0,
              width: { xs: '100%', md: 'auto' },
              '& > *': { width: { xs: '100%', sm: 'auto' } },
            }}
          >
            {action}
          </Box>
        )}
      </Stack>
    </Box>
  );
};
