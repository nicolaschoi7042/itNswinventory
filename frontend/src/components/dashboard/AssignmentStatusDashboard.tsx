/**
 * Assignment Status Dashboard Component
 * 
 * Comprehensive dashboard for visualizing assignment status, metrics, and trends
 * with interactive elements and real-time updates.
 */

import React, { useMemo } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Divider,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Chip,
  LinearProgress,
  useTheme,
  alpha
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Schedule as ScheduleIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Assignment as AssignmentIcon
} from '@mui/icons-material';

// Import assignment types and utilities
import {
  Assignment,
  AssignmentWithDetails,
  AssignmentStats,
  AssignmentStatus
} from '@/types/assignment';

import {
  calculateAssignmentStats,
  getAssignmentStatusInfo,
  formatDate
} from '@/utils/assignment.utils';

// Import visualization components
import {
  StatusIndicator,
  AssignmentStatsVisualization,
  ProgressRing,
  AssetTypeVisualization
} from '@/components/visualization/StatusVisualization';

// ============================================================================
// INTERFACES
// ============================================================================

interface AssignmentStatusDashboardProps {
  assignments: (Assignment | AssignmentWithDetails)[];
  showTrends?: boolean;
  showRecentActivity?: boolean;
  maxRecentItems?: number;
  variant?: 'full' | 'compact' | 'summary';
}

interface StatusTrend {
  status: AssignmentStatus;
  current: number;
  previous: number;
  change: number;
  changePercent: number;
  trend: 'up' | 'down' | 'stable';
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function AssignmentStatusDashboard({
  assignments,
  showTrends = true,
  showRecentActivity = true,
  maxRecentItems = 5,
  variant = 'full'
}: AssignmentStatusDashboardProps) {
  const theme = useTheme();

  // Calculate statistics
  const stats = useMemo(() => {
    return calculateAssignmentStats(assignments);
  }, [assignments]);

  // Calculate status distribution percentages
  const statusDistribution = useMemo(() => {
    const total = stats.total_assignments;
    if (total === 0) return {};

    return {
      active_percent: Math.round((stats.active_assignments / total) * 100),
      returned_percent: Math.round((stats.returned_assignments / total) * 100),
      overdue_percent: Math.round((stats.overdue_assignments / total) * 100),
    };
  }, [stats]);

  // Get recent assignments (last 7 days)
  const recentAssignments = useMemo(() => {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    return assignments
      .filter(assignment => new Date(assignment.assigned_date) >= sevenDaysAgo)
      .sort((a, b) => new Date(b.assigned_date).getTime() - new Date(a.assigned_date).getTime())
      .slice(0, maxRecentItems);
  }, [assignments, maxRecentItems]);

  // Get overdue assignments
  const overdueAssignments = useMemo(() => {
    return assignments
      .filter(assignment => assignment.status === '연체')
      .slice(0, maxRecentItems);
  }, [assignments, maxRecentItems]);

  // Mock trend data (in real app, this would come from historical data)
  const trends = useMemo((): StatusTrend[] => {
    return [
      {
        status: '사용중',
        current: stats.active_assignments,
        previous: Math.max(0, stats.active_assignments - Math.floor(Math.random() * 5)),
        change: 0,
        changePercent: 0,
        trend: 'stable'
      },
      {
        status: '연체',
        current: stats.overdue_assignments,
        previous: Math.max(0, stats.overdue_assignments + Math.floor(Math.random() * 3)),
        change: 0,
        changePercent: 0,
        trend: 'down'
      }
    ].map(trend => {
      trend.change = trend.current - trend.previous;
      trend.changePercent = trend.previous > 0 ? Math.round((trend.change / trend.previous) * 100) : 0;
      trend.trend = trend.change > 0 ? 'up' : trend.change < 0 ? 'down' : 'stable';
      return trend;
    });
  }, [stats]);

  // Summary variant - compact display
  if (variant === 'summary') {
    return (
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            할당 현황
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Box sx={{ textAlign: 'center' }}>
                <ProgressRing 
                  value={statusDistribution.active_percent || 0} 
                  color="success" 
                  size={60}
                  label={`${stats.active_assignments}`}
                />
                <Typography variant="caption" display="block" color="text.secondary" sx={{ mt: 1 }}>
                  사용 중
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={6}>
              <Box sx={{ textAlign: 'center' }}>
                <ProgressRing 
                  value={statusDistribution.overdue_percent || 0} 
                  color="error" 
                  size={60}
                  label={`${stats.overdue_assignments}`}
                />
                <Typography variant="caption" display="block" color="text.secondary" sx={{ mt: 1 }}>
                  연체
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    );
  }

  // Compact variant
  if (variant === 'compact') {
    return (
      <Box>
        <AssignmentStatsVisualization stats={stats} variant="compact" />
        
        {overdueAssignments.length > 0 && (
          <Card sx={{ mt: 2 }}>
            <CardContent>
              <Typography variant="subtitle1" color="error.main" gutterBottom>
                <WarningIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                연체 항목 ({overdueAssignments.length})
              </Typography>
              <List dense>
                {overdueAssignments.map((assignment) => (
                  <ListItem key={assignment.id} sx={{ px: 0 }}>
                    <ListItemText
                      primary={assignment.employee_name}
                      secondary={assignment.asset_id}
                      primaryTypographyProps={{ variant: 'body2' }}
                      secondaryTypographyProps={{ variant: 'caption' }}
                    />
                    <StatusIndicator status={assignment.status} size="small" />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        )}
      </Box>
    );
  }

  // Full variant - comprehensive dashboard
  return (
    <Box>
      {/* Main Statistics */}
      <AssignmentStatsVisualization stats={stats} variant="detailed" />

      <Grid container spacing={3} sx={{ mt: 2 }}>
        {/* Status Distribution */}
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                상태별 분포
              </Typography>
              
              <Box sx={{ mt: 2 }}>
                {/* Active assignments progress */}
                <Box sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">사용 중</Typography>
                    <Typography variant="body2" color="success.main">
                      {stats.active_assignments} ({statusDistribution.active_percent}%)
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={statusDistribution.active_percent || 0}
                    color="success"
                    sx={{ height: 8, borderRadius: 4 }}
                  />
                </Box>

                {/* Returned assignments progress */}
                <Box sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">반납 완료</Typography>
                    <Typography variant="body2" color="info.main">
                      {stats.returned_assignments} ({statusDistribution.returned_percent}%)
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={statusDistribution.returned_percent || 0}
                    color="info"
                    sx={{ height: 8, borderRadius: 4 }}
                  />
                </Box>

                {/* Overdue assignments progress */}
                <Box sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">연체</Typography>
                    <Typography variant="body2" color="error.main">
                      {stats.overdue_assignments} ({statusDistribution.overdue_percent}%)
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={statusDistribution.overdue_percent || 0}
                    color="error"
                    sx={{ height: 8, borderRadius: 4 }}
                  />
                </Box>

                {/* Asset type distribution */}
                <Divider sx={{ my: 2 }} />
                <Typography variant="subtitle2" gutterBottom>
                  자산 유형별
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
                  <Chip
                    label={`하드웨어: ${stats.by_asset_type.hardware}`}
                    color="info"
                    variant="outlined"
                    size="small"
                  />
                  <Chip
                    label={`소프트웨어: ${stats.by_asset_type.software}`}
                    color="success"
                    variant="outlined"
                    size="small"
                  />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Activity & Alerts */}
        <Grid item xs={12} md={6}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, height: '100%' }}>
            {/* Overdue Alerts */}
            {overdueAssignments.length > 0 && (
              <Card>
                <CardContent>
                  <Typography variant="h6" color="error.main" gutterBottom>
                    <WarningIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                    연체 알림 ({overdueAssignments.length})
                  </Typography>
                  <List dense>
                    {overdueAssignments.map((assignment) => (
                      <ListItem key={assignment.id} sx={{ px: 0 }}>
                        <ListItemAvatar>
                          <Avatar sx={{ bgcolor: 'error.main', width: 32, height: 32 }}>
                            <WarningIcon fontSize="small" />
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={assignment.employee_name}
                          secondary={`${assignment.asset_id} - ${formatDate(assignment.assigned_date)}`}
                          primaryTypographyProps={{ variant: 'body2' }}
                          secondaryTypographyProps={{ variant: 'caption' }}
                        />
                        <StatusIndicator status={assignment.status} size="small" variant="minimal" />
                      </ListItem>
                    ))}
                  </List>
                </CardContent>
              </Card>
            )}

            {/* Recent Activity */}
            {showRecentActivity && recentAssignments.length > 0 && (
              <Card sx={{ flexGrow: 1 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    <ScheduleIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                    최근 할당 ({recentAssignments.length})
                  </Typography>
                  <List dense>
                    {recentAssignments.map((assignment) => (
                      <ListItem key={assignment.id} sx={{ px: 0 }}>
                        <ListItemAvatar>
                          <Avatar sx={{ bgcolor: 'primary.main', width: 32, height: 32 }}>
                            <AssignmentIcon fontSize="small" />
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={assignment.employee_name}
                          secondary={`${assignment.asset_id} - ${formatDate(assignment.assigned_date)}`}
                          primaryTypographyProps={{ variant: 'body2' }}
                          secondaryTypographyProps={{ variant: 'caption' }}
                        />
                        <StatusIndicator status={assignment.status} size="small" />
                      </ListItem>
                    ))}
                  </List>
                </CardContent>
              </Card>
            )}

            {/* Trends */}
            {showTrends && (
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    <TrendingUpIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                    추세 분석
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    {trends.map((trend, index) => (
                      <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <StatusIndicator status={trend.status} size="small" showLabel={false} />
                        <Typography variant="body2" sx={{ flexGrow: 1 }}>
                          {getAssignmentStatusInfo(trend.status).label}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          {trend.trend === 'up' ? (
                            <TrendingUpIcon color="error" fontSize="small" />
                          ) : trend.trend === 'down' ? (
                            <TrendingDownIcon color="success" fontSize="small" />
                          ) : (
                            <Box sx={{ width: 16 }} />
                          )}
                          <Typography 
                            variant="caption" 
                            color={
                              trend.trend === 'up' ? 'error.main' : 
                              trend.trend === 'down' ? 'success.main' : 
                              'text.secondary'
                            }
                          >
                            {trend.change > 0 ? '+' : ''}{trend.change}
                          </Typography>
                        </Box>
                      </Box>
                    ))}
                  </Box>
                </CardContent>
              </Card>
            )}
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
}

// ============================================================================
// EXPORTS
// ============================================================================

export default AssignmentStatusDashboard;