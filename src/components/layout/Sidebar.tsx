import React from 'react';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Divider,
  Box,
  Typography,
  Avatar,
  Tooltip,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { useLocation, Link as RouterLink } from 'react-router-dom';
import DashboardIcon from '@mui/icons-material/Dashboard';
import ReceiptIcon from '@mui/icons-material/Receipt';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import PaymentIcon from '@mui/icons-material/Payment';
import PeopleIcon from '@mui/icons-material/People';
import Inventory2Icon from '@mui/icons-material/Inventory2';
import HistoryIcon from '@mui/icons-material/History';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import BusinessIcon from '@mui/icons-material/Business';
import BadgeIcon from '@mui/icons-material/Badge';
import CategoryIcon from '@mui/icons-material/Category';

import { NAVIGATION_ITEMS } from '../../constants/navigation';
import { useAuth } from '../../hooks/useAuth';
import { useGetCompanyQuery } from '../../store/api/companyApi';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { selectSidebarOpen, setSidebarOpen } from '../../store/slice/uiSlice';

const iconMap: Record<string, React.ReactElement> = {
  Dashboard: <DashboardIcon />,
  Receipt: <ReceiptIcon />,
  LocalShipping: <LocalShippingIcon />,
  Payment: <PaymentIcon />,
  People: <PeopleIcon />,
  Inventory2: <Inventory2Icon />,
  History: <HistoryIcon />,
  TrendingDown: <TrendingDownIcon />,
  TrendingUp: <TrendingUpIcon />,
  Business: <BusinessIcon />,
  Badge: <BadgeIcon />,
  Category: <CategoryIcon />,
};

export const DRAWER_WIDTH = 260;
export const MINI_DRAWER_WIDTH = 68;

export const Sidebar: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const location = useLocation();
  const dispatch = useAppDispatch();
  const isOpen = useAppSelector(selectSidebarOpen);
  const { hasRole } = useAuth();
  const { data: company } = useGetCompanyQuery();

  React.useEffect(() => {
    if (isMobile && isOpen) {
      dispatch(setSidebarOpen(false));
    }
  }, [location.pathname, isMobile, isOpen, dispatch]);

  const handleClose = () => {
    if (isMobile) {
      dispatch(setSidebarOpen(false));
    }
  };

  const navItems = NAVIGATION_ITEMS.filter((item) => hasRole(item.roles));
  const isExpanded = isMobile || isOpen;

  const drawerContent = (
    <Box sx={{ overflowX: 'hidden', overflowY: 'auto', height: '100%' }}>
      <Toolbar />
      <Box
        sx={{
          px: isExpanded ? 2 : 1.5,
          py: 1.5,
          display: 'flex',
          alignItems: 'center',
          justifyContent: isExpanded ? 'flex-start' : 'center',
          gap: 1.5,
          minHeight: 64,
        }}
      >
        <Tooltip
          title={company?.business_name || 'System Menu'}
          placement="right"
          disableHoverListener={isExpanded}
          arrow
        >
          {company?.logo ? (
            <Avatar
              src={company.logo}
              alt={company.business_name}
              variant="rounded"
              sx={{ width: 36, height: 36, flexShrink: 0 }}
            />
          ) : (
            <Avatar
              variant="rounded"
              sx={{
                width: 36,
                height: 36,
                bgcolor: 'primary.light',
                color: 'primary.contrastText',
                flexShrink: 0,
              }}
            >
              <BusinessIcon fontSize="small" />
            </Avatar>
          )}
        </Tooltip>
        {isExpanded && (
          <Box sx={{ overflow: 'hidden', whiteSpace: 'nowrap' }}>
            <Typography variant="subtitle2" noWrap fontWeight={600}>
              {company?.business_name || 'System Menu'}
            </Typography>
            <Typography variant="caption" color="text.secondary" noWrap display="block">
              {company?.gstin || 'Main Workspace'}
            </Typography>
          </Box>
        )}
      </Box>
      <Divider />
      <List sx={{ px: 1, py: 1 }}>
        {navItems.map((item) => {
          const isSelected =
            item.path === '/'
              ? location.pathname === '/'
              : location.pathname.startsWith(item.path);

          return (
            <ListItem key={item.path} disablePadding sx={{ mb: 0.5, display: 'block' }}>
              <Tooltip
                title={item.label}
                placement="right"
                disableHoverListener={isExpanded}
                arrow
              >
                <ListItemButton
                  component={RouterLink}
                  to={item.path}
                  onClick={handleClose}
                  selected={isSelected}
                  sx={{
                    minHeight: 44,
                    justifyContent: isExpanded ? 'initial' : 'center',
                    px: isExpanded ? 2 : 1.5,
                    borderRadius: 1,
                    '&.Mui-selected': {
                      backgroundColor: 'primary.light',
                      color: 'primary.contrastText',
                      '&:hover': {
                        backgroundColor: 'primary.main',
                      },
                      '& .MuiListItemIcon-root': {
                        color: 'primary.contrastText',
                      },
                    },
                  }}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: 0,
                      mr: isExpanded ? 2 : 'auto',
                      justifyContent: 'center',
                      color: isSelected ? 'inherit' : 'action.active',
                    }}
                  >
                    {iconMap[item.iconName] ?? <DashboardIcon />}
                  </ListItemIcon>
                  {isExpanded && (
                    <ListItemText
                      primary={item.label}
                      primaryTypographyProps={{
                        fontSize: '0.875rem',
                        fontWeight: isSelected ? 600 : 400,
                        noWrap: true,
                      }}
                    />
                  )}
                </ListItemButton>
              </Tooltip>
            </ListItem>
          );
        })}
      </List>
    </Box>
  );

  return (
    <>
      {isMobile ? (
        <Drawer
          variant="temporary"
          open={isOpen}
          onClose={handleClose}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', md: 'none' },
            zIndex: (theme) => theme.zIndex.drawer + 2,
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: DRAWER_WIDTH },
          }}
        >
          {drawerContent}
        </Drawer>
      ) : (
        <Drawer
          variant="permanent"
          open={isOpen}
          sx={{
            display: { xs: 'none', md: 'block' },
            width: isOpen ? DRAWER_WIDTH : MINI_DRAWER_WIDTH,
            flexShrink: 0,
            whiteSpace: 'nowrap',
            boxSizing: 'border-box',
            '& .MuiDrawer-paper': {
              width: isOpen ? DRAWER_WIDTH : MINI_DRAWER_WIDTH,
              boxSizing: 'border-box',
              borderRight: '1px solid',
              borderColor: 'divider',
              overflowX: 'hidden',
              transition: (theme) =>
                theme.transitions.create('width', {
                  easing: theme.transitions.easing.sharp,
                  duration: isOpen
                    ? theme.transitions.duration.enteringScreen
                    : theme.transitions.duration.leavingScreen,
                }),
            },
          }}
        >
          {drawerContent}
        </Drawer>
      )}
    </>
  );
};
