import React from 'react';
import { Box, Container, Toolbar } from '@mui/material';
import { Outlet } from 'react-router-dom';
import { Topbar } from './Topbar';
import { Sidebar, DRAWER_WIDTH, MINI_DRAWER_WIDTH } from './Sidebar';
import { useAppSelector } from '../../store/hooks';
import { selectSidebarOpen } from '../../store/slice/uiSlice';

export const AppShell: React.FC = () => {
  const isSidebarOpen = useAppSelector(selectSidebarOpen);

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', backgroundColor: 'background.default' }}>
      <Topbar />
      <Sidebar />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 1.5, sm: 2.5, md: 3 },
          width: {
            xs: '100%',
            md: `calc(100% - ${isSidebarOpen ? DRAWER_WIDTH : MINI_DRAWER_WIDTH}px)`,
          },
          transition: (theme) =>
            theme.transitions.create(['width', 'margin'], {
              easing: theme.transitions.easing.sharp,
              duration: isSidebarOpen
                ? theme.transitions.duration.enteringScreen
                : theme.transitions.duration.leavingScreen,
            }),
          minWidth: 0,
          overflowX: 'hidden',
        }}
      >
        <Toolbar />
        <Container maxWidth="xl" sx={{ mt: 1, mb: 4, px: { xs: 0.5, sm: 2 } }}>
          <Outlet />
        </Container>
      </Box>
    </Box>
  );
};
