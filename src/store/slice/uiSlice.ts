import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export type AlertSeverity = 'success' | 'info' | 'warning' | 'error';

export type ThemeMode = 'light' | 'dark';

export interface SnackbarState {
  open: boolean;
  message: string;
  severity: AlertSeverity;
}

export interface UiState {
  sidebarOpen: boolean;
  themeMode: ThemeMode;
  snackbar: SnackbarState;
}

const getInitialSidebarOpen = (): boolean => {
  if (typeof window !== 'undefined') {
    const saved = window.localStorage.getItem('sidebar_open');
    if (saved !== null) {
      return saved === 'true';
    }
  }
  return false;
};

const getInitialThemeMode = (): ThemeMode => {
  if (typeof window !== 'undefined') {
    const saved = window.localStorage.getItem('theme_mode');
    if (saved === 'dark' || saved === 'light') {
      return saved;
    }
  }
  return 'light';
};

const initialState: UiState = {
  sidebarOpen: getInitialSidebarOpen(),
  themeMode: getInitialThemeMode(),
  snackbar: {
    open: false,
    message: '',
    severity: 'info',
  },
};

export const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
      if (typeof window !== 'undefined') {
        window.localStorage.setItem('sidebar_open', String(state.sidebarOpen));
      }
    },
    setSidebarOpen: (state, action: PayloadAction<boolean>) => {
      state.sidebarOpen = action.payload;
      if (typeof window !== 'undefined') {
        window.localStorage.setItem('sidebar_open', String(action.payload));
      }
    },
    toggleThemeMode: (state) => {
      state.themeMode = state.themeMode === 'light' ? 'dark' : 'light';
      if (typeof window !== 'undefined') {
        window.localStorage.setItem('theme_mode', state.themeMode);
      }
    },
    setThemeMode: (state, action: PayloadAction<ThemeMode>) => {
      state.themeMode = action.payload;
      if (typeof window !== 'undefined') {
        window.localStorage.setItem('theme_mode', action.payload);
      }
    },
    showSnackbar: (
      state,
      action: PayloadAction<{ message: string; severity?: AlertSeverity }>
    ) => {
      state.snackbar = {
        open: true,
        message: action.payload.message,
        severity: action.payload.severity ?? 'info',
      };
    },
    hideSnackbar: (state) => {
      state.snackbar.open = false;
    },
  },
});

export const { toggleSidebar, setSidebarOpen, toggleThemeMode, setThemeMode, showSnackbar, hideSnackbar } = uiSlice.actions;

export const selectSidebarOpen = (state: { ui: UiState }) => state.ui.sidebarOpen;
export const selectThemeMode = (state: { ui: UiState }) => state.ui.themeMode;
export const selectSnackbar = (state: { ui: UiState }) => state.ui.snackbar;

export default uiSlice.reducer;
