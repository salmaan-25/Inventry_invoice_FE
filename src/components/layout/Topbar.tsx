import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Box,
  Button,
  Avatar,
  Switch,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import LogoutIcon from '@mui/icons-material/Logout';
import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import { useNavigate } from 'react-router-dom';

import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { toggleSidebar, toggleThemeMode, selectThemeMode } from '../../store/slice/uiSlice';
import { clearCredentials, selectCurrentUser } from '../../store/slice/authSlice';
import { useLogoutMutation } from '../../store/api/authApi';
import { useGetCompanyQuery } from '../../store/api/companyApi';
import { baseApi } from '../../store/api/baseApi';
import { useNotify } from '../../hooks/useNotify';
import { ConfirmDialog } from '../common/ConfirmDialog';
import { ROUTES } from '../../constants/routes';
import { MESSAGES } from '../../constants/messages';

export const Topbar: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const currentUser = useAppSelector(selectCurrentUser);
  const { data: company } = useGetCompanyQuery();
  const { notifySuccess, notifyError } = useNotify();

  const [logout, { isLoading: isLoggingOut }] = useLogoutMutation();
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);

  const handleLogoutConfirm = async () => {
    try {
      await logout().unwrap();
      dispatch(clearCredentials());
      dispatch(baseApi.util.resetApiState());
      notifySuccess(MESSAGES.auth.logoutSuccess);
      setLogoutDialogOpen(false);
      navigate(ROUTES.login, { replace: true });
    } catch {
      dispatch(clearCredentials());
      dispatch(baseApi.util.resetApiState());
      notifyError('Logged out locally.');
      setLogoutDialogOpen(false);
      navigate(ROUTES.login, { replace: true });
    }
  };

  const displayName = company?.business_name || 'Billing & Inventory System';
  const themeMode = useAppSelector(selectThemeMode);

  return (
    <>
      <AppBar
        position="fixed"
        sx={{
          zIndex: (theme) => theme.zIndex.drawer + 1,
          backgroundColor: 'background.paper',
          color: 'text.primary',
          borderBottom: '1px solid',
          borderColor: 'divider',
          boxShadow: 'none',
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="toggle drawer"
            edge="start"
            onClick={() => dispatch(toggleSidebar())}
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexGrow: 1 }}>
            {company?.logo && (
              <Avatar
                src={company.logo}
                alt={company.business_name}
                variant="rounded"
                sx={{ width: 32, height: 32 }}
              />
            )}
            <Typography
              variant="h6"
              noWrap
              component="div"
              sx={{ fontWeight: 600 }}
            >
              {displayName}
            </Typography>
          </Box>

          {currentUser && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <AccountCircleIcon color="action" />
                <Box
                  sx={{
                    display: { xs: 'none', sm: 'block' },
                    textAlign: 'right',
                  }}
                >
                  <Typography variant="body2" fontWeight={500}>
                    {currentUser.full_name || currentUser.username}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {currentUser.role}
                  </Typography>
                </Box>
              </Box>

              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.75,
                  px: 1,
                  py: 0.5,
                  borderRadius: 2,
                  border: '1px solid',
                  borderColor: 'divider',
                  backgroundColor: 'action.hover',
                }}
              >
                {themeMode === 'dark' ? (
                  <DarkModeIcon fontSize="small" sx={{ color: 'primary.light' }} />
                ) : (
                  <LightModeIcon fontSize="small" sx={{ color: 'warning.main' }} />
                )}
                <Typography
                  variant="caption"
                  sx={{
                    fontWeight: 600,
                    color: 'text.secondary',
                    fontSize: '0.75rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    userSelect: 'none',
                  }}
                >
                  {themeMode === 'dark' ? 'Dark' : 'Light'}
                </Typography>
                <Switch
                  size="small"
                  checked={themeMode === 'dark'}
                  onChange={() => dispatch(toggleThemeMode())}
                  inputProps={{ 'aria-label': 'toggle dark or light mode' }}
                />
              </Box>

              <Button
                variant="outlined"
                color="inherit"
                size="small"
                startIcon={<LogoutIcon />}
                onClick={() => setLogoutDialogOpen(true)}
              >
                Logout
              </Button>
            </Box>
          )}
        </Toolbar>
      </AppBar>

      <ConfirmDialog
        open={logoutDialogOpen}
        title="Sign Out"
        message="Are you sure you want to sign out of your account?"
        confirmLabel="Logout"
        confirmColor="primary"
        isLoading={isLoggingOut}
        onConfirm={() => void handleLogoutConfirm()}
        onCancel={() => setLogoutDialogOpen(false)}
      />
    </>
  );
};