/**
 * Theme utilities and constants for New York Business theme
 */

// Color constants matching the original system
export const colors = {
  // Primary gradient colors
  primary: {
    start: '#667eea',
    end: '#764ba2',
    gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  },
  
  // Success gradient for green elements
  success: {
    start: '#28a745',
    end: '#20c997',
    gradient: 'linear-gradient(135deg, #28a745 0%, #20c997 100%)',
  },
  
  // Background gradients
  background: {
    light: 'linear-gradient(135deg, #f8f9ff 0%, #e8f0ff 100%)',
    header: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  },
  
  // Status badge colors
  status: {
    available: {
      background: '#d4edda',
      color: '#155724',
    },
    assigned: {
      background: '#fff3cd', 
      color: '#856404',
    },
    maintenance: {
      background: '#f8d7da',
      color: '#721c24',
    },
    retired: {
      background: '#e2e3e5',
      color: '#383d41',
    },
  },
};

// Spacing constants
export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

// Border radius constants
export const borderRadius = {
  sm: 5,
  md: 8,
  lg: 10,
  xl: 20,
};

// Shadow constants matching original system
export const shadows = {
  card: '0 4px 15px rgba(0, 0, 0, 0.1)',
  hover: '0 4px 15px rgba(102, 126, 234, 0.4)',
  modal: '0 20px 60px rgba(0, 0, 0, 0.3)',
  header: '0 8px 32px rgba(31, 38, 135, 0.37)',
};

// Animation durations
export const animations = {
  fast: '0.15s',
  normal: '0.3s',
  slow: '0.5s',
};

// Typography weights
export const fontWeights = {
  light: 300,
  normal: 400,
  medium: 500,
  semiBold: 600,
  bold: 700,
};

// Breakpoint values
export const breakpoints = {
  xs: 0,
  sm: 600,
  md: 768,
  lg: 1024,
  xl: 1400,
};

// Z-index values
export const zIndex = {
  header: 1100,
  modal: 1300,
  tooltip: 1500,
};

// Helper functions
export const getStatusColor = (status: string) => {
  switch (status?.toLowerCase()) {
    case 'available':
    case '사용가능':
      return colors.status.available;
    case 'assigned':
    case '사용중':
      return colors.status.assigned;
    case 'maintenance':
    case '수리중':
      return colors.status.maintenance;
    case 'retired':
    case '폐기':
      return colors.status.retired;
    default:
      return colors.status.available;
  }
};

// Role-based color helpers
export const getRoleColor = (role: string) => {
  switch (role?.toLowerCase()) {
    case 'admin':
    case '관리자':
      return colors.primary.gradient;
    case 'manager':
    case '매니저':
      return colors.success.gradient;
    case 'user':
    case '사용자':
    default:
      return '#6c757d';
  }
};