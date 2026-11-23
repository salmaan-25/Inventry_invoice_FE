import { createTheme, type Theme } from '@mui/material/styles';

type ThemeMode = 'light' | 'dark';

const lightPalette = {
  primary: {
    main: '#1976d2',
    light: '#42a5f5',
    dark: '#1565c0',
    contrastText: '#ffffff',
  },
  secondary: {
    main: '#9c27b0',
    light: '#ba68c8',
    dark: '#7b1fa2',
    contrastText: '#ffffff',
  },
  error: {
    main: '#d32f2f',
    light: '#ef5350',
    dark: '#c62828',
  },
  warning: {
    main: '#ed6c02',
    light: '#ff9800',
    dark: '#e65100',
  },
  info: {
    main: '#0288d1',
    light: '#03a9f4',
    dark: '#01579b',
  },
  success: {
    main: '#2e7d32',
    light: '#4caf50',
    dark: '#1b5e20',
  },
  background: {
    default: '#f8fafc',
    paper: '#ffffff',
  },
  text: {
    primary: '#0f172a',
    secondary: '#475569',
  },
};

const darkPalette = {
  primary: {
    main: '#90caf9',
    light: '#e3f2fd',
    dark: '#1976d2',
    contrastText: '#1a237e',
  },
  secondary: {
    main: '#ba68c8',
    light: '#ce93d8',
    dark: '#ab47bc',
    contrastText: '#2c1840',
  },
  error: {
    main: '#ef5350',
    light: '#f44336',
    dark: '#e53935',
  },
  warning: {
    main: '#ff9800',
    light: '#ffb74d',
    dark: '#fb8c00',
  },
  info: {
    main: '#81d4fa',
    light: '#e1f5fe',
    dark: '#01579b',
  },
  success: {
    main: '#a5d6a7',
    light: '#c8e6c9',
    dark: '#66bb6a',
  },
  background: {
    default: '#1e293b',
    paper: '#334155',
  },
  text: {
    primary: '#f1f5f9',
    secondary: '#94a3b8',
  },
};

export type { ThemeMode };

export const getTheme = (mode: ThemeMode): Theme => {
  const palette = mode === 'dark' ? darkPalette : lightPalette;

  return createTheme({
    palette: {
      mode,
      ...palette,
    },
    typography: {
      fontFamily: [
        'Roboto',
        '-apple-system',
        'BlinkMacSystemFont',
        '"Segoe UI"',
        'Arial',
        'sans-serif',
      ].join(','),
      h4: {
        fontWeight: 600,
      },
      h5: {
        fontWeight: 600,
      },
      h6: {
        fontWeight: 600,
      },
      subtitle1: {
        fontWeight: 500,
      },
      subtitle2: {
        fontWeight: 500,
      },
    },
    shape: {
      borderRadius: 12,
    },
    components: {
      MuiButton: {
        defaultProps: {
          disableElevation: true,
        },
        styleOverrides: {
          root: {
            textTransform: 'none',
            fontWeight: 500,
            borderRadius: 8,
          },
          contained: {
            boxShadow: 'none',
            '&:hover': {
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            },
          },
          containedPrimary: {
            backgroundColor: '#1976d2',
            color: '#ffffff',
            '&:hover': {
              backgroundColor: '#1565c0',
            },
          },
          containedSecondary: {
            backgroundColor: '#9c27b0',
            color: '#ffffff',
            '&:hover': {
              backgroundColor: '#ba68c8',
            },
          },
          outlined: {
            borderRadius: 8,
            borderWidth: 2,
          },
        },
      },
      MuiTextField: {
        defaultProps: {
          size: 'small',
          variant: 'outlined',
        },
        styleOverrides: {
          root: {
            '& .MuiOutlinedInput-root': {
              borderRadius: 8,
            },
            '& .MuiOutlinedInput-notchedOutline': {
              borderRadius: 8,
            },
          },
        },
      },
      MuiSelect: {
        defaultProps: {
          size: 'small',
        },
        styleOverrides: {
          root: {
            borderRadius: 8,
          },
        },
      },
      MuiFormControl: {
        defaultProps: {
          size: 'small',
        },
      },
      MuiTable: {
        defaultProps: {
          size: 'small',
        },
        styleOverrides: {
          root: {
            borderRadius: 8,
          },
        },
      },
      MuiTableHead: {
        styleOverrides: {
          root: {
            backgroundColor: mode === 'dark' ? '#334155' : '#f1f5f9',
            '& .MuiTableCell-head': {
              fontWeight: 600,
              color: mode === 'dark' ? '#f1f5f9' : '#334155',
            },
          },
        },
      },
      MuiPaper: {
        defaultProps: {
          elevation: 0,
          variant: 'outlined',
        },
        styleOverrides: {
          root: {
            borderRadius: 12,
          },
        },
      },
      MuiCard: {
        defaultProps: {
          elevation: 0,
          variant: 'outlined',
        },
        styleOverrides: {
          root: {
            borderRadius: 16,
            boxShadow: mode === 'dark' ? '0 4px 20px rgba(0, 0, 0, 0.3)' : '0 4px 12px rgba(0, 0, 0, 0.05)',
          },
        },
      },
      MuiAvatar: {
        styleOverrides: {
          root: {
            border: '2px solid',
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            borderRadius: 0,
            margin: 0,
            padding: 0,
          },
        },
      },
      MuiDrawer: {
        styleOverrides: {
          paper: {
            borderRadius: 0,
          },
        },
      },
      MuiMenu: {
        styleOverrides: {
          paper: {
            borderRadius: 8,
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            borderRadius: 6,
          },
        },
      },
      MuiTooltip: {
        styleOverrides: {
          tooltip: {
            borderRadius: 6,
          },
        },
      },
    },
  });
};

export const theme = getTheme('light');
export default theme;