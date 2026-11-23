import React from 'react';
import { Provider } from 'react-redux';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { useAppSelector } from './store/hooks';
import { SnackbarHost } from './components/feedback/SnackbarHost';
import { ErrorBoundary } from './components/feedback/ErrorBoundary';
import { AuthBootstrap } from './components/auth/AuthBootstrap';
import { getTheme, type ThemeMode } from './theme';
import { selectThemeMode } from './store/slice/uiSlice';
import { router } from './routes/AppRouter';
import { store } from './store';
import { RouterProvider } from 'react-router-dom';

const ThemedApp: React.FC = () => {
  const themeMode = useAppSelector(selectThemeMode) as ThemeMode;
  const theme = getTheme(themeMode);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <AuthBootstrap>
          <RouterProvider router={router} />
          <SnackbarHost />
        </AuthBootstrap>
      </LocalizationProvider>
    </ThemeProvider>
  );
};

export const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <Provider store={store}>
        <ThemedApp />
      </Provider>
    </ErrorBoundary>
  );
};

export default App;