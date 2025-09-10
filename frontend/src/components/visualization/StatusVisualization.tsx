/**
 * Status Visualization Components
 *
 * Collection of components for visualizing assignment status, progress, and metrics
 * with enhanced visual indicators and animations.
 */

import React from 'react';
import {
  Box,
  Chip,
  Typography,
  LinearProgress,
  CircularProgress,
  Tooltip,
  Card,
  CardContent,
  Grid,
  Avatar,
  useTheme,
  alpha,
} from '@mui/material';
import {
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  Error as ErrorIcon,
  Help as HelpIcon,
  TrendingUp as TrendingUpIcon,
  AccessTime as AccessTimeIcon,
  Assignment as AssignmentIcon,
  Computer as ComputerIcon,
  Apps as AppsIcon,
} from '@mui/icons-material';

// Import assignment types and utilities
import {
  Assignment,
  AssignmentWithDetails,
  AssignmentStatus,
  AssignmentStats,
} from '@/types/assignment';

import {
  getAssignmentStatusInfo,
  formatAssignmentDuration,
  getDurationColor,
} from '@/utils/assignment.utils';

// ============================================================================
// STATUS INDICATOR COMPONENTS
// ============================================================================

interface StatusIndicatorProps {
  status: AssignmentStatus;
  showLabel?: boolean;
  showIcon?: boolean;
  size?: 'small' | 'medium' | 'large';
  variant?: 'default' | 'detailed' | 'minimal';
}

export function StatusIndicator({
  status,
  showLabel = true,
  showIcon = true,
  size = 'small',
  variant = 'default',
}: StatusIndicatorProps) {
  const theme = useTheme();
  const statusInfo = getAssignmentStatusInfo(status);

  // Status icon based on status type
  const getStatusIcon = (status: AssignmentStatus) => {
    const iconSize = size === 'large' ? 20 : size === 'medium' ? 18 : 16;
    switch (status) {
      case '사용중':
        return <CheckCircleIcon sx={{ fontSize: iconSize }} />;
      case '반납완료':
        return <CheckCircleIcon sx={{ fontSize: iconSize }} />;
      case '대기중':
        return <ScheduleIcon sx={{ fontSize: iconSize }} />;
      case '연체':
        return <WarningIcon sx={{ fontSize: iconSize }} />;
      case '분실':
        return <ErrorIcon sx={{ fontSize: iconSize }} />;
      case '손상':
        return <ErrorIcon sx={{ fontSize: iconSize }} />;
      default:
        return <HelpIcon sx={{ fontSize: iconSize }} />;
    }
  };

  if (variant === 'minimal') {
    return (
      <Box
        sx={{
          width: 12,
          height: 12,
          borderRadius: '50%',
          backgroundColor: theme.palette[statusInfo.color].main,
        }}
      />
    );
  }

  if (variant === 'detailed') {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 0.5,
        }}
      >
        <Chip
          icon={showIcon ? getStatusIcon(status) : undefined}
          label={showLabel ? statusInfo.label : ''}
          color={statusInfo.color}
          size={size}
          sx={{
            fontWeight: 'medium',
            '& .MuiChip-icon': {
              fontSize: size === 'large' ? 20 : size === 'medium' ? 18 : 16,
            },
          }}
        />
        {/* Additional status indicator for specific statuses */}
        {status === '연체' && (
          <Typography
            variant='caption'
            color='error.main'
            sx={{ fontSize: '0.65rem' }}
          >
            즉시 반납 필요
          </Typography>
        )}
        {status === '분실' && (
          <Typography
            variant='caption'
            color='warning.main'
            sx={{ fontSize: '0.65rem' }}
          >
            조사 필요
          </Typography>
        )}
        {status === '손상' && (
          <Typography
            variant='caption'
            color='warning.main'
            sx={{ fontSize: '0.65rem' }}
          >
            수리 검토
          </Typography>
        )}
      </Box>
    );
  }

  return (
    <Chip
      icon={showIcon ? getStatusIcon(status) : undefined}
      label={showLabel ? statusInfo.label : ''}
      color={statusInfo.color}
      size={size}
      sx={{
        fontWeight: 'medium',
        '& .MuiChip-icon': {
          fontSize: size === 'large' ? 20 : size === 'medium' ? 18 : 16,
        },
      }}
    />
  );
}

// ============================================================================
// DURATION VISUALIZATION COMPONENT
// ============================================================================

interface DurationVisualizationProps {
  assignment: Assignment | AssignmentWithDetails;
  showProgress?: boolean;
  showCategory?: boolean;
  size?: 'small' | 'medium' | 'large';
}

export function DurationVisualization({
  assignment,
  showProgress = true,
  showCategory = true,
  size = 'small',
}: DurationVisualizationProps) {
  const theme = useTheme();
  const duration = formatAssignmentDuration(assignment);
  const color = getDurationColor(assignment);

  // Calculate days for progress visualization
  const assignedDate = new Date(assignment.assigned_date);
  const currentDate = new Date();
  const daysDiff = Math.floor(
    (currentDate.getTime() - assignedDate.getTime()) / (1000 * 60 * 60 * 24)
  );

  // Duration category for visualization
  const getDurationCategory = (days: number) => {
    if (days <= 30)
      return { label: '단기', progress: (days / 30) * 100, color: 'success' };
    if (days <= 90)
      return {
        label: '중기',
        progress: ((days - 30) / 60) * 100,
        color: 'warning',
      };
    return { label: '장기', progress: 100, color: 'error' };
  };

  const durationCategory = getDurationCategory(daysDiff);

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 0.5,
      }}
    >
      <Chip
        icon={<AccessTimeIcon sx={{ fontSize: size === 'large' ? 18 : 14 }} />}
        label={duration}
        size={size}
        color={color}
        variant='outlined'
        sx={{
          '& .MuiChip-icon': {
            fontSize: size === 'large' ? 18 : 14,
          },
        }}
      />

      {/* Duration visualization bar */}
      {showProgress && assignment.status === '사용중' && (
        <Box
          sx={{
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          {showCategory && (
            <Typography
              variant='caption'
              color='text.secondary'
              sx={{ fontSize: '0.65rem' }}
            >
              {durationCategory.label} 사용
            </Typography>
          )}
          <LinearProgress
            variant='determinate'
            value={Math.min(durationCategory.progress, 100)}
            color={durationCategory.color as any}
            sx={{
              width: '100%',
              height: size === 'large' ? 4 : 2,
              borderRadius: 1,
              mt: 0.25,
            }}
          />
        </Box>
      )}
    </Box>
  );
}

// ============================================================================
// ASSIGNMENT STATS VISUALIZATION
// ============================================================================

interface AssignmentStatsVisualizationProps {
  stats: AssignmentStats;
  variant?: 'cards' | 'compact' | 'detailed';
}

export function AssignmentStatsVisualization({
  stats,
  variant = 'cards',
}: AssignmentStatsVisualizationProps) {
  const theme = useTheme();

  const statsData = [
    {
      label: '총 할당',
      value: stats.total_assignments,
      color: 'primary',
      icon: <AssignmentIcon />,
    },
    {
      label: '사용 중',
      value: stats.active_assignments,
      color: 'success',
      icon: <CheckCircleIcon />,
    },
    {
      label: '반납 완료',
      value: stats.returned_assignments,
      color: 'info',
      icon: <CheckCircleIcon />,
    },
    {
      label: '연체',
      value: stats.overdue_assignments,
      color: 'error',
      icon: <WarningIcon />,
    },
  ];

  if (variant === 'compact') {
    return (
      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        {statsData.map((stat, index) => (
          <Box
            key={index}
            sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
          >
            <Avatar
              sx={{
                width: 32,
                height: 32,
                bgcolor: `${stat.color}.main`,
                fontSize: '0.875rem',
              }}
            >
              {stat.icon}
            </Avatar>
            <Box>
              <Typography variant='h6' component='div'>
                {stat.value}
              </Typography>
              <Typography variant='caption' color='text.secondary'>
                {stat.label}
              </Typography>
            </Box>
          </Box>
        ))}
      </Box>
    );
  }

  if (variant === 'detailed') {
    return (
      <Grid container spacing={2}>
        {statsData.map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card sx={{ height: '100%' }}>
              <CardContent
                sx={{ display: 'flex', alignItems: 'center', gap: 2 }}
              >
                <Avatar
                  sx={{
                    bgcolor: `${stat.color}.main`,
                    width: 48,
                    height: 48,
                  }}
                >
                  {stat.icon}
                </Avatar>
                <Box sx={{ flexGrow: 1 }}>
                  <Typography
                    variant='h4'
                    component='div'
                    color={`${stat.color}.main`}
                  >
                    {stat.value}
                  </Typography>
                  <Typography variant='subtitle1' color='text.secondary'>
                    {stat.label}
                  </Typography>
                  {/* Progress indicator */}
                  <LinearProgress
                    variant='determinate'
                    value={(stat.value / stats.total_assignments) * 100}
                    color={stat.color as any}
                    sx={{ mt: 1, height: 4, borderRadius: 2 }}
                  />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    );
  }

  // Default cards variant
  return (
    <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
      {statsData.map((stat, index) => (
        <Card key={index} sx={{ minWidth: 200, flexGrow: 1 }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              {React.cloneElement(stat.icon, {
                sx: { color: `${stat.color}.main`, fontSize: 20 },
              })}
              <Typography color='text.secondary' variant='body2'>
                {stat.label}
              </Typography>
            </Box>
            <Typography
              variant='h5'
              component='div'
              color={`${stat.color}.main`}
            >
              {stat.value}
            </Typography>
            <Box sx={{ mt: 1 }}>
              <LinearProgress
                variant='determinate'
                value={
                  stats.total_assignments > 0
                    ? (stat.value / stats.total_assignments) * 100
                    : 0
                }
                color={stat.color as any}
                sx={{ height: 4, borderRadius: 2 }}
              />
            </Box>
          </CardContent>
        </Card>
      ))}
    </Box>
  );
}

// ============================================================================
// ASSET TYPE VISUALIZATION
// ============================================================================

interface AssetTypeVisualizationProps {
  assetType: 'hardware' | 'software';
  assetName: string;
  assetId?: string;
  size?: 'small' | 'medium' | 'large';
  showDetails?: boolean;
}

export function AssetTypeVisualization({
  assetType,
  assetName,
  assetId,
  size = 'medium',
  showDetails = true,
}: AssetTypeVisualizationProps) {
  const theme = useTheme();
  const isHardware = assetType === 'hardware';

  const avatarSize = size === 'large' ? 48 : size === 'medium' ? 32 : 24;
  const iconSize = size === 'large' ? 24 : size === 'medium' ? 20 : 16;

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <Avatar
        sx={{
          width: avatarSize,
          height: avatarSize,
          bgcolor: isHardware ? 'info.main' : 'success.main',
        }}
      >
        {isHardware ? (
          <ComputerIcon sx={{ fontSize: iconSize }} />
        ) : (
          <AppsIcon sx={{ fontSize: iconSize }} />
        )}
      </Avatar>
      <Box>
        <Typography
          variant={size === 'large' ? 'subtitle1' : 'body2'}
          fontWeight='medium'
        >
          {assetName}
        </Typography>
        {showDetails && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Chip
              label={isHardware ? '하드웨어' : '소프트웨어'}
              size='small'
              color={isHardware ? 'info' : 'success'}
              variant='outlined'
            />
            {assetId && (
              <Typography variant='caption' color='text.secondary'>
                {assetId}
              </Typography>
            )}
          </Box>
        )}
      </Box>
    </Box>
  );
}

// ============================================================================
// PROGRESS RING COMPONENT
// ============================================================================

interface ProgressRingProps {
  value: number;
  size?: number;
  thickness?: number;
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';
  showLabel?: boolean;
  label?: string;
}

export function ProgressRing({
  value,
  size = 60,
  thickness = 4,
  color = 'primary',
  showLabel = true,
  label,
}: ProgressRingProps) {
  const theme = useTheme();

  return (
    <Box sx={{ position: 'relative', display: 'inline-flex' }}>
      <CircularProgress
        variant='determinate'
        value={value}
        size={size}
        thickness={thickness}
        color={color}
        sx={{
          '& .MuiCircularProgress-circle': {
            strokeLinecap: 'round',
          },
        }}
      />
      {showLabel && (
        <Box
          sx={{
            top: 0,
            left: 0,
            bottom: 0,
            right: 0,
            position: 'absolute',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
          }}
        >
          <Typography
            variant='caption'
            component='div'
            color='text.secondary'
            sx={{ fontSize: size < 50 ? '0.65rem' : '0.75rem' }}
          >
            {label || `${Math.round(value)}%`}
          </Typography>
        </Box>
      )}
    </Box>
  );
}

// ============================================================================
// EXPORTS
// ============================================================================

export default StatusIndicator;
