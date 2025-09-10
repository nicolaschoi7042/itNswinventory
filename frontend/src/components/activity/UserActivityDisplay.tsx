/**
 * User Activity and Login Display Components
 *
 * Components for displaying user activity logs, login history,
 * session information, and activity analytics.
 */

import React, { useState, useMemo } from 'react';
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Avatar,
  Chip,
  Stack,
  Divider,
  Tooltip,
  IconButton,
  Collapse,
  Alert,
  LinearProgress,
  Grid,
  useTheme,
  alpha,
} from '@mui/material';
import {
  Login as LoginIcon,
  Logout as LogoutIcon,
  Key as PasswordIcon,
  Edit as EditIcon,
  Security as SecurityIcon,
  Lock as LockIcon,
  LockOpen as UnlockIcon,
  Warning as WarningIcon,
  CheckCircle as SuccessIcon,
  Error as ErrorIcon,
  Schedule as TimeIcon,
  LocationOn as LocationIcon,
  Computer as DeviceIcon,
  ExpandMore as ExpandIcon,
  ExpandLess as CollapseIcon,
  Refresh as RefreshIcon,
  Timeline as ActivityIcon,
  TrendingUp as TrendingIcon,
  Info as InfoIcon,
  Person as PersonIcon,
} from '@mui/icons-material';

import type {
  User,
  UserActivity,
  UserSession,
  UserActivityType,
} from '@/types/user';
import { formatLastLogin, getUserActivitySummary } from '@/utils/user.utils';
import { ACTIVITY_TYPE_LABELS } from '@/constants/user.constants';

// ============================================================================
// TYPES AND INTERFACES
// ============================================================================

interface UserActivityDisplayProps {
  user: User;
  activities: UserActivity[];
  maxItems?: number;
  showAll?: boolean;
  onRefresh?: () => void;
  loading?: boolean;
}

interface ActivityTimelineProps {
  activities: UserActivity[];
  compact?: boolean;
  groupByDate?: boolean;
}

interface LoginHistoryProps {
  user: User;
  activities: UserActivity[];
  maxItems?: number;
}

interface UserSessionDisplayProps {
  sessions: UserSession[];
  currentSessionId?: string;
  onTerminateSession?: (sessionId: string) => void;
}

interface ActivitySummaryProps {
  user: User;
  activities: UserActivity[];
  period?: 'today' | 'week' | 'month';
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Get activity icon based on type
 */
function getActivityIcon(activityType: UserActivityType): React.ReactElement {
  switch (activityType) {
    case 'login':
      return <LoginIcon />;
    case 'logout':
      return <LogoutIcon />;
    case 'password_change':
    case 'password_reset':
      return <PasswordIcon />;
    case 'profile_update':
      return <EditIcon />;
    case 'role_change':
      return <SecurityIcon />;
    case 'account_lock':
      return <LockIcon />;
    case 'account_unlock':
      return <UnlockIcon />;
    case 'failed_login':
      return <ErrorIcon />;
    case 'status_change':
      return <PersonIcon />;
    default:
      return <InfoIcon />;
  }
}

/**
 * Get activity color based on type
 */
function getActivityColor(activityType: UserActivityType): string {
  switch (activityType) {
    case 'login':
    case 'account_unlock':
      return '#4caf50'; // Green
    case 'logout':
      return '#2196f3'; // Blue
    case 'password_change':
    case 'password_reset':
    case 'profile_update':
      return '#ff9800'; // Orange
    case 'role_change':
    case 'status_change':
      return '#9c27b0'; // Purple
    case 'account_lock':
    case 'failed_login':
      return '#f44336'; // Red
    default:
      return '#757575'; // Grey
  }
}

/**
 * Format activity description
 */
function formatActivityDescription(activity: UserActivity): string {
  const baseDescription = activity.description;

  // Add context information if available
  if (activity.metadata) {
    const metadata = activity.metadata;
    if (metadata.ipAddress) {
      return `${baseDescription} (${metadata.ipAddress})`;
    }
    if (metadata.oldValue && metadata.newValue) {
      return `${baseDescription}: ${metadata.oldValue} → ${metadata.newValue}`;
    }
  }

  return baseDescription;
}

/**
 * Group activities by date
 */
function groupActivitiesByDate(
  activities: UserActivity[]
): Record<string, UserActivity[]> {
  return activities.reduce(
    (groups, activity) => {
      const date = new Date(activity.timestamp).toLocaleDateString('ko-KR');
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(activity);
      return groups;
    },
    {} as Record<string, UserActivity[]>
  );
}

// ============================================================================
// ACTIVITY TIMELINE COMPONENT
// ============================================================================

function ActivityTimeline({
  activities,
  compact = false,
  groupByDate = true,
}: ActivityTimelineProps) {
  const theme = useTheme();
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const groupedActivities = useMemo(() => {
    if (!groupByDate) {
      return { '모든 활동': activities };
    }
    return groupActivitiesByDate(activities);
  }, [activities, groupByDate]);

  const toggleGroup = (date: string) => {
    setExpanded(prev => ({
      ...prev,
      [date]: !prev[date],
    }));
  };

  if (activities.length === 0) {
    return (
      <Alert severity='info' sx={{ m: 2 }}>
        활동 기록이 없습니다.
      </Alert>
    );
  }

  return (
    <Box>
      {Object.entries(groupedActivities).map(([date, dateActivities]) => (
        <Box key={date} sx={{ mb: 2 }}>
          {groupByDate && (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                p: 1,
                backgroundColor: alpha(theme.palette.primary.main, 0.05),
                borderRadius: 1,
                cursor: 'pointer',
              }}
              onClick={() => toggleGroup(date)}
            >
              <Typography variant='subtitle2' fontWeight={600}>
                {date} ({dateActivities.length}개 활동)
              </Typography>
              <IconButton size='small'>
                {expanded[date] ? <CollapseIcon /> : <ExpandIcon />}
              </IconButton>
            </Box>
          )}

          <Collapse in={!groupByDate || expanded[date] !== false}>
            <List dense={compact} sx={{ pl: groupByDate ? 2 : 0 }}>
              {dateActivities.map((activity, index) => (
                <ListItem
                  key={activity.id}
                  sx={{
                    borderLeft: `3px solid ${getActivityColor(activity.activityType)}`,
                    mb: 1,
                    backgroundColor: alpha(
                      getActivityColor(activity.activityType),
                      0.03
                    ),
                    borderRadius: 1,
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 40 }}>
                    <Avatar
                      sx={{
                        width: 32,
                        height: 32,
                        bgcolor: getActivityColor(activity.activityType),
                      }}
                    >
                      {getActivityIcon(activity.activityType)}
                    </Avatar>
                  </ListItemIcon>

                  <ListItemText
                    primary={
                      <Stack direction='row' alignItems='center' spacing={1}>
                        <Typography variant='body2' fontWeight={500}>
                          {ACTIVITY_TYPE_LABELS[activity.activityType]}
                        </Typography>
                        <Chip
                          label={new Date(
                            activity.timestamp
                          ).toLocaleTimeString('ko-KR', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                          size='small'
                          variant='outlined'
                          sx={{ fontSize: '0.75rem', height: 20 }}
                        />
                      </Stack>
                    }
                    secondary={
                      <Box sx={{ mt: 0.5 }}>
                        <Typography variant='body2' color='text.secondary'>
                          {formatActivityDescription(activity)}
                        </Typography>
                        {activity.performedByName &&
                          activity.performedByName !== activity.username && (
                            <Typography
                              variant='caption'
                              color='text.secondary'
                            >
                              수행자: {activity.performedByName}
                            </Typography>
                          )}
                        {activity.ipAddress && (
                          <Typography
                            variant='caption'
                            color='text.secondary'
                            sx={{ ml: 1 }}
                          >
                            IP: {activity.ipAddress}
                          </Typography>
                        )}
                      </Box>
                    }
                  />
                </ListItem>
              ))}
            </List>
          </Collapse>
        </Box>
      ))}
    </Box>
  );
}

// ============================================================================
// LOGIN HISTORY COMPONENT
// ============================================================================

function LoginHistory({ user, activities, maxItems = 10 }: LoginHistoryProps) {
  const theme = useTheme();

  const loginActivities = useMemo(() => {
    return activities
      .filter(activity =>
        ['login', 'failed_login'].includes(activity.activityType)
      )
      .slice(0, maxItems);
  }, [activities, maxItems]);

  const successfulLogins = loginActivities.filter(
    a => a.activityType === 'login'
  ).length;
  const failedLogins = loginActivities.filter(
    a => a.activityType === 'failed_login'
  ).length;

  return (
    <Card>
      <CardHeader
        title='로그인 기록'
        titleTypographyProps={{ variant: 'h6', fontWeight: 600 }}
        subheader={`최근 ${maxItems}회`}
        action={
          <Stack direction='row' spacing={1}>
            <Chip
              icon={<SuccessIcon />}
              label={`성공: ${successfulLogins}`}
              size='small'
              color='success'
              variant='outlined'
            />
            <Chip
              icon={<ErrorIcon />}
              label={`실패: ${failedLogins}`}
              size='small'
              color='error'
              variant='outlined'
            />
          </Stack>
        }
      />
      <CardContent>
        {loginActivities.length === 0 ? (
          <Alert severity='info'>로그인 기록이 없습니다.</Alert>
        ) : (
          <List>
            {loginActivities.map((activity, index) => (
              <ListItem
                key={activity.id}
                sx={{
                  border: `1px solid ${theme.palette.divider}`,
                  borderRadius: 1,
                  mb: 1,
                  backgroundColor:
                    activity.activityType === 'failed_login'
                      ? alpha(theme.palette.error.main, 0.05)
                      : alpha(theme.palette.success.main, 0.05),
                }}
              >
                <ListItemIcon>
                  <Avatar
                    sx={{
                      width: 32,
                      height: 32,
                      bgcolor:
                        activity.activityType === 'failed_login'
                          ? theme.palette.error.main
                          : theme.palette.success.main,
                    }}
                  >
                    {activity.activityType === 'failed_login' ? (
                      <ErrorIcon />
                    ) : (
                      <LoginIcon />
                    )}
                  </Avatar>
                </ListItemIcon>

                <ListItemText
                  primary={
                    <Stack
                      direction='row'
                      alignItems='center'
                      justifyContent='space-between'
                    >
                      <Typography variant='body2' fontWeight={500}>
                        {activity.activityType === 'failed_login'
                          ? '로그인 실패'
                          : '로그인 성공'}
                      </Typography>
                      <Typography variant='caption' color='text.secondary'>
                        {new Date(activity.timestamp).toLocaleString('ko-KR')}
                      </Typography>
                    </Stack>
                  }
                  secondary={
                    <Stack direction='row' spacing={2} sx={{ mt: 0.5 }}>
                      {activity.ipAddress && (
                        <Stack
                          direction='row'
                          alignItems='center'
                          spacing={0.5}
                        >
                          <LocationIcon sx={{ fontSize: 14 }} />
                          <Typography variant='caption'>
                            {activity.ipAddress}
                          </Typography>
                        </Stack>
                      )}
                      {activity.userAgent && (
                        <Stack
                          direction='row'
                          alignItems='center'
                          spacing={0.5}
                        >
                          <DeviceIcon sx={{ fontSize: 14 }} />
                          <Typography variant='caption'>
                            {activity.userAgent.includes('Mobile')
                              ? 'Mobile'
                              : 'Desktop'}
                          </Typography>
                        </Stack>
                      )}
                    </Stack>
                  }
                />
              </ListItem>
            ))}
          </List>
        )}
      </CardContent>
    </Card>
  );
}

// ============================================================================
// ACTIVITY SUMMARY COMPONENT
// ============================================================================

function ActivitySummary({
  user,
  activities,
  period = 'month',
}: ActivitySummaryProps) {
  const theme = useTheme();
  const summary = getUserActivitySummary(activities);

  const summaryItems = [
    {
      label: '총 활동',
      value: summary.totalActivities,
      icon: <ActivityIcon />,
      color: theme.palette.primary.main,
    },
    {
      label: '로그인',
      value: summary.loginCount,
      icon: <LoginIcon />,
      color: theme.palette.success.main,
    },
    {
      label: '로그인 실패',
      value: summary.failedLoginCount,
      icon: <ErrorIcon />,
      color: theme.palette.error.main,
      alert: summary.failedLoginCount > 5,
    },
    {
      label: '비밀번호 변경',
      value: summary.passwordChangeCount,
      icon: <PasswordIcon />,
      color: theme.palette.warning.main,
    },
  ];

  return (
    <Card>
      <CardHeader
        title='활동 요약'
        titleTypographyProps={{ variant: 'h6', fontWeight: 600 }}
        subheader={`${period === 'today' ? '오늘' : period === 'week' ? '이번 주' : '이번 달'} 기준`}
        action={
          <Stack direction='row' alignItems='center' spacing={1}>
            <Typography variant='caption' color='text.secondary'>
              마지막 로그인: {formatLastLogin(user.lastLogin)}
            </Typography>
          </Stack>
        }
      />
      <CardContent>
        <Grid container spacing={2}>
          {summaryItems.map((item, index) => (
            <Grid item xs={6} sm={3} key={index}>
              <Box
                sx={{
                  p: 2,
                  border: `1px solid ${theme.palette.divider}`,
                  borderRadius: 2,
                  backgroundColor: item.alert
                    ? alpha(theme.palette.error.main, 0.05)
                    : alpha(item.color, 0.05),
                  textAlign: 'center',
                }}
              >
                <Avatar
                  sx={{
                    width: 40,
                    height: 40,
                    bgcolor: alpha(item.color, 0.1),
                    color: item.color,
                    mx: 'auto',
                    mb: 1,
                  }}
                >
                  {item.icon}
                </Avatar>
                <Typography variant='h4' fontWeight={700} color={item.color}>
                  {item.value}
                </Typography>
                <Typography variant='body2' color='text.secondary'>
                  {item.label}
                </Typography>
                {item.alert && (
                  <Chip
                    icon={<WarningIcon />}
                    label='주의'
                    size='small'
                    color='error'
                    sx={{ mt: 1 }}
                  />
                )}
              </Box>
            </Grid>
          ))}
        </Grid>

        {summary.lastActivity && (
          <Box
            sx={{
              mt: 2,
              p: 2,
              backgroundColor: alpha(theme.palette.info.main, 0.05),
              borderRadius: 1,
            }}
          >
            <Typography variant='subtitle2' gutterBottom>
              최근 활동
            </Typography>
            <Stack direction='row' alignItems='center' spacing={1}>
              <Avatar
                sx={{
                  width: 24,
                  height: 24,
                  bgcolor: getActivityColor(summary.lastActivity.activityType),
                }}
              >
                {getActivityIcon(summary.lastActivity.activityType)}
              </Avatar>
              <Typography variant='body2'>
                {summary.lastActivity.description}
              </Typography>
              <Typography variant='caption' color='text.secondary'>
                (
                {new Date(summary.lastActivity.timestamp).toLocaleString(
                  'ko-KR'
                )}
                )
              </Typography>
            </Stack>
          </Box>
        )}
      </CardContent>
    </Card>
  );
}

// ============================================================================
// USER SESSION DISPLAY COMPONENT
// ============================================================================

function UserSessionDisplay({
  sessions,
  currentSessionId,
  onTerminateSession,
}: UserSessionDisplayProps) {
  const theme = useTheme();

  return (
    <Card>
      <CardHeader
        title='활성 세션'
        titleTypographyProps={{ variant: 'h6', fontWeight: 600 }}
        subheader={`${sessions.length}개의 활성 세션`}
      />
      <CardContent>
        {sessions.length === 0 ? (
          <Alert severity='info'>활성 세션이 없습니다.</Alert>
        ) : (
          <List>
            {sessions.map(session => (
              <ListItem
                key={session.id}
                sx={{
                  border: `1px solid ${theme.palette.divider}`,
                  borderRadius: 1,
                  mb: 1,
                  backgroundColor:
                    session.id === currentSessionId
                      ? alpha(theme.palette.primary.main, 0.05)
                      : 'transparent',
                }}
              >
                <ListItemIcon>
                  <Avatar
                    sx={{
                      width: 32,
                      height: 32,
                      bgcolor:
                        session.id === currentSessionId
                          ? theme.palette.primary.main
                          : theme.palette.grey[400],
                    }}
                  >
                    <DeviceIcon />
                  </Avatar>
                </ListItemIcon>

                <ListItemText
                  primary={
                    <Stack
                      direction='row'
                      alignItems='center'
                      justifyContent='space-between'
                    >
                      <Typography variant='body2' fontWeight={500}>
                        {session.userAgent.includes('Mobile')
                          ? 'Mobile Device'
                          : 'Desktop'}
                        {session.id === currentSessionId && (
                          <Chip
                            label='현재 세션'
                            size='small'
                            color='primary'
                            sx={{ ml: 1 }}
                          />
                        )}
                      </Typography>
                      <Typography variant='caption' color='text.secondary'>
                        {new Date(session.loginTime).toLocaleString('ko-KR')}
                      </Typography>
                    </Stack>
                  }
                  secondary={
                    <Stack spacing={0.5} sx={{ mt: 0.5 }}>
                      <Stack direction='row' alignItems='center' spacing={0.5}>
                        <LocationIcon sx={{ fontSize: 14 }} />
                        <Typography variant='caption'>
                          {session.ipAddress}
                          {session.location &&
                            ` (${session.location.city}, ${session.location.country})`}
                        </Typography>
                      </Stack>
                      <Stack direction='row' alignItems='center' spacing={0.5}>
                        <TimeIcon sx={{ fontSize: 14 }} />
                        <Typography variant='caption'>
                          마지막 활동:{' '}
                          {new Date(session.lastActivity).toLocaleString(
                            'ko-KR'
                          )}
                        </Typography>
                      </Stack>
                    </Stack>
                  }
                />

                {session.id !== currentSessionId && onTerminateSession && (
                  <IconButton
                    size='small'
                    color='error'
                    onClick={() => onTerminateSession(session.id)}
                    sx={{ ml: 1 }}
                  >
                    <LogoutIcon />
                  </IconButton>
                )}
              </ListItem>
            ))}
          </List>
        )}
      </CardContent>
    </Card>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function UserActivityDisplay({
  user,
  activities,
  maxItems = 20,
  showAll = false,
  onRefresh,
  loading = false,
}: UserActivityDisplayProps) {
  const [viewMode, setViewMode] = useState<'timeline' | 'summary' | 'login'>(
    'timeline'
  );

  const displayActivities = useMemo(() => {
    if (showAll) return activities;
    return activities.slice(0, maxItems);
  }, [activities, maxItems, showAll]);

  return (
    <Box>
      <Stack direction='row' spacing={2} sx={{ mb: 2 }}>
        <Chip
          label='타임라인'
          color={viewMode === 'timeline' ? 'primary' : 'default'}
          onClick={() => setViewMode('timeline')}
          clickable
        />
        <Chip
          label='요약'
          color={viewMode === 'summary' ? 'primary' : 'default'}
          onClick={() => setViewMode('summary')}
          clickable
        />
        <Chip
          label='로그인 기록'
          color={viewMode === 'login' ? 'primary' : 'default'}
          onClick={() => setViewMode('login')}
          clickable
        />

        {onRefresh && (
          <IconButton size='small' onClick={onRefresh} disabled={loading}>
            <RefreshIcon />
          </IconButton>
        )}
      </Stack>

      {loading && <LinearProgress sx={{ mb: 2 }} />}

      {viewMode === 'timeline' && (
        <ActivityTimeline activities={displayActivities} />
      )}

      {viewMode === 'summary' && (
        <ActivitySummary user={user} activities={activities} />
      )}

      {viewMode === 'login' && (
        <LoginHistory user={user} activities={activities} />
      )}
    </Box>
  );
}

// ============================================================================
// EXPORTS
// ============================================================================

export { ActivityTimeline, LoginHistory, ActivitySummary, UserSessionDisplay };

export default UserActivityDisplay;
