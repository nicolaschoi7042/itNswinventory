/**
 * User Status and Role Visualization Components
 *
 * Comprehensive visualization components for displaying user statistics,
 * role distribution, status indicators, and interactive charts.
 */

import React from 'react';
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Typography,
  Chip,
  Stack,
  Grid,
  Avatar,
  LinearProgress,
  Tooltip,
  Badge,
  IconButton,
  Divider,
  useTheme,
  alpha,
} from '@mui/material';
import {
  AdminPanelSettings as AdminIcon,
  ManageAccounts as ManagerIcon,
  Person as UserIcon,
  CheckCircle as ActiveIcon,
  Cancel as InactiveIcon,
  Warning as SuspendedIcon,
  Schedule as PendingIcon,
  Lock as LockedIcon,
  Login as LoginIcon,
  PersonOff as NeverLoginIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Info as InfoIcon,
  Group as GroupIcon,
  Security as SecurityIcon,
  Timeline as TimelineIcon,
} from '@mui/icons-material';

import type {
  User,
  UserRole,
  UserStatus,
  UserStatistics,
  UserRoleDistribution,
  UserDepartmentDistribution,
} from '@/types/user';
import {
  USER_ROLE_LABELS,
  USER_STATUS_LABELS,
  ROLE_COLORS,
  STATUS_COLORS,
  AUTH_TYPE_LABELS,
} from '@/constants/user.constants';
import { calculateUserStatistics, isUserLocked } from '@/utils/user.utils';

// ============================================================================
// TYPES AND INTERFACES
// ============================================================================

interface UserStatsCardProps {
  users: User[];
  title?: string;
  showTrends?: boolean;
}

interface RoleDistributionProps {
  users: User[];
  interactive?: boolean;
  onRoleClick?: (role: UserRole) => void;
}

interface StatusDistributionProps {
  users: User[];
  interactive?: boolean;
  onStatusClick?: (status: UserStatus) => void;
}

interface UserOverviewProps {
  users: User[];
  period?: 'today' | 'week' | 'month';
}

interface DepartmentDistributionProps {
  users: User[];
  maxDepartments?: number;
  onDepartmentClick?: (department: string) => void;
}

interface SecurityOverviewProps {
  users: User[];
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Calculate role distribution from users array
 */
function calculateRoleDistribution(users: User[]): UserRoleDistribution[] {
  const total = users.length;
  const roleCounts: Record<UserRole, number> = {
    admin: 0,
    manager: 0,
    user: 0,
  };

  users.forEach(user => {
    roleCounts[user.role]++;
  });

  return Object.entries(roleCounts).map(([role, count]) => ({
    role: role as UserRole,
    count,
    percentage: total > 0 ? (count / total) * 100 : 0,
  }));
}

/**
 * Calculate department distribution from users array
 */
function calculateDepartmentDistribution(
  users: User[]
): UserDepartmentDistribution[] {
  const departmentMap: Record<
    string,
    {
      userCount: number;
      adminCount: number;
      managerCount: number;
      regularUserCount: number;
    }
  > = {};

  users.forEach(user => {
    const dept = user.department || '미지정';
    if (!departmentMap[dept]) {
      departmentMap[dept] = {
        userCount: 0,
        adminCount: 0,
        managerCount: 0,
        regularUserCount: 0,
      };
    }

    departmentMap[dept].userCount++;
    switch (user.role) {
      case 'admin':
        departmentMap[dept].adminCount++;
        break;
      case 'manager':
        departmentMap[dept].managerCount++;
        break;
      case 'user':
        departmentMap[dept].regularUserCount++;
        break;
    }
  });

  return Object.entries(departmentMap)
    .map(([department, counts]) => ({
      department,
      ...counts,
    }))
    .sort((a, b) => b.userCount - a.userCount);
}

// ============================================================================
// STATISTICS CARD COMPONENT
// ============================================================================

export function UserStatsCard({
  users,
  title = '사용자 통계',
  showTrends = false,
}: UserStatsCardProps) {
  const theme = useTheme();
  const stats = calculateUserStatistics(users);

  const statsItems = [
    {
      label: '전체 사용자',
      value: stats.totalUsers,
      icon: <GroupIcon />,
      color: theme.palette.primary.main,
      trend: showTrends ? '+5%' : undefined,
    },
    {
      label: '활성 사용자',
      value: stats.activeUsers,
      icon: <ActiveIcon />,
      color: theme.palette.success.main,
      percentage:
        stats.totalUsers > 0 ? (stats.activeUsers / stats.totalUsers) * 100 : 0,
    },
    {
      label: '관리자',
      value: stats.adminUsers,
      icon: <AdminIcon />,
      color: ROLE_COLORS.admin,
      percentage:
        stats.totalUsers > 0 ? (stats.adminUsers / stats.totalUsers) * 100 : 0,
    },
    {
      label: '잠긴 계정',
      value: stats.lockedUsers,
      icon: <LockedIcon />,
      color: theme.palette.warning.main,
      alert: stats.lockedUsers > 0,
    },
    {
      label: '최근 로그인',
      value: stats.recentLogins,
      icon: <LoginIcon />,
      color: theme.palette.info.main,
      percentage:
        stats.totalUsers > 0
          ? (stats.recentLogins / stats.totalUsers) * 100
          : 0,
    },
    {
      label: '미로그인',
      value: stats.neverLoggedIn,
      icon: <NeverLoginIcon />,
      color: theme.palette.grey[500],
      alert: stats.neverLoggedIn > 0,
    },
  ];

  return (
    <Card>
      <CardHeader
        title={title}
        titleTypographyProps={{ variant: 'h6', fontWeight: 600 }}
        action={
          <Tooltip title='사용자 통계 정보'>
            <IconButton size='small'>
              <InfoIcon />
            </IconButton>
          </Tooltip>
        }
      />
      <CardContent>
        <Grid container spacing={2}>
          {statsItems.map((item, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Box
                sx={{
                  p: 2,
                  border: `1px solid ${theme.palette.divider}`,
                  borderRadius: 2,
                  backgroundColor: item.alert
                    ? alpha(theme.palette.warning.main, 0.05)
                    : alpha(item.color, 0.05),
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                <Stack direction='row' alignItems='center' spacing={2}>
                  <Avatar
                    sx={{
                      bgcolor: alpha(item.color, 0.1),
                      color: item.color,
                      width: 40,
                      height: 40,
                    }}
                  >
                    {item.icon}
                  </Avatar>
                  <Box sx={{ flex: 1 }}>
                    <Typography
                      variant='h4'
                      fontWeight={700}
                      color={item.color}
                    >
                      {item.value.toLocaleString()}
                    </Typography>
                    <Typography variant='body2' color='text.secondary'>
                      {item.label}
                    </Typography>
                    {item.trend && (
                      <Typography
                        variant='caption'
                        color='success.main'
                        sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
                      >
                        <TrendingUpIcon sx={{ fontSize: 12 }} />
                        {item.trend}
                      </Typography>
                    )}
                  </Box>
                </Stack>

                {item.percentage !== undefined && (
                  <Box sx={{ mt: 1 }}>
                    <LinearProgress
                      variant='determinate'
                      value={item.percentage}
                      sx={{
                        height: 4,
                        borderRadius: 2,
                        backgroundColor: alpha(item.color, 0.1),
                        '& .MuiLinearProgress-bar': {
                          backgroundColor: item.color,
                          borderRadius: 2,
                        },
                      }}
                    />
                    <Typography
                      variant='caption'
                      color='text.secondary'
                      sx={{ mt: 0.5 }}
                    >
                      {item.percentage.toFixed(1)}%
                    </Typography>
                  </Box>
                )}
              </Box>
            </Grid>
          ))}
        </Grid>
      </CardContent>
    </Card>
  );
}

// ============================================================================
// ROLE DISTRIBUTION COMPONENT
// ============================================================================

export function RoleDistribution({
  users,
  interactive = false,
  onRoleClick,
}: RoleDistributionProps) {
  const theme = useTheme();
  const roleDistribution = calculateRoleDistribution(users);

  return (
    <Card>
      <CardHeader
        title='역할별 분포'
        titleTypographyProps={{ variant: 'h6', fontWeight: 600 }}
        action={<SecurityIcon color='action' />}
      />
      <CardContent>
        <Stack spacing={2}>
          {roleDistribution.map(item => (
            <Box
              key={item.role}
              sx={{
                p: 2,
                border: `1px solid ${alpha(ROLE_COLORS[item.role], 0.3)}`,
                borderRadius: 2,
                backgroundColor: alpha(ROLE_COLORS[item.role], 0.05),
                cursor: interactive ? 'pointer' : 'default',
                transition: 'all 0.2s ease',
                '&:hover': interactive
                  ? {
                      backgroundColor: alpha(ROLE_COLORS[item.role], 0.1),
                      transform: 'translateY(-1px)',
                      boxShadow: theme.shadows[2],
                    }
                  : {},
              }}
              onClick={() => interactive && onRoleClick?.(item.role)}
            >
              <Stack
                direction='row'
                alignItems='center'
                justifyContent='space-between'
              >
                <Stack direction='row' alignItems='center' spacing={2}>
                  <Avatar
                    sx={{
                      bgcolor: ROLE_COLORS[item.role],
                      width: 32,
                      height: 32,
                    }}
                  >
                    {item.role === 'admin' && (
                      <AdminIcon sx={{ fontSize: 18 }} />
                    )}
                    {item.role === 'manager' && (
                      <ManagerIcon sx={{ fontSize: 18 }} />
                    )}
                    {item.role === 'user' && <UserIcon sx={{ fontSize: 18 }} />}
                  </Avatar>
                  <Box>
                    <Typography variant='body1' fontWeight={500}>
                      {USER_ROLE_LABELS[item.role]}
                    </Typography>
                    <Typography variant='caption' color='text.secondary'>
                      {item.count}명 ({item.percentage.toFixed(1)}%)
                    </Typography>
                  </Box>
                </Stack>

                <Box sx={{ minWidth: 100, textAlign: 'right' }}>
                  <Typography
                    variant='h6'
                    fontWeight={600}
                    color={ROLE_COLORS[item.role]}
                  >
                    {item.count}
                  </Typography>
                  <LinearProgress
                    variant='determinate'
                    value={item.percentage}
                    sx={{
                      width: 80,
                      height: 6,
                      borderRadius: 3,
                      backgroundColor: alpha(ROLE_COLORS[item.role], 0.2),
                      '& .MuiLinearProgress-bar': {
                        backgroundColor: ROLE_COLORS[item.role],
                        borderRadius: 3,
                      },
                    }}
                  />
                </Box>
              </Stack>
            </Box>
          ))}
        </Stack>
      </CardContent>
    </Card>
  );
}

// ============================================================================
// STATUS DISTRIBUTION COMPONENT
// ============================================================================

export function StatusDistribution({
  users,
  interactive = false,
  onStatusClick,
}: StatusDistributionProps) {
  const theme = useTheme();
  const stats = calculateUserStatistics(users);

  const statusItems = [
    {
      status: 'active' as UserStatus,
      count: stats.activeUsers,
      icon: <ActiveIcon />,
      color: STATUS_COLORS.active,
    },
    {
      status: 'inactive' as UserStatus,
      count: stats.inactiveUsers,
      icon: <InactiveIcon />,
      color: STATUS_COLORS.inactive,
    },
    {
      status: 'suspended' as UserStatus,
      count: stats.suspendedUsers,
      icon: <SuspendedIcon />,
      color: STATUS_COLORS.suspended,
    },
  ];

  const total = users.length;

  return (
    <Card>
      <CardHeader
        title='상태별 분포'
        titleTypographyProps={{ variant: 'h6', fontWeight: 600 }}
        action={<TimelineIcon color='action' />}
      />
      <CardContent>
        <Stack spacing={2}>
          {statusItems.map(item => {
            const percentage = total > 0 ? (item.count / total) * 100 : 0;

            return (
              <Box
                key={item.status}
                sx={{
                  p: 2,
                  border: `1px solid ${alpha(item.color, 0.3)}`,
                  borderRadius: 2,
                  backgroundColor: alpha(item.color, 0.05),
                  cursor: interactive ? 'pointer' : 'default',
                  transition: 'all 0.2s ease',
                  '&:hover': interactive
                    ? {
                        backgroundColor: alpha(item.color, 0.1),
                        transform: 'translateY(-1px)',
                        boxShadow: theme.shadows[2],
                      }
                    : {},
                }}
                onClick={() => interactive && onStatusClick?.(item.status)}
              >
                <Stack
                  direction='row'
                  alignItems='center'
                  justifyContent='space-between'
                >
                  <Stack direction='row' alignItems='center' spacing={2}>
                    <Avatar
                      sx={{
                        bgcolor: item.color,
                        width: 32,
                        height: 32,
                      }}
                    >
                      {item.icon}
                    </Avatar>
                    <Box>
                      <Typography variant='body1' fontWeight={500}>
                        {USER_STATUS_LABELS[item.status]}
                      </Typography>
                      <Typography variant='caption' color='text.secondary'>
                        {item.count}명 ({percentage.toFixed(1)}%)
                      </Typography>
                    </Box>
                  </Stack>

                  <Box sx={{ minWidth: 100, textAlign: 'right' }}>
                    <Typography
                      variant='h6'
                      fontWeight={600}
                      color={item.color}
                    >
                      {item.count}
                    </Typography>
                    <LinearProgress
                      variant='determinate'
                      value={percentage}
                      sx={{
                        width: 80,
                        height: 6,
                        borderRadius: 3,
                        backgroundColor: alpha(item.color, 0.2),
                        '& .MuiLinearProgress-bar': {
                          backgroundColor: item.color,
                          borderRadius: 3,
                        },
                      }}
                    />
                  </Box>
                </Stack>
              </Box>
            );
          })}

          {/* Special indicators */}
          <Divider />

          <Box sx={{ p: 1 }}>
            <Stack direction='row' spacing={2} justifyContent='space-around'>
              <Tooltip title='잠긴 계정'>
                <Chip
                  icon={<LockedIcon />}
                  label={`잠김: ${stats.lockedUsers}`}
                  size='small'
                  color={stats.lockedUsers > 0 ? 'warning' : 'default'}
                  variant={stats.lockedUsers > 0 ? 'filled' : 'outlined'}
                />
              </Tooltip>

              <Tooltip title='최근 30일 내 로그인'>
                <Chip
                  icon={<LoginIcon />}
                  label={`활성: ${stats.recentLogins}`}
                  size='small'
                  color='info'
                  variant='outlined'
                />
              </Tooltip>

              <Tooltip title='한 번도 로그인하지 않음'>
                <Chip
                  icon={<NeverLoginIcon />}
                  label={`미로그인: ${stats.neverLoggedIn}`}
                  size='small'
                  color={stats.neverLoggedIn > 0 ? 'warning' : 'default'}
                  variant='outlined'
                />
              </Tooltip>
            </Stack>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}

// ============================================================================
// DEPARTMENT DISTRIBUTION COMPONENT
// ============================================================================

export function DepartmentDistribution({
  users,
  maxDepartments = 8,
  onDepartmentClick,
}: DepartmentDistributionProps) {
  const theme = useTheme();
  const departmentDistribution = calculateDepartmentDistribution(users);
  const topDepartments = departmentDistribution.slice(0, maxDepartments);

  return (
    <Card>
      <CardHeader
        title='부서별 분포'
        titleTypographyProps={{ variant: 'h6', fontWeight: 600 }}
        subheader={`상위 ${maxDepartments}개 부서`}
      />
      <CardContent>
        <Stack spacing={1.5}>
          {topDepartments.map((dept, index) => {
            const percentage =
              users.length > 0 ? (dept.userCount / users.length) * 100 : 0;

            return (
              <Box
                key={dept.department}
                sx={{
                  p: 1.5,
                  border: `1px solid ${theme.palette.divider}`,
                  borderRadius: 1,
                  cursor: onDepartmentClick ? 'pointer' : 'default',
                  '&:hover': onDepartmentClick
                    ? {
                        backgroundColor: alpha(
                          theme.palette.primary.main,
                          0.04
                        ),
                      }
                    : {},
                }}
                onClick={() => onDepartmentClick?.(dept.department)}
              >
                <Stack
                  direction='row'
                  alignItems='center'
                  justifyContent='space-between'
                >
                  <Box sx={{ flex: 1 }}>
                    <Typography variant='body2' fontWeight={500}>
                      {dept.department}
                    </Typography>
                    <Stack direction='row' spacing={1} sx={{ mt: 0.5 }}>
                      <Chip
                        label={`관리자: ${dept.adminCount}`}
                        size='small'
                        variant='outlined'
                        sx={{ fontSize: '0.75rem', height: 20 }}
                      />
                      <Chip
                        label={`매니저: ${dept.managerCount}`}
                        size='small'
                        variant='outlined'
                        sx={{ fontSize: '0.75rem', height: 20 }}
                      />
                      <Chip
                        label={`사용자: ${dept.regularUserCount}`}
                        size='small'
                        variant='outlined'
                        sx={{ fontSize: '0.75rem', height: 20 }}
                      />
                    </Stack>
                  </Box>

                  <Box sx={{ minWidth: 80, textAlign: 'right' }}>
                    <Typography variant='h6' fontWeight={600}>
                      {dept.userCount}
                    </Typography>
                    <Typography variant='caption' color='text.secondary'>
                      {percentage.toFixed(1)}%
                    </Typography>
                  </Box>
                </Stack>

                <LinearProgress
                  variant='determinate'
                  value={percentage}
                  sx={{
                    mt: 1,
                    height: 4,
                    borderRadius: 2,
                    backgroundColor: alpha(theme.palette.primary.main, 0.1),
                    '& .MuiLinearProgress-bar': {
                      backgroundColor: theme.palette.primary.main,
                      borderRadius: 2,
                    },
                  }}
                />
              </Box>
            );
          })}
        </Stack>
      </CardContent>
    </Card>
  );
}

// ============================================================================
// USER OVERVIEW COMPONENT
// ============================================================================

export function UserOverview({ users, period = 'month' }: UserOverviewProps) {
  const theme = useTheme();
  const stats = calculateUserStatistics(users);
  const roleDistribution = calculateRoleDistribution(users);

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <UserStatsCard users={users} showTrends />
      </Grid>

      <Grid item xs={12} md={6}>
        <RoleDistribution users={users} interactive />
      </Grid>

      <Grid item xs={12} md={6}>
        <StatusDistribution users={users} interactive />
      </Grid>

      <Grid item xs={12}>
        <DepartmentDistribution users={users} />
      </Grid>
    </Grid>
  );
}

// ============================================================================
// EXPORTS
// ============================================================================

export default {
  UserStatsCard,
  RoleDistribution,
  StatusDistribution,
  DepartmentDistribution,
  UserOverview,
};
