'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import {
  requiresAuthentication,
  isRoleAllowed,
  getRedirectUrl,
  getAccessDeniedMessage,
} from '@/lib/route-protection';
import {
  Alert,
  Box,
  CircularProgress,
  Typography,
  Button,
} from '@mui/material';
import { Warning as WarningIcon, Lock as LockIcon } from '@mui/icons-material';

interface RouteGuardProps {
  children: React.ReactNode;
  path?: string;
}

export function RouteGuard({ children, path }: RouteGuardProps) {
  const { user, isLoading, isAuthenticated } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');

  const currentPath =
    path || (typeof window !== 'undefined' ? window.location.pathname : '/');

  useEffect(() => {
    // Check URL for error messages from middleware
    const error = searchParams.get('error');
    const message = searchParams.get('message');

    if (error === 'access_denied' && message) {
      setErrorMessage(decodeURIComponent(message));
    }
  }, [searchParams]);

  useEffect(() => {
    if (isLoading) {
      setIsAuthorized(null);
      return;
    }

    // Check if route needs authentication
    const needsAuth = requiresAuthentication(currentPath);

    if (!needsAuth) {
      // Public route - allow access
      setIsAuthorized(true);
      return;
    }

    if (!isAuthenticated) {
      // Protected route but user not authenticated - redirect to login
      const redirectUrl = getRedirectUrl(currentPath, false);
      if (redirectUrl && redirectUrl !== currentPath) {
        const loginUrl = `${redirectUrl}?redirect=${encodeURIComponent(currentPath)}`;
        // Store intended destination for better UX
        if (typeof window !== 'undefined') {
          sessionStorage.setItem('intended_destination', currentPath);
        }
        router.replace(loginUrl);
      }
      setIsAuthorized(false);
      return;
    }

    // Check role-based access
    if (user && !isRoleAllowed(currentPath, user.role)) {
      // User doesn't have required role
      const message = getAccessDeniedMessage(currentPath, user.role);
      setErrorMessage(message);
      setIsAuthorized(false);
      return;
    }

    // All checks passed
    setIsAuthorized(true);
    setErrorMessage('');
  }, [isLoading, isAuthenticated, user, currentPath, router]);

  // Loading state
  if (isLoading || isAuthorized === null) {
    return (
      <Box
        display='flex'
        justifyContent='center'
        alignItems='center'
        minHeight='100vh'
        flexDirection='column'
        gap={2}
      >
        <CircularProgress size={40} />
        <Typography variant='body2' color='text.secondary'>
          권한을 확인하는 중...
        </Typography>
      </Box>
    );
  }

  // Access denied - show error message
  if (!isAuthorized && errorMessage) {
    return (
      <Box
        display='flex'
        justifyContent='center'
        alignItems='center'
        minHeight='100vh'
        p={3}
      >
        <Alert
          severity='error'
          icon={<LockIcon />}
          sx={{
            maxWidth: 500,
            width: '100%',
            '& .MuiAlert-message': {
              width: '100%',
            },
          }}
        >
          <Typography variant='h6' gutterBottom>
            접근 권한이 없습니다
          </Typography>
          <Typography variant='body2' paragraph>
            {errorMessage}
          </Typography>
          <Box display='flex' gap={2} mt={2}>
            <Button
              variant='contained'
              onClick={() => router.push('/dashboard')}
              size='small'
            >
              대시보드로 이동
            </Button>
            <Button
              variant='outlined'
              onClick={() => router.back()}
              size='small'
            >
              이전 페이지로
            </Button>
          </Box>
        </Alert>
      </Box>
    );
  }

  // Not authenticated - show login prompt
  if (!isAuthorized && !isAuthenticated) {
    return (
      <Box
        display='flex'
        justifyContent='center'
        alignItems='center'
        minHeight='100vh'
        p={3}
      >
        <Alert
          severity='warning'
          icon={<WarningIcon />}
          sx={{ maxWidth: 500, width: '100%' }}
        >
          <Typography variant='h6' gutterBottom>
            로그인이 필요합니다
          </Typography>
          <Typography variant='body2' paragraph>
            이 페이지에 접근하려면 로그인해야 합니다.
          </Typography>
          <Button
            variant='contained'
            onClick={() => {
              const loginUrl = `/login?redirect=${encodeURIComponent(currentPath)}`;
              router.push(loginUrl);
            }}
            size='small'
          >
            로그인 페이지로 이동
          </Button>
        </Alert>
      </Box>
    );
  }

  // Access granted - render children
  return <>{children}</>;
}
