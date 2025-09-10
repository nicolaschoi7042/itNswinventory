// Material-UI theme type extensions

import '@mui/material/styles';

declare module '@mui/material/styles' {
  interface BreakpointOverrides {
    xs: true;
    sm: true;
    md: true;
    lg: true;
    xl: true;
    // Add custom breakpoints if needed
    mobile: false; // disable the mobile breakpoint
    tablet: false; // disable the tablet breakpoint
    laptop: false; // disable the laptop breakpoint
    desktop: false; // disable the desktop breakpoint
  }

  // Custom theme properties (if needed in future)
  interface Theme {
    custom?: {
      headerHeight: string;
      sidebarWidth: string;
      animations: {
        slideIn: string;
        fadeIn: string;
      };
    };
  }

  interface ThemeOptions {
    custom?: {
      headerHeight?: string;
      sidebarWidth?: string;
      animations?: {
        slideIn?: string;
        fadeIn?: string;
      };
    };
  }

  // Extend color palette if needed
  interface Palette {
    tertiary?: PaletteColorOptions;
  }

  interface PaletteOptions {
    tertiary?: PaletteColorOptions;
  }

  interface PaletteColor {
    lighter?: string;
    darker?: string;
  }

  interface SimplePaletteColorOptions {
    lighter?: string;
    darker?: string;
  }
}
