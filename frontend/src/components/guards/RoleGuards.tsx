'use client';

import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Alert, Box, Button, Typography } from '@mui/material';
import { AdminPanelSettings as AdminIcon, Person as PersonIcon } from '@mui/icons-material';
import { useRouter } from 'next/navigation';

interface RoleGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * Admin-only access guard
 * Only allows users with 'admin' role
 */
export function AdminOnlyGuard({ children, fallback }: RoleGuardProps) {
  const { user, isAdmin } = useAuth();
  const router = useRouter();

  if (!user) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <Alert severity="warning">
          <Typography>로그인이 필요합니다.</Typography>
        </Alert>
      </Box>
    );
  }

  if (!isAdmin) {
    if (fallback) {
      return <>{fallback}</>;
    }

    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px" p={3}>
        <Alert 
          severity="error" 
          icon={<AdminIcon />}
          sx={{ maxWidth: 400 }}
        >
          <Typography variant="h6" gutterBottom>
            관리자 권한 필요
          </Typography>
          <Typography variant="body2" paragraph>
            이 기능은 관리자만 사용할 수 있습니다.
          </Typography>
          <Button 
            variant="outlined" 
            size="small"
            onClick={() => router.push('/dashboard')}
          >
            대시보드로 이동
          </Button>
        </Alert>
      </Box>
    );
  }

  return <>{children}</>;
}

/**
 * Manager-level access guard  
 * Allows users with 'admin' or 'manager' role
 */
export function ManagerGuard({ children, fallback }: RoleGuardProps) {
  const { user, isAdmin, isManager } = useAuth();
  const router = useRouter();

  if (!user) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <Alert severity="warning">
          <Typography>로그인이 필요합니다.</Typography>
        </Alert>
      </Box>
    );
  }

  const hasManagerAccess = isAdmin || isManager;

  if (!hasManagerAccess) {
    if (fallback) {
      return <>{fallback}</>;
    }

    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px" p={3}>
        <Alert 
          severity="error" 
          icon={<PersonIcon />}
          sx={{ maxWidth: 400 }}
        >
          <Typography variant="h6" gutterBottom>
            매니저 권한 필요
          </Typography>
          <Typography variant="body2" paragraph>
            이 기능은 관리자 또는 매니저만 사용할 수 있습니다.
          </Typography>
          <Button 
            variant="outlined" 
            size="small"
            onClick={() => router.push('/dashboard')}
          >
            대시보드로 이동
          </Button>
        </Alert>
      </Box>
    );
  }

  return <>{children}</>;
}

/**
 * HOC for components that require admin access
 */
export function withAdminGuard<P extends object>(
  Component: React.ComponentType<P>,
  fallbackComponent?: React.ComponentType<P>
) {
  return function AdminGuardedComponent(props: P) {
    return (
      <AdminOnlyGuard fallback={fallbackComponent ? React.createElement(fallbackComponent, props) : undefined}>
        <Component {...props} />
      </AdminOnlyGuard>
    );
  };
}

/**
 * HOC for components that require manager access
 */
export function withManagerGuard<P extends object>(
  Component: React.ComponentType<P>,
  fallbackComponent?: React.ComponentType<P>
) {
  return function ManagerGuardedComponent(props: P) {
    return (
      <ManagerGuard fallback={fallbackComponent ? React.createElement(fallbackComponent, props) : undefined}>
        <Component {...props} />
      </ManagerGuard>
    );
  };
}

/**
 * Component for conditionally rendering based on user role
 */
interface ConditionalRenderProps {
  adminOnly?: React.ReactNode;
  managerOnly?: React.ReactNode;
  userOnly?: React.ReactNode;
  authenticated?: React.ReactNode;
  unauthenticated?: React.ReactNode;
  children?: React.ReactNode;
}

export function ConditionalRender({
  adminOnly,
  managerOnly, 
  userOnly,
  authenticated,
  unauthenticated,
  children
}: ConditionalRenderProps) {
  const { user, isAdmin, isManager, isAuthenticated } = useAuth();

  // Not authenticated
  if (!isAuthenticated) {
    return <>{unauthenticated}</>;
  }

  // Admin role
  if (isAdmin && adminOnly) {
    return <>{adminOnly}</>;
  }

  // Manager role (but not admin)
  if (isManager && !isAdmin && managerOnly) {
    return <>{managerOnly}</>;
  }

  // Regular user role
  if (user?.role === 'user' && userOnly) {
    return <>{userOnly}</>;
  }

  // Authenticated users
  if (authenticated) {
    return <>{authenticated}</>;
  }

  // Default fallback
  return <>{children}</>;
}

/**
 * Button component that shows/hides based on user role
 */
interface RoleBasedButtonProps {
  adminOnly?: boolean;
  managerOnly?: boolean;
  onClick: () => void;
  children: React.ReactNode;
  [key: string]: any; // Allow other button props
}

export function RoleBasedButton({ 
  adminOnly, 
  managerOnly, 
  onClick, 
  children, 
  ...buttonProps 
}: RoleBasedButtonProps) {
  const { isAdmin, isManager } = useAuth();

  // Check permissions
  if (adminOnly && !isAdmin) return null;
  if (managerOnly && !isManager && !isAdmin) return null;

  return (
    <Button onClick={onClick} {...buttonProps}>
      {children}
    </Button>
  );
}