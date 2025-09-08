import { createTheme, alpha, keyframes } from '@mui/material/styles';

// Animation keyframes matching original system
export const modalSlideIn = keyframes`
  from {
    transform: translateY(-50px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
`;

export const buttonHover = keyframes`
  0% {
    transform: translateY(0);
  }
  100% {
    transform: translateY(-2px);
  }
`;

export const cardHover = keyframes`
  0% {
    transform: translateY(0);
  }
  100% {
    transform: translateY(-5px);
  }
`;

/**
 * New York Business Theme for Material-UI
 * Matches the sophisticated monochromatic color palette from styles-ny-business.css
 * Professional enterprise design with charcoal and gray tones
 */
export const theme = createTheme({
  palette: {
    mode: 'light',
    // Primary color - Deep charcoal (#2C2C2C)
    primary: {
      main: '#2C2C2C', // Deep charcoal from CSS
      light: '#4A4A4A',
      dark: '#1A1A1A',
      contrastText: '#FFFFFF',
    },
    // Secondary color - Medium gray (#6B7280)
    secondary: {
      main: '#6B7280', // Medium gray from CSS
      light: '#9CA3AF',
      dark: '#4B5563',
      contrastText: '#FFFFFF',
    },
    // Background colors - matching New York Business theme
    background: {
      default: '#FAFAFA', // Off-white from CSS
      paper: '#FFFFFF', // Pure white surface from CSS
    },
    // Text colors - matching New York Business theme
    text: {
      primary: '#374151', // Dark gray text from CSS
      secondary: '#9CA3AF', // Light gray text from CSS
      disabled: '#D1D5DB',
    },
    // Semantic colors - matching New York Business theme
    success: {
      main: '#065F46', // Dark green from CSS
      light: '#047857',
      dark: '#064E3B',
      contrastText: '#FFFFFF',
    },
    warning: {
      main: '#92400E', // Dark amber from CSS
      light: '#B45309',
      dark: '#78350F',
      contrastText: '#FFFFFF',
    },
    error: {
      main: '#991B1B', // Dark red from CSS
      light: '#B91C1C',
      dark: '#7F1D1D',
      contrastText: '#FFFFFF',
    },
    info: {
      main: '#1E3A8A', // Dark blue from CSS
      light: '#1E40AF',
      dark: '#1E3A8A',
      contrastText: '#FFFFFF',
    },
    // Divider and border colors
    divider: alpha('#374151', 0.12),
    // Action colors
    action: {
      active: '#374151',
      hover: alpha('#374151', 0.04),
      selected: alpha('#374151', 0.08),
      disabled: alpha('#374151', 0.26),
      disabledBackground: alpha('#374151', 0.12),
    },
  },
  typography: {
    // Font family matching New York Business theme
    fontFamily: [
      '"Inter"',
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'sans-serif',
    ].join(','),
    fontSize: 16,
    h1: {
      fontSize: '1.6rem', // 25.6px - matching original header
      fontWeight: 300, // Light weight like original
      lineHeight: 1.2,
      color: '#333',
    },
    h2: {
      fontSize: '1.5rem', // 24px
      fontWeight: 600,
      lineHeight: 1.3,
      color: '#333',
    },
    h3: {
      fontSize: '1.25rem', // 20px
      fontWeight: 600,
      lineHeight: 1.4,
      color: '#333',
    },
    h4: {
      fontSize: '1.125rem', // 18px
      fontWeight: 500,
      lineHeight: 1.4,
      color: '#333',
    },
    h5: {
      fontSize: '1rem', // 16px
      fontWeight: 500,
      lineHeight: 1.5,
      color: '#333',
    },
    h6: {
      fontSize: '0.875rem', // 14px
      fontWeight: 500,
      lineHeight: 1.5,
      color: '#333',
    },
    body1: {
      fontSize: '1rem', // 16px
      fontWeight: 400,
      lineHeight: 1.6, // Original line-height
      color: '#333',
    },
    body2: {
      fontSize: '0.875rem', // 14px
      fontWeight: 400,
      lineHeight: 1.4,
      color: '#666',
    },
    caption: {
      fontSize: '0.75rem', // 12px
      fontWeight: 400,
      lineHeight: 1.33,
      color: '#999',
    },
    button: {
      fontSize: '0.9rem', // 14.4px - matching original buttons
      fontWeight: 500,
      lineHeight: 1.43,
      textTransform: 'none' as const,
    },
  },
  spacing: 8, // 8px base unit
  shape: {
    borderRadius: 8, // 8px default border radius
  },
  shadows: [
    'none',
    '0 1px 2px 0 rgba(0, 0, 0, 0.05)', // elevation 1
    '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)', // elevation 2
    '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)', // elevation 3
    '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)', // elevation 4
    '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)', // elevation 5
    '0 25px 50px -12px rgba(0, 0, 0, 0.25)', // elevation 6
    '0 25px 50px -12px rgba(0, 0, 0, 0.25)', // elevation 7
    '0 25px 50px -12px rgba(0, 0, 0, 0.25)', // elevation 8
    '0 25px 50px -12px rgba(0, 0, 0, 0.25)', // elevation 9
    '0 25px 50px -12px rgba(0, 0, 0, 0.25)', // elevation 10
    '0 25px 50px -12px rgba(0, 0, 0, 0.25)', // elevation 11
    '0 25px 50px -12px rgba(0, 0, 0, 0.25)', // elevation 12
    '0 25px 50px -12px rgba(0, 0, 0, 0.25)', // elevation 13
    '0 25px 50px -12px rgba(0, 0, 0, 0.25)', // elevation 14
    '0 25px 50px -12px rgba(0, 0, 0, 0.25)', // elevation 15
    '0 25px 50px -12px rgba(0, 0, 0, 0.25)', // elevation 16
    '0 25px 50px -12px rgba(0, 0, 0, 0.25)', // elevation 17
    '0 25px 50px -12px rgba(0, 0, 0, 0.25)', // elevation 18
    '0 25px 50px -12px rgba(0, 0, 0, 0.25)', // elevation 19
    '0 25px 50px -12px rgba(0, 0, 0, 0.25)', // elevation 20
    '0 25px 50px -12px rgba(0, 0, 0, 0.25)', // elevation 21
    '0 25px 50px -12px rgba(0, 0, 0, 0.25)', // elevation 22
    '0 25px 50px -12px rgba(0, 0, 0, 0.25)', // elevation 23
    '0 25px 50px -12px rgba(0, 0, 0, 0.25)', // elevation 24
  ],
  transitions: {
    duration: {
      shortest: 150,
      shorter: 200,
      short: 250,
      standard: 300,
      complex: 375,
      enteringScreen: 225,
      leavingScreen: 195,
    },
    easing: {
      easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
      easeOut: 'cubic-bezier(0.0, 0, 0.2, 1)',
      easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
      sharp: 'cubic-bezier(0.4, 0, 0.6, 1)',
    },
  },
  zIndex: {
    mobileStepper: 1000,
    fab: 1050,
    speedDial: 1050,
    appBar: 1100,
    drawer: 1200,
    modal: 1300,
    snackbar: 1400,
    tooltip: 1500,
  },
  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 768,
      lg: 1024,
      xl: 1400,
    },
  },
});

// Export theme utilities
export * from './utils';

// New York Business Theme with component customizations
export const newYorkBusinessTheme = createTheme(theme, {
  components: {
    // Button component customizations - New York Business styling
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 500,
          borderRadius: '8px', // Matching --radius-base from CSS
          padding: '10px 20px',
          fontSize: '0.9rem',
          transition: 'all 200ms ease-in-out', // Matching --transition-base
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          boxShadow: 'none',
          '&:hover': {
            transform: 'translateY(-2px)',
          },
        },
        containedPrimary: {
          backgroundColor: '#2C2C2C', // Deep charcoal from New York Business theme
          color: 'white',
          '&:hover': {
            backgroundColor: '#1A1A1A',
            transform: 'translateY(-2px)',
            boxShadow: '0 4px 15px rgba(44, 44, 44, 0.3)', // Charcoal shadow
          },
        },
        containedSecondary: {
          backgroundColor: '#6B7280', // Medium gray from New York Business theme
          color: 'white',
          '&:hover': {
            backgroundColor: '#4B5563',
            transform: 'translateY(-2px)',
          },
        },
        containedError: {
          backgroundColor: '#991B1B', // Dark red from New York Business theme
          '&:hover': {
            backgroundColor: '#7F1D1D',
            transform: 'translateY(-2px)',
          },
        },
        containedSuccess: {
          backgroundColor: '#065F46', // Dark green from New York Business theme
          '&:hover': {
            backgroundColor: '#064E3B',
            transform: 'translateY(-2px)',
          },
        },
      },
    },
    // Card component customizations - New York Business styling
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: '12px', // Slightly larger radius for modern look
          padding: '2rem',
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)', // --shadow-base from CSS
          transition: 'all 300ms ease-in-out', // --transition-slow from CSS
          '&:hover': {
            transform: 'translateY(-5px)',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)', // --shadow-lg
          },
        },
      },
    },
    // Paper component customizations - matching original containers
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: '10px', // Original border-radius
        },
        elevation1: {
          boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)', // Original elevation
        },
        elevation2: {
          boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)',
        },
        elevation3: {
          boxShadow: '0 8px 32px rgba(31, 38, 135, 0.37)', // Header shadow
        },
      },
    },
    // AppBar component customizations
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#FFFFFF',
          color: '#374151',
          boxShadow:
            '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        },
      },
    },
    // Table component customizations - matching original tables
    MuiTableContainer: {
      styleOverrides: {
        root: {
          backgroundColor: 'white',
          borderRadius: '10px',
          overflow: 'hidden',
          boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)',
        },
      },
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          backgroundColor: '#f8f9ff', // Original table header background
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        head: {
          fontWeight: 600,
          color: '#333',
          backgroundColor: '#f8f9ff',
          padding: '12px 15px',
          position: 'sticky',
          top: 0,
        },
        body: {
          color: '#333',
          padding: '12px 15px',
          borderBottom: '1px solid #eee',
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          '&:hover': {
            backgroundColor: '#f8f9ff !important', // Original hover color
          },
        },
      },
    },
    // TextField component customizations - matching original forms
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: '8px', // --radius-base from CSS
            backgroundColor: 'white',
            fontSize: '0.9rem',
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: '#2C2C2C', // Deep charcoal primary
            },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderColor: '#2C2C2C', // Deep charcoal primary
              boxShadow: '0 0 0 3px rgba(44, 44, 44, 0.1)', // Charcoal focus shadow
            },
          },
          '& .MuiInputLabel-root': {
            fontWeight: 600,
            color: '#374151', // Dark gray text from theme
            fontSize: '0.9rem',
          },
          '& .MuiOutlinedInput-input': {
            padding: '10px 15px', // Original padding
          },
        },
      },
    },
    // Select component
    MuiSelect: {
      styleOverrides: {
        root: {
          borderRadius: '8px', // --radius-base from CSS
          backgroundColor: 'white',
          fontSize: '0.9rem',
          minWidth: '200px',
        },
      },
    },
    // Chip component customizations - matching original badges
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: '20px', // Original badge border-radius
          fontSize: '0.8rem',
          fontWeight: 600,
          textTransform: 'uppercase',
          padding: '4px 12px',
        },
        colorSuccess: {
          backgroundColor: '#d4edda',
          color: '#155724',
        },
        colorWarning: {
          backgroundColor: '#fff3cd',
          color: '#856404',
        },
        colorError: {
          backgroundColor: '#f8d7da',
          color: '#721c24',
        },
        colorDefault: {
          backgroundColor: '#e2e3e5',
          color: '#383d41',
        },
      },
    },
    // Modal component customizations - matching original modal
    MuiModal: {
      styleOverrides: {
        root: {
          backdropFilter: 'blur(5px)',
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: '10px',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
          maxWidth: '600px',
          width: '90%',
          maxHeight: '80vh',
          animation: `${modalSlideIn} 0.3s ease`,
        },
      },
    },
    MuiDialogTitle: {
      styleOverrides: {
        root: {
          padding: '1.5rem 2rem',
          borderBottom: '1px solid #eee',
          fontWeight: 600,
          color: '#333',
        },
      },
    },
    MuiDialogContent: {
      styleOverrides: {
        root: {
          padding: '2rem',
        },
      },
    },
    MuiDialogActions: {
      styleOverrides: {
        root: {
          padding: '1rem 2rem 2rem',
          borderTop: '1px solid #eee',
          gap: '1rem',
          justifyContent: 'flex-end',
        },
      },
    },
    // Container and layout components
    MuiContainer: {
      styleOverrides: {
        root: {
          maxWidth: '1400px !important',
          padding: '20px',
          '@media (max-width: 768px)': {
            padding: '10px',
          },
        },
      },
    },
    // Grid component for dashboard layout
    MuiGrid: {
      styleOverrides: {
        item: {
          '@media (max-width: 768px)': {
            width: '100%',
            maxWidth: '100%',
          },
        },
      },
    },
    // Typography customizations for dashboard headers
    MuiTypography: {
      styleOverrides: {
        h1: {
          '@media (max-width: 768px)': {
            fontSize: '1.4rem',
            textAlign: 'center',
          },
        },
      },
    },
    // FormControl and FormLabel
    MuiFormControl: {
      styleOverrides: {
        root: {
          marginBottom: '1.5rem',
          width: '100%',
        },
      },
    },
    MuiFormLabel: {
      styleOverrides: {
        root: {
          fontWeight: 600,
          color: '#374151', // Dark gray text from theme
          marginBottom: '5px',
        },
      },
    },
    MuiInputLabel: {
      styleOverrides: {
        root: {
          fontWeight: 600,
          color: '#374151', // Dark gray text from theme
          fontSize: '0.9rem',
          '&.Mui-focused': {
            color: '#2C2C2C', // Deep charcoal primary
          },
        },
      },
    },
    // Textarea/MultilineInput
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          '&.MuiOutlinedInput-multiline': {
            '& textarea': {
              minHeight: '80px',
              resize: 'vertical',
            },
          },
        },
      },
    },
    // List components for activities and license items
    MuiList: {
      styleOverrides: {
        root: {
          maxHeight: '300px',
          overflowY: 'auto',
        },
      },
    },
    MuiListItem: {
      styleOverrides: {
        root: {
          padding: '10px 0',
          borderBottom: '1px solid #eee',
          '&:last-child': {
            borderBottom: 'none',
          },
        },
      },
    },
    MuiListItemText: {
      styleOverrides: {
        primary: {
          fontSize: '0.9rem',
        },
        secondary: {
          fontSize: '0.8rem',
          color: '#666',
        },
      },
    },
    // Backdrop for modal
    MuiBackdrop: {
      styleOverrides: {
        root: {
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          backdropFilter: 'blur(5px)',
        },
      },
    },
    // IconButton for close buttons
    MuiIconButton: {
      styleOverrides: {
        root: {
          color: '#999',
          transition: 'color 0.3s ease',
          '&:hover': {
            color: '#333',
            backgroundColor: 'transparent',
          },
        },
      },
    },
    // Divider
    MuiDivider: {
      styleOverrides: {
        root: {
          borderColor: '#eee',
        },
      },
    },
  },
});
