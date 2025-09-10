'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { NavigationLayout, navigationHelpers } from '@/components/navigation';
import type { User } from '@/components/navigation';
import { Box, CircularProgress, Typography } from '@mui/material';

// Map Next.js routes to navigation tabs
const routeToTabMapping = {
  '/dashboard': 'dashboard',
  '/employees': 'employees',
  '/hardware': 'hardware',
  '/software': 'software',
  '/assignments': 'assignment',
  '/users': 'admin',
  '/admin': 'admin',
};

interface MainLayoutProps {
  children: React.ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  const { user, isLoading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [currentTab, setCurrentTab] = useState('dashboard');

  // Update current tab based on pathname
  useEffect(() => {
    const tabFromPath =
      routeToTabMapping[pathname as keyof typeof routeToTabMapping];
    if (tabFromPath) {
      setCurrentTab(tabFromPath);
    }
  }, [pathname]);

  // Handle tab navigation
  const handleTabChange = (tab: string) => {
    setCurrentTab(tab);

    // Map tab to route
    const tabToRouteMapping = {
      dashboard: '/dashboard',
      employees: '/employees',
      hardware: '/hardware',
      software: '/software',
      assignment: '/assignments',
      admin: '/users',
    };

    const route = tabToRouteMapping[tab as keyof typeof tabToRouteMapping];
    if (route && route !== pathname) {
      router.push(route);
    }
  };

  // Handle logout
  const handleLogout = async () => {
    try {
      await logout();
      router.push('/login');
    } catch (error) {
      console.error('Logout failed:', error);
      // Force redirect to login even if logout fails
      router.push('/login');
    }
  };

  // Handle user profile
  const handleUserProfile = () => {
    // TODO: Implement user profile modal or page
    console.log('User profile clicked');
  };

  // Handle settings
  const handleSettings = () => {
    // TODO: Implement settings modal or page
    console.log('Settings clicked');
  };

  // Handle breadcrumb navigation
  const handleBreadcrumbClick = (item: {
    id: string;
    label: string;
    path?: string;
  }) => {
    if (item.path) {
      router.push(item.path);
    }
  };

  // Handle refresh
  const handleRefresh = () => {
    window.location.reload();
  };

  // Show loading state while auth is loading
  if (isLoading) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          gap: 2,
        }}
      >
        <CircularProgress size={48} thickness={4} />
        <Typography variant='body2' color='text.secondary'>
          인증 확인 중...
        </Typography>
      </Box>
    );
  }

  // Show error if no user
  if (!user) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          gap: 2,
        }}
      >
        <Typography variant='h6' color='error'>
          인증 정보를 찾을 수 없습니다.
        </Typography>
        <Typography variant='body2' color='text.secondary'>
          다시 로그인해주세요.
        </Typography>
      </Box>
    );
  }

  // Get breadcrumb for current route
  const breadcrumb = navigationHelpers.getBreadcrumbForRoute(pathname);

  // Get header stats (mock data for now)
  const stats = {
    totalEmployees: 0, // Will be implemented with real data
    totalHardware: 0,
    totalSoftware: 0,
    totalAssignments: 0,
  };

  return (
    <NavigationLayout
      user={
        {
          id: user.id,
          name: user.full_name || user.username,
          email: user.email || `${user.username}@company.com`,
          role: user.role,
          avatar: undefined, // No avatar implementation yet
          department: undefined, // user.department not available yet
          isActive: true,
        } as User
      }
      stats={stats}
      currentTab={currentTab}
      currentRoute={pathname}
      breadcrumb={breadcrumb}
      onTabChange={handleTabChange}
      onLogout={handleLogout}
      onUserProfile={handleUserProfile}
      onSettings={handleSettings}
      onBreadcrumbClick={handleBreadcrumbClick}
      onRefresh={handleRefresh}
      showBreadcrumb={pathname !== '/dashboard'} // Hide breadcrumb on dashboard
    >
      {children}
    </NavigationLayout>
  );
}
