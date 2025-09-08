// Navigation Components
export { Header, CompactHeader, SimpleHeader, useHeaderState } from './Header';
export type { HeaderProps, User, HeaderStats } from './Header';

export {
  NavigationTabs,
  ResponsiveNavigation,
  useNavigationState,
  defaultTabs,
  navigationUtils,
} from './NavigationTabs';
export type { NavigationTab, NavigationTabsProps } from './NavigationTabs';

export {
  UserMenu,
  CompactUserMenu,
  UserMenuButton,
  UserMenuPopover,
  useUserMenuState,
  userMenuUtils,
} from './UserMenu';
export type { UserMenuProps, UserMenuAction } from './UserMenu';

export {
  Breadcrumb,
  CompactBreadcrumb,
  OutlinedBreadcrumb,
  SimpleBreadcrumb,
  useBreadcrumbState,
  breadcrumbUtils,
} from './Breadcrumb';
export type { BreadcrumbProps, BreadcrumbItem } from './Breadcrumb';

// Navigation layouts and configurations
export const navigationConfig = {
  // Header configurations
  header: {
    height: {
      default: 64,
      compact: 56,
      simple: 48,
    },
    elevation: {
      default: 1,
      raised: 4,
      flat: 0,
    },
  },

  // Navigation tabs configurations
  tabs: {
    height: {
      default: 48,
      dense: 40,
    },
    roles: {
      admin: ['dashboard', 'employees', 'hardware', 'software', 'assignment', 'admin'],
      manager: ['dashboard', 'employees', 'hardware', 'software', 'assignment'],
      user: ['dashboard', 'hardware', 'software', 'assignment'],
    },
  },

  // Breadcrumb configurations
  breadcrumb: {
    maxItems: 8,
    separator: '>',
    showHome: true,
    homeLabel: '홈',
  },

  // User menu configurations
  userMenu: {
    minWidth: 280,
    maxWidth: 320,
    placement: 'bottom-end' as const,
  },
};

// Navigation route mappings
export const routeConfig = {
  // Main routes
  dashboard: {
    path: '/dashboard',
    label: '대시보드',
    breadcrumb: [{ id: 'dashboard', label: '대시보드' }],
  },
  employees: {
    path: '/employees',
    label: '임직원 관리',
    breadcrumb: [{ id: 'employees', label: '임직원 관리' }],
    roles: ['admin', 'manager'],
  },
  hardware: {
    path: '/hardware',
    label: '하드웨어 자산',
    breadcrumb: [{ id: 'hardware', label: '하드웨어 자산' }],
  },
  software: {
    path: '/software',
    label: '소프트웨어',
    breadcrumb: [{ id: 'software', label: '소프트웨어' }],
  },
  assignment: {
    path: '/assignments',
    label: '자산 할당',
    breadcrumb: [{ id: 'assignment', label: '자산 할당' }],
  },
  admin: {
    path: '/admin',
    label: '사용자 관리',
    breadcrumb: [{ id: 'admin', label: '사용자 관리' }],
    roles: ['admin'],
  },

  // Sub-routes
  employeeDetail: {
    path: '/employees/:id',
    label: '임직원 상세',
    breadcrumb: [
      { id: 'employees', label: '임직원 관리', path: '/employees' },
      { id: 'employee-detail', label: '상세 정보' },
    ],
  },
  hardwareDetail: {
    path: '/hardware/:id',
    label: '하드웨어 상세',
    breadcrumb: [
      { id: 'hardware', label: '하드웨어 자산', path: '/hardware' },
      { id: 'hardware-detail', label: '상세 정보' },
    ],
  },
  softwareDetail: {
    path: '/software/:id',
    label: '소프트웨어 상세',
    breadcrumb: [
      { id: 'software', label: '소프트웨어', path: '/software' },
      { id: 'software-detail', label: '상세 정보' },
    ],
  },
};

// Navigation utility functions
export const navigationHelpers = {
  // Get user accessible routes
  getUserRoutes: (role: 'admin' | 'manager' | 'user'): string[] => {
    return Object.entries(routeConfig)
      .filter(([_, config]) => !config.roles || config.roles.includes(role))
      .map(([_, config]) => config.path);
  },

  // Check if user can access route
  canAccessRoute: (route: string, role: 'admin' | 'manager' | 'user'): boolean => {
    const config = Object.values(routeConfig).find(r => r.path === route);
    if (!config) return false;
    if (!config.roles) return true;
    return config.roles.includes(role);
  },

  // Get breadcrumb for route
  getBreadcrumbForRoute: (route: string): BreadcrumbItem[] => {
    const config = Object.values(routeConfig).find(r => r.path === route);
    return config?.breadcrumb || [];
  },

  // Get route label
  getRouteLabel: (route: string): string => {
    const config = Object.values(routeConfig).find(r => r.path === route);
    return config?.label || route;
  },

  // Build navigation state from current route
  getNavigationStateFromRoute: (currentRoute: string, role: 'admin' | 'manager' | 'user') => {
    const config = Object.values(routeConfig).find(r => r.path === currentRoute);
    const currentTab = Object.keys(routeConfig).find(key => routeConfig[key as keyof typeof routeConfig].path === currentRoute) || 'dashboard';
    const breadcrumb = config?.breadcrumb || [];

    return {
      currentTab,
      breadcrumb,
      canAccess: navigationHelpers.canAccessRoute(currentRoute, role),
    };
  },

  // Get parent route
  getParentRoute: (route: string): string | null => {
    const segments = route.split('/').filter(Boolean);
    if (segments.length <= 1) return '/dashboard';
    
    segments.pop();
    return '/' + segments.join('/');
  },

  // Check if route is active
  isRouteActive: (currentRoute: string, targetRoute: string, exact: boolean = false): boolean => {
    if (exact) {
      return currentRoute === targetRoute;
    }
    return currentRoute.startsWith(targetRoute);
  },

  // Generate navigation items for role
  getNavigationItemsForRole: (role: 'admin' | 'manager' | 'user'): NavigationTab[] => {
    return defaultTabs.filter(tab => 
      !tab.roles || tab.roles.length === 0 || tab.roles.includes(role)
    );
  },
};

// Navigation context helpers
export const createNavigationContext = () => {
  return {
    // Current navigation state
    currentRoute: '/',
    currentTab: 'dashboard',
    breadcrumb: [] as BreadcrumbItem[],
    
    // User info
    user: null as User | null,
    userRole: 'user' as 'admin' | 'manager' | 'user',
    
    // Navigation handlers
    navigateToRoute: (route: string) => {
      console.log('Navigate to:', route);
    },
    
    setCurrentTab: (tab: string) => {
      console.log('Set tab:', tab);
    },
    
    setBreadcrumb: (items: BreadcrumbItem[]) => {
      console.log('Set breadcrumb:', items);
    },
    
    goBack: () => {
      console.log('Go back');
    },
    
    // Menu handlers
    handleLogout: () => {
      console.log('Logout');
    },
    
    handleUserProfile: () => {
      console.log('User profile');
    },
    
    handleSettings: () => {
      console.log('Settings');
    },
  };
};

// Layout component combining all navigation components
import { Box, useTheme, useMediaQuery } from '@mui/material';
import { ReactNode } from 'react';

interface NavigationLayoutProps {
  user: User;
  stats?: HeaderStats;
  currentTab: string;
  currentRoute: string;
  breadcrumb?: BreadcrumbItem[];
  onTabChange: (tab: string) => void;
  onLogout: () => void;
  onUserProfile?: () => void;
  onSettings?: () => void;
  onBreadcrumbClick?: (item: BreadcrumbItem) => void;
  onRefresh?: () => void;
  showBreadcrumb?: boolean;
  children: ReactNode;
}

export function NavigationLayout({
  user,
  stats,
  currentTab,
  currentRoute,
  breadcrumb = [],
  onTabChange,
  onLogout,
  onUserProfile,
  onSettings,
  onBreadcrumbClick,
  onRefresh,
  showBreadcrumb = true,
  children,
}: NavigationLayoutProps) {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      {/* Header */}
      <Header
        user={user}
        stats={stats}
        onLogout={onLogout}
        onUserProfile={onUserProfile}
        onSettings={onSettings}
        onRefresh={onRefresh}
        showStats={!isSmallScreen}
      />

      {/* Navigation Tabs */}
      <ResponsiveNavigation
        currentTab={currentTab}
        userRole={user.role}
        onChange={onTabChange}
      />

      {/* Breadcrumb */}
      {showBreadcrumb && breadcrumb.length > 0 && (
        <Box sx={{ px: 3, py: 1, borderBottom: 1, borderColor: 'divider' }}>
          <Breadcrumb
            items={breadcrumb}
            onItemClick={onBreadcrumbClick}
            variant={isSmallScreen ? 'compact' : 'default'}
          />
        </Box>
      )}

      {/* Content */}
      <Box sx={{ flex: 1, overflow: 'auto' }}>
        {children}
      </Box>
    </Box>
  );
}

// Compact navigation layout for mobile
export function CompactNavigationLayout(props: NavigationLayoutProps) {
  return (
    <NavigationLayout
      {...props}
      showBreadcrumb={false}
    />
  );
}

import { ReactNode } from 'react';