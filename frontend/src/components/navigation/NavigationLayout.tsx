import { Box, useTheme, useMediaQuery } from '@mui/material';
import { ReactNode } from 'react';
import { Header, HeaderStats } from './Header';
import { ResponsiveNavigation } from './NavigationTabs';
import { Breadcrumb, BreadcrumbItem } from './Breadcrumb';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'user';
  avatar?: string;
  department?: string;
  isActive: boolean;
}

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