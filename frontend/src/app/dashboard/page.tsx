'use client';

// Dashboard page for IT Asset & Software Inventory Management System
// Main landing page after successful authentication

import React from 'react';
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  Divider,
} from '@mui/material';
import {
  Laptop as LaptopIcon,
  Apps as SoftwareIcon,
  People as PeopleIcon,
  Assignment as AssignmentIcon,
  PersonAdd as PersonAddIcon,
  Settings as SettingsIcon,
} from '@mui/icons-material';
import { useAuth, withAuth } from '@/contexts/AuthContext';
import { MainLayout } from '@/components/layout';

// Dashboard card component
interface DashboardCardProps {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  color: string;
  onClick?: () => void;
}

function DashboardCard({
  title,
  subtitle,
  icon,
  color,
  onClick,
}: DashboardCardProps) {
  return (
    <Card
      sx={{
        cursor: onClick ? 'pointer' : 'default',
        transition: 'all 0.3s ease',
        '&:hover': onClick
          ? {
              transform: 'translateY(-5px)',
              boxShadow: '0 8px 32px rgba(31, 38, 135, 0.37)',
            }
          : {},
      }}
      onClick={onClick}
    >
      <CardContent sx={{ p: 3 }}>
        <Box display='flex' alignItems='center' mb={2}>
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: '12px',
              backgroundColor: color,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mr: 2,
            }}
          >
            {icon}
          </Box>
          <Box flex={1}>
            <Typography variant='h6' color='text.primary' gutterBottom>
              {title}
            </Typography>
            <Typography variant='body2' color='text.secondary'>
              {subtitle}
            </Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}

function DashboardPage() {
  const { user, canManageUsers, isAdmin, isManager } = useAuth();

  // Navigation handlers
  const handleNavigateToEmployees = () => {
    window.location.href = '/employees';
  };

  const handleNavigateToHardware = () => {
    window.location.href = '/hardware';
  };

  const handleNavigateToSoftware = () => {
    window.location.href = '/software';
  };

  const handleNavigateToAssignments = () => {
    window.location.href = '/assignments';
  };

  const handleNavigateToUsers = () => {
    window.location.href = '/users';
  };

  return (
    <MainLayout>
      <Container maxWidth='xl' sx={{ py: 4 }}>
        {/* Header */}
        <Box mb={4}>
          <Typography variant='h4' component='h1' gutterBottom>
            IT 자산 및 SW 인벤토리 관리시스템
          </Typography>
          <Typography variant='body1' color='text.secondary'>
            안녕하세요, <strong>{user?.full_name || user?.username}</strong>님!
            시스템에 오신 것을 환영합니다.
          </Typography>

          {/* User Role Badge */}
          <Box mt={2}>
            <Chip
              label={`역할: ${user?.role === 'admin' ? '관리자' : user?.role === 'manager' ? '매니저' : '사용자'}`}
              color={isAdmin ? 'error' : isManager ? 'warning' : 'default'}
              variant='outlined'
            />
          </Box>

          <Divider sx={{ mt: 3 }} />
        </Box>

        {/* Main Navigation Cards */}
        <Grid container spacing={3}>
          {/* Employee Management */}
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <DashboardCard
              title='직원 관리'
              subtitle='직원 정보 조회 및 관리'
              icon={<PeopleIcon sx={{ color: 'white', fontSize: 24 }} />}
              color='#4CAF50'
              onClick={handleNavigateToEmployees}
            />
          </Grid>

          {/* Hardware Assets */}
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <DashboardCard
              title='하드웨어 자산'
              subtitle='IT 하드웨어 인벤토리 관리'
              icon={<LaptopIcon sx={{ color: 'white', fontSize: 24 }} />}
              color='#2196F3'
              onClick={handleNavigateToHardware}
            />
          </Grid>

          {/* Software Licenses */}
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <DashboardCard
              title='소프트웨어 라이선스'
              subtitle='소프트웨어 라이선스 관리'
              icon={<SoftwareIcon sx={{ color: 'white', fontSize: 24 }} />}
              color='#FF9800'
              onClick={handleNavigateToSoftware}
            />
          </Grid>

          {/* Asset Assignments */}
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <DashboardCard
              title='자산 할당'
              subtitle='자산 할당 및 반납 관리'
              icon={<AssignmentIcon sx={{ color: 'white', fontSize: 24 }} />}
              color='#9C27B0'
              onClick={handleNavigateToAssignments}
            />
          </Grid>

          {/* User Management - Admin only */}
          {canManageUsers && (
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <DashboardCard
                title='사용자 관리'
                subtitle='시스템 사용자 계정 관리'
                icon={<PersonAddIcon sx={{ color: 'white', fontSize: 24 }} />}
                color='#F44336'
                onClick={handleNavigateToUsers}
              />
            </Grid>
          )}

          {/* System Settings - Admin only */}
          {isAdmin && (
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <DashboardCard
                title='시스템 설정'
                subtitle='시스템 환경설정 및 관리'
                icon={<SettingsIcon sx={{ color: 'white', fontSize: 24 }} />}
                color='#607D8B'
                onClick={() => {
                  // TODO: Implement settings page
                  console.log('Settings page not yet implemented');
                }}
              />
            </Grid>
          )}
        </Grid>

        {/* System Information */}
        <Box mt={6}>
          <Card>
            <CardContent sx={{ p: 3 }}>
              <Typography variant='h6' gutterBottom>
                시스템 정보
              </Typography>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                  <Typography variant='body2' color='text.secondary'>
                    버전
                  </Typography>
                  <Typography variant='body1' fontWeight='bold'>
                    v2.0 (Next.js)
                  </Typography>
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                  <Typography variant='body2' color='text.secondary'>
                    사용자 역할
                  </Typography>
                  <Typography variant='body1' fontWeight='bold'>
                    {user?.role === 'admin'
                      ? '관리자'
                      : user?.role === 'manager'
                        ? '매니저'
                        : '사용자'}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                  <Typography variant='body2' color='text.secondary'>
                    마지막 로그인
                  </Typography>
                  <Typography variant='body1' fontWeight='bold'>
                    알 수 없음
                  </Typography>
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                  <Typography variant='body2' color='text.secondary'>
                    부서
                  </Typography>
                  <Typography variant='body1' fontWeight='bold'>
                    IT부
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Box>
      </Container>
    </MainLayout>
  );
}

// Export with authentication protection
export default withAuth(DashboardPage);
