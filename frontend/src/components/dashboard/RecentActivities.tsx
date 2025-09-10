import {
  Card,
  CardContent,
  CardHeader,
  Typography,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Box,
  Chip,
  IconButton,
  Tooltip,
  Divider,
  Button,
  Menu,
  MenuItem,
  ListItemIcon,
  Skeleton,
} from '@mui/material';
import {
  Person as PersonIcon,
  Computer as ComputerIcon,
  Software as SoftwareIcon,
  Assignment as AssignmentIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  SwapHoriz as SwapHorizIcon,
  MoreVert as MoreVertIcon,
  Refresh as RefreshIcon,
  FilterList as FilterListIcon,
  ViewList as ViewListIcon,
} from '@mui/icons-material';
import { ReactNode, useState } from 'react';
import { formatDistanceToNow, parseISO } from 'date-fns';
import { ko } from 'date-fns/locale';

export interface Activity {
  id: string;
  user: string;
  action: string;
  targetType?: 'employee' | 'hardware' | 'software' | 'assignment' | 'user';
  targetName?: string;
  timestamp: string;
  details?: string;
  status?: 'success' | 'warning' | 'error' | 'info';
}

export interface RecentActivitiesProps {
  activities: Activity[];
  title?: string;
  maxItems?: number;
  showHeader?: boolean;
  loading?: boolean;
  onRefresh?: () => void;
  onViewAll?: () => void;
  onFilter?: () => void;
  emptyMessage?: string;
  dense?: boolean;
  showTimestamp?: boolean;
  groupByDate?: boolean;
}

const activityConfig = {
  employee: {
    icon: PersonIcon,
    color: 'primary' as const,
    label: '직원',
  },
  hardware: {
    icon: ComputerIcon,
    color: 'secondary' as const,
    label: '하드웨어',
  },
  software: {
    icon: SoftwareIcon,
    color: 'info' as const,
    label: '소프트웨어',
  },
  assignment: {
    icon: AssignmentIcon,
    color: 'success' as const,
    label: '할당',
  },
  user: {
    icon: PersonIcon,
    color: 'warning' as const,
    label: '사용자',
  },
};

const actionIcons = {
  add: AddIcon,
  create: AddIcon,
  edit: EditIcon,
  update: EditIcon,
  delete: DeleteIcon,
  assign: SwapHorizIcon,
  return: SwapHorizIcon,
  login: PersonIcon,
  logout: PersonIcon,
};

export function RecentActivities({
  activities,
  title = 'Recent Activities',
  maxItems = 10,
  showHeader = true,
  loading = false,
  onRefresh,
  onViewAll,
  onFilter,
  emptyMessage = '최근 활동이 없습니다.',
  dense = false,
  showTimestamp = true,
  groupByDate = false,
}: RecentActivitiesProps) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const getActivityIcon = (activity: Activity): ReactNode => {
    // First try to get icon by action type
    const actionKey = activity.action
      .toLowerCase()
      .split(' ')[0] as keyof typeof actionIcons;
    if (actionIcons[actionKey]) {
      const ActionIcon = actionIcons[actionKey];
      return <ActionIcon />;
    }

    // Then try to get icon by target type
    if (activity.targetType && activityConfig[activity.targetType]) {
      const config = activityConfig[activity.targetType];
      const TargetIcon = config.icon;
      return <TargetIcon />;
    }

    // Default icon
    return <AssignmentIcon />;
  };

  const getActivityColor = (activity: Activity): string => {
    if (activity.status) {
      const statusColors = {
        success: '#4caf50',
        warning: '#ff9800',
        error: '#f44336',
        info: '#2196f3',
      };
      return statusColors[activity.status];
    }

    if (activity.targetType && activityConfig[activity.targetType]) {
      return activityConfig[activity.targetType].color;
    }

    return 'primary';
  };

  const formatTimestamp = (timestamp: string): string => {
    try {
      const date = parseISO(timestamp);
      return formatDistanceToNow(date, { addSuffix: true, locale: ko });
    } catch {
      return new Date(timestamp).toLocaleString('ko-KR', {
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      });
    }
  };

  const formatActivityText = (
    activity: Activity
  ): { primary: string; secondary?: string } => {
    let primary = activity.action;
    let secondary = activity.details;

    if (activity.targetName) {
      primary = `${activity.action} - ${activity.targetName}`;
    }

    if (!secondary && activity.targetType) {
      const config = activityConfig[activity.targetType];
      secondary = `${config?.label} 관리`;
    }

    return { primary, secondary };
  };

  const displayActivities = activities.slice(0, maxItems);

  const renderActivityItem = (activity: Activity, index: number) => {
    const { primary, secondary } = formatActivityText(activity);
    const icon = getActivityIcon(activity);
    const color = getActivityColor(activity);

    return (
      <ListItem
        key={activity.id}
        dense={dense}
        sx={{
          px: 0,
          '&:hover': {
            backgroundColor: 'action.hover',
            borderRadius: 1,
          },
        }}
      >
        <ListItemAvatar>
          <Avatar
            sx={{
              bgcolor: `${color}.main`,
              width: dense ? 32 : 40,
              height: dense ? 32 : 40,
            }}
          >
            {icon}
          </Avatar>
        </ListItemAvatar>

        <ListItemText
          primary={
            <Typography
              variant={dense ? 'body2' : 'body1'}
              sx={{ fontWeight: 500 }}
            >
              {primary}
            </Typography>
          }
          secondary={
            <Box
              sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}
            >
              <Typography variant='caption' color='text.secondary'>
                {activity.user}
              </Typography>
              {showTimestamp && (
                <>
                  <Typography variant='caption' color='text.disabled'>
                    •
                  </Typography>
                  <Typography variant='caption' color='text.secondary'>
                    {formatTimestamp(activity.timestamp)}
                  </Typography>
                </>
              )}
            </Box>
          }
        />

        {activity.status && (
          <Chip
            label={activity.status}
            size='small'
            color={
              activity.status === 'success'
                ? 'success'
                : activity.status === 'error'
                  ? 'error'
                  : activity.status === 'warning'
                    ? 'warning'
                    : 'info'
            }
            variant='outlined'
          />
        )}
      </ListItem>
    );
  };

  const renderLoadingState = () => (
    <List dense={dense}>
      {Array.from(new Array(5)).map((_, index) => (
        <ListItem key={index} sx={{ px: 0 }}>
          <ListItemAvatar>
            <Skeleton
              variant='circular'
              width={dense ? 32 : 40}
              height={dense ? 32 : 40}
            />
          </ListItemAvatar>
          <ListItemText
            primary={<Skeleton variant='text' width='60%' />}
            secondary={<Skeleton variant='text' width='40%' />}
          />
        </ListItem>
      ))}
    </List>
  );

  const renderEmptyState = () => (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        py: 4,
        textAlign: 'center',
      }}
    >
      <ViewListIcon
        sx={{
          fontSize: 48,
          color: 'text.disabled',
          mb: 2,
        }}
      />
      <Typography variant='body2' color='text.secondary'>
        {emptyMessage}
      </Typography>
    </Box>
  );

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {showHeader && (
        <CardHeader
          title={
            <Typography variant='h6' sx={{ fontWeight: 600 }}>
              {title}
            </Typography>
          }
          action={
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {onRefresh && (
                <Tooltip title='새로고침'>
                  <IconButton size='small' onClick={onRefresh}>
                    <RefreshIcon />
                  </IconButton>
                </Tooltip>
              )}

              {(onFilter || onViewAll) && (
                <>
                  <IconButton size='small' onClick={handleMenuOpen}>
                    <MoreVertIcon />
                  </IconButton>

                  <Menu
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl)}
                    onClose={handleMenuClose}
                    transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                    anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                  >
                    {onFilter && (
                      <MenuItem
                        onClick={() => {
                          handleMenuClose();
                          onFilter();
                        }}
                      >
                        <ListItemIcon>
                          <FilterListIcon fontSize='small' />
                        </ListItemIcon>
                        Filter Activities
                      </MenuItem>
                    )}

                    {onViewAll && (
                      <MenuItem
                        onClick={() => {
                          handleMenuClose();
                          onViewAll();
                        }}
                      >
                        <ListItemIcon>
                          <ViewListIcon fontSize='small' />
                        </ListItemIcon>
                        View All
                      </MenuItem>
                    )}
                  </Menu>
                </>
              )}
            </Box>
          }
          sx={{ pb: 1 }}
        />
      )}

      <CardContent sx={{ pt: 0, flex: 1, overflow: 'auto' }}>
        {loading ? (
          renderLoadingState()
        ) : displayActivities.length === 0 ? (
          renderEmptyState()
        ) : (
          <List dense={dense}>
            {displayActivities.map((activity, index) => (
              <Box key={activity.id}>
                {renderActivityItem(activity, index)}
                {index < displayActivities.length - 1 && (
                  <Divider variant='inset' component='li' />
                )}
              </Box>
            ))}
          </List>
        )}

        {!loading &&
          displayActivities.length > 0 &&
          activities.length > maxItems && (
            <Box sx={{ mt: 2, textAlign: 'center' }}>
              <Button size='small' onClick={onViewAll} disabled={!onViewAll}>
                View {activities.length - maxItems} more activities
              </Button>
            </Box>
          )}
      </CardContent>
    </Card>
  );
}

// Activity timeline component for detailed view
export interface ActivityTimelineProps {
  activities: Activity[];
  groupByDate?: boolean;
  showDate?: boolean;
  dense?: boolean;
}

export function ActivityTimeline({
  activities,
  groupByDate = true,
  showDate = true,
  dense = false,
}: ActivityTimelineProps) {
  // Group activities by date if requested
  const groupedActivities = groupByDate
    ? activities.reduce(
        (groups, activity) => {
          const date = new Date(activity.timestamp).toDateString();
          if (!groups[date]) {
            groups[date] = [];
          }
          groups[date].push(activity);
          return groups;
        },
        {} as Record<string, Activity[]>
      )
    : { All: activities };

  return (
    <Box>
      {Object.entries(groupedActivities).map(([date, dateActivities]) => (
        <Box key={date} sx={{ mb: 3 }}>
          {groupByDate && showDate && (
            <Typography
              variant='h6'
              sx={{
                mb: 2,
                pb: 1,
                borderBottom: 1,
                borderColor: 'divider',
                fontWeight: 600,
              }}
            >
              {date === new Date().toDateString()
                ? 'Today'
                : new Date(date).toLocaleDateString('ko-KR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
            </Typography>
          )}

          <RecentActivities
            activities={dateActivities}
            showHeader={false}
            dense={dense}
            maxItems={dateActivities.length}
          />
        </Box>
      ))}
    </Box>
  );
}

// Hook for managing activities
export function useActivities(initialActivities: Activity[] = []) {
  const [activities, setActivities] = useState<Activity[]>(initialActivities);
  const [loading, setLoading] = useState(false);

  const addActivity = (newActivity: Omit<Activity, 'id' | 'timestamp'>) => {
    const activity: Activity = {
      ...newActivity,
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
    };

    setActivities(prev => [activity, ...prev]);
  };

  const refreshActivities = async (fetchFn?: () => Promise<Activity[]>) => {
    if (!fetchFn) return;

    setLoading(true);
    try {
      const newActivities = await fetchFn();
      setActivities(newActivities);
    } catch (error) {
      console.error('Failed to refresh activities:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterActivities = (filters: {
    user?: string;
    action?: string;
    targetType?: Activity['targetType'];
    dateFrom?: Date;
    dateTo?: Date;
  }): Activity[] => {
    return activities.filter(activity => {
      if (
        filters.user &&
        !activity.user.toLowerCase().includes(filters.user.toLowerCase())
      ) {
        return false;
      }

      if (
        filters.action &&
        !activity.action.toLowerCase().includes(filters.action.toLowerCase())
      ) {
        return false;
      }

      if (filters.targetType && activity.targetType !== filters.targetType) {
        return false;
      }

      if (filters.dateFrom || filters.dateTo) {
        const activityDate = new Date(activity.timestamp);

        if (filters.dateFrom && activityDate < filters.dateFrom) {
          return false;
        }

        if (filters.dateTo && activityDate > filters.dateTo) {
          return false;
        }
      }

      return true;
    });
  };

  return {
    activities,
    loading,
    addActivity,
    refreshActivities,
    filterActivities,
    setActivities,
  };
}
