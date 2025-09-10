/**
 * Export Schedule Manager Component
 *
 * Provides comprehensive UI for managing export schedules, automation, and notifications
 */

import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tabs,
  Tab,
  Badge,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Alert,
  LinearProgress,
  Divider,
  Grid,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  PlayArrow as PlayIcon,
  Pause as PauseIcon,
  Stop as StopIcon,
  Schedule as ScheduleIcon,
  Notifications as NotificationsIcon,
  MoreVert as MoreVertIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
  AccessTime as AccessTimeIcon,
  Event as EventIcon,
  Download as DownloadIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import type {
  ScheduledExport,
  ExportNotification,
  ScheduleConfig,
} from '@/types/export';
import { exportSchedulerService } from '@/services/export-scheduler.service';
import { ExportScheduleForm } from './ExportScheduleForm';
import { NotificationPanel } from './NotificationPanel';

// ============================================================================
// TYPES AND INTERFACES
// ============================================================================

interface ExportScheduleManagerProps {
  className?: string;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

// ============================================================================
// TAB PANEL COMPONENT
// ============================================================================

const TabPanel: React.FC<TabPanelProps> = ({
  children,
  value,
  index,
  ...other
}) => {
  return (
    <div
      role='tabpanel'
      hidden={value !== index}
      id={`schedule-tabpanel-${index}`}
      aria-labelledby={`schedule-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export const ExportScheduleManager: React.FC<ExportScheduleManagerProps> = ({
  className,
}) => {
  // ============================================================================
  // STATE MANAGEMENT
  // ============================================================================

  const [schedules, setSchedules] = useState<ScheduledExport[]>([]);
  const [notifications, setNotifications] = useState<ExportNotification[]>([]);
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(false);
  const [selectedSchedule, setSelectedSchedule] =
    useState<ScheduledExport | null>(null);
  const [scheduleFormOpen, setScheduleFormOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [notificationPanelOpen, setNotificationPanelOpen] = useState(false);
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedScheduleId, setSelectedScheduleId] = useState<string>('');

  // ============================================================================
  // LIFECYCLE HOOKS
  // ============================================================================

  useEffect(() => {
    loadSchedules();
    loadNotifications();

    // Set up periodic refresh
    const interval = setInterval(() => {
      loadSchedules();
      loadNotifications();
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, []);

  // ============================================================================
  // DATA LOADING
  // ============================================================================

  const loadSchedules = async () => {
    try {
      setLoading(true);
      const schedulesData = await exportSchedulerService.getAllSchedules();
      setSchedules(schedulesData);
    } catch (error) {
      console.error('Error loading schedules:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadNotifications = async () => {
    try {
      const notificationsData = exportSchedulerService.getNotifications();
      setNotifications(notificationsData);
    } catch (error) {
      console.error('Error loading notifications:', error);
    }
  };

  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleCreateSchedule = () => {
    setSelectedSchedule(null);
    setScheduleFormOpen(true);
  };

  const handleEditSchedule = (schedule: ScheduledExport) => {
    setSelectedSchedule(schedule);
    setScheduleFormOpen(true);
  };

  const handleDeleteSchedule = (schedule: ScheduledExport) => {
    setSelectedSchedule(schedule);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedSchedule) return;

    try {
      setLoading(true);
      const result = await exportSchedulerService.deleteSchedule(
        selectedSchedule.id
      );

      if (result.success) {
        await loadSchedules();
        setDeleteDialogOpen(false);
        setSelectedSchedule(null);
      } else {
        console.error('Failed to delete schedule:', result.message);
      }
    } catch (error) {
      console.error('Error deleting schedule:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePauseSchedule = async (scheduleId: string) => {
    try {
      setLoading(true);
      const result = await exportSchedulerService.pauseSchedule(scheduleId);

      if (result.success) {
        await loadSchedules();
      } else {
        console.error('Failed to pause schedule:', result.message);
      }
    } catch (error) {
      console.error('Error pausing schedule:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleResumeSchedule = async (scheduleId: string) => {
    try {
      setLoading(true);
      const result = await exportSchedulerService.resumeSchedule(scheduleId);

      if (result.success) {
        await loadSchedules();
      } else {
        console.error('Failed to resume schedule:', result.message);
      }
    } catch (error) {
      console.error('Error resuming schedule:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExecuteNow = async (scheduleId: string) => {
    try {
      setLoading(true);
      const result = await exportSchedulerService.executeNow(scheduleId);

      if (result.success) {
        await loadSchedules();
        await loadNotifications();
      } else {
        console.error('Failed to execute schedule:', result.message);
      }
    } catch (error) {
      console.error('Error executing schedule:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleScheduleFormSubmit = async (config: ScheduleConfig) => {
    try {
      setLoading(true);

      let result;
      if (selectedSchedule) {
        result = await exportSchedulerService.updateSchedule(
          selectedSchedule.id,
          config
        );
      } else {
        result = await exportSchedulerService.createSchedule(config);
      }

      if (result.success) {
        await loadSchedules();
        setScheduleFormOpen(false);
        setSelectedSchedule(null);
      } else {
        console.error('Failed to save schedule:', result.message);
      }
    } catch (error) {
      console.error('Error saving schedule:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMenuClick = (
    event: React.MouseEvent<HTMLElement>,
    scheduleId: string
  ) => {
    setMenuAnchorEl(event.currentTarget);
    setSelectedScheduleId(scheduleId);
  };

  const handleMenuClose = () => {
    setMenuAnchorEl(null);
    setSelectedScheduleId('');
  };

  const handleNotificationClick = () => {
    setNotificationPanelOpen(true);
  };

  // ============================================================================
  // UTILITY FUNCTIONS
  // ============================================================================

  const getScheduleStatusColor = (
    schedule: ScheduledExport
  ): 'success' | 'warning' | 'error' | 'default' => {
    if (!schedule.isActive) return 'default';

    if (schedule.lastResult) {
      return schedule.lastResult.success ? 'success' : 'error';
    }

    return 'warning';
  };

  const getScheduleStatusIcon = (schedule: ScheduledExport) => {
    if (!schedule.isActive) return <PauseIcon />;

    if (schedule.lastResult) {
      return schedule.lastResult.success ? <CheckCircleIcon /> : <ErrorIcon />;
    }

    return <WarningIcon />;
  };

  const formatNextRun = (nextRun: Date | null): string => {
    if (!nextRun) return 'Not scheduled';

    const now = new Date();
    const diff = nextRun.getTime() - now.getTime();

    if (diff < 0) return 'Overdue';

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (hours > 24) {
      const days = Math.floor(hours / 24);
      return `In ${days} day${days > 1 ? 's' : ''}`;
    } else if (hours > 0) {
      return `In ${hours}h ${minutes}m`;
    } else {
      return `In ${minutes}m`;
    }
  };

  const formatScheduleType = (schedule: ScheduledExport): string => {
    const { schedule: scheduleConfig } = schedule;

    switch (scheduleConfig.type) {
      case 'once':
        return 'One-time';
      case 'daily':
        return `Daily at ${scheduleConfig.time}`;
      case 'weekly':
        const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        return `Weekly on ${dayNames[scheduleConfig.dayOfWeek!]} at ${scheduleConfig.time}`;
      case 'monthly':
        return `Monthly on day ${scheduleConfig.dayOfMonth} at ${scheduleConfig.time}`;
      case 'cron':
        return `Cron: ${scheduleConfig.cronExpression}`;
      default:
        return 'Unknown';
    }
  };

  const getUnreadNotificationCount = (): number => {
    return notifications.filter(n => !n.read).length;
  };

  // ============================================================================
  // RENDER METHODS
  // ============================================================================

  const renderSchedulesTable = () => (
    <TableContainer component={Paper} variant='outlined'>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Name</TableCell>
            <TableCell>Data Type</TableCell>
            <TableCell>Format</TableCell>
            <TableCell>Schedule</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Next Run</TableCell>
            <TableCell>Last Run</TableCell>
            <TableCell>Success Rate</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {schedules.map(schedule => (
            <TableRow key={schedule.id}>
              <TableCell>
                <Box>
                  <Typography variant='subtitle2' fontWeight='medium'>
                    {schedule.name}
                  </Typography>
                  {schedule.description && (
                    <Typography variant='caption' color='text.secondary'>
                      {schedule.description}
                    </Typography>
                  )}
                </Box>
              </TableCell>
              <TableCell>
                <Chip
                  label={schedule.dataType}
                  size='small'
                  variant='outlined'
                />
              </TableCell>
              <TableCell>
                <Chip
                  label={schedule.exportFormat.toUpperCase()}
                  size='small'
                  color='primary'
                  variant='outlined'
                />
              </TableCell>
              <TableCell>
                <Typography variant='body2'>
                  {formatScheduleType(schedule)}
                </Typography>
              </TableCell>
              <TableCell>
                <Chip
                  icon={getScheduleStatusIcon(schedule)}
                  label={schedule.isActive ? 'Active' : 'Paused'}
                  size='small'
                  color={getScheduleStatusColor(schedule)}
                  variant={schedule.isActive ? 'filled' : 'outlined'}
                />
              </TableCell>
              <TableCell>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <AccessTimeIcon fontSize='small' color='action' />
                  <Typography variant='body2'>
                    {formatNextRun(schedule.nextRun)}
                  </Typography>
                </Box>
              </TableCell>
              <TableCell>
                {schedule.lastRun ? (
                  <Typography variant='body2'>
                    {new Date(schedule.lastRun).toLocaleDateString()}
                  </Typography>
                ) : (
                  <Typography variant='body2' color='text.secondary'>
                    Never
                  </Typography>
                )}
              </TableCell>
              <TableCell>
                <Box>
                  <Typography variant='body2'>
                    {schedule.runCount > 0
                      ? `${Math.round((schedule.successCount / schedule.runCount) * 100)}%`
                      : 'N/A'}
                  </Typography>
                  <Typography variant='caption' color='text.secondary'>
                    {schedule.successCount}/{schedule.runCount} runs
                  </Typography>
                </Box>
              </TableCell>
              <TableCell>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  {schedule.isActive ? (
                    <Tooltip title='Pause Schedule'>
                      <IconButton
                        size='small'
                        onClick={() => handlePauseSchedule(schedule.id)}
                        disabled={loading}
                      >
                        <PauseIcon />
                      </IconButton>
                    </Tooltip>
                  ) : (
                    <Tooltip title='Resume Schedule'>
                      <IconButton
                        size='small'
                        onClick={() => handleResumeSchedule(schedule.id)}
                        disabled={loading}
                      >
                        <PlayIcon />
                      </IconButton>
                    </Tooltip>
                  )}

                  <Tooltip title='Execute Now'>
                    <IconButton
                      size='small'
                      onClick={() => handleExecuteNow(schedule.id)}
                      disabled={loading}
                    >
                      <PlayIcon />
                    </IconButton>
                  </Tooltip>

                  <IconButton
                    size='small'
                    onClick={e => handleMenuClick(e, schedule.id)}
                  >
                    <MoreVertIcon />
                  </IconButton>
                </Box>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );

  const renderSummaryCards = () => {
    const activeSchedules = schedules.filter(s => s.isActive).length;
    const totalRuns = schedules.reduce((sum, s) => sum + s.runCount, 0);
    const successfulRuns = schedules.reduce(
      (sum, s) => sum + s.successCount,
      0
    );
    const upcomingRuns = schedules.filter(
      s => s.isActive && s.nextRun && s.nextRun > new Date()
    ).length;

    return (
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant='h4' color='primary' gutterBottom>
                {schedules.length}
              </Typography>
              <Typography variant='body2'>Total Schedules</Typography>
              <Typography variant='caption' color='text.secondary'>
                {activeSchedules} active
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant='h4' color='success.main' gutterBottom>
                {upcomingRuns}
              </Typography>
              <Typography variant='body2'>Upcoming Runs</Typography>
              <Typography variant='caption' color='text.secondary'>
                Next 24 hours
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant='h4' color='info.main' gutterBottom>
                {totalRuns}
              </Typography>
              <Typography variant='body2'>Total Executions</Typography>
              <Typography variant='caption' color='text.secondary'>
                All time
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant='h4' color='warning.main' gutterBottom>
                {totalRuns > 0
                  ? Math.round((successfulRuns / totalRuns) * 100)
                  : 0}
                %
              </Typography>
              <Typography variant='body2'>Success Rate</Typography>
              <Typography variant='caption' color='text.secondary'>
                {successfulRuns}/{totalRuns} successful
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    );
  };

  // ============================================================================
  // MAIN RENDER
  // ============================================================================

  return (
    <Box className={className}>
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 3,
        }}
      >
        <Typography variant='h4' component='h1'>
          Export Scheduler
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Tooltip title='Notifications'>
            <IconButton onClick={handleNotificationClick}>
              <Badge badgeContent={getUnreadNotificationCount()} color='error'>
                <NotificationsIcon />
              </Badge>
            </IconButton>
          </Tooltip>
          <Tooltip title='Refresh'>
            <IconButton onClick={loadSchedules} disabled={loading}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
          <Button
            variant='contained'
            startIcon={<AddIcon />}
            onClick={handleCreateSchedule}
          >
            Create Schedule
          </Button>
        </Box>
      </Box>

      {/* Loading Indicator */}
      {loading && <LinearProgress sx={{ mb: 2 }} />}

      {/* Summary Cards */}
      {renderSummaryCards()}

      {/* Tabs */}
      <Card>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange}>
            <Tab
              label={`Schedules (${schedules.length})`}
              icon={<ScheduleIcon />}
              iconPosition='start'
            />
            <Tab
              label={`Active (${schedules.filter(s => s.isActive).length})`}
              icon={<EventIcon />}
              iconPosition='start'
            />
          </Tabs>
        </Box>

        <TabPanel value={tabValue} index={0}>
          {schedules.length > 0 ? (
            renderSchedulesTable()
          ) : (
            <Alert severity='info'>
              No export schedules configured. Create your first schedule to get
              started.
            </Alert>
          )}
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          {schedules.filter(s => s.isActive).length > 0 ? (
            renderSchedulesTable()
          ) : (
            <Alert severity='info'>
              No active schedules. Activate existing schedules or create new
              ones.
            </Alert>
          )}
        </TabPanel>
      </Card>

      {/* Context Menu */}
      <Menu
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem
          onClick={() => {
            const schedule = schedules.find(s => s.id === selectedScheduleId);
            if (schedule) handleEditSchedule(schedule);
            handleMenuClose();
          }}
        >
          <ListItemIcon>
            <EditIcon fontSize='small' />
          </ListItemIcon>
          <ListItemText>Edit Schedule</ListItemText>
        </MenuItem>
        <MenuItem
          onClick={() => {
            handleExecuteNow(selectedScheduleId);
            handleMenuClose();
          }}
        >
          <ListItemIcon>
            <PlayIcon fontSize='small' />
          </ListItemIcon>
          <ListItemText>Execute Now</ListItemText>
        </MenuItem>
        <Divider />
        <MenuItem
          onClick={() => {
            const schedule = schedules.find(s => s.id === selectedScheduleId);
            if (schedule) handleDeleteSchedule(schedule);
            handleMenuClose();
          }}
          sx={{ color: 'error.main' }}
        >
          <ListItemIcon>
            <DeleteIcon fontSize='small' color='error' />
          </ListItemIcon>
          <ListItemText>Delete Schedule</ListItemText>
        </MenuItem>
      </Menu>

      {/* Schedule Form Dialog */}
      <ExportScheduleForm
        open={scheduleFormOpen}
        onClose={() => setScheduleFormOpen(false)}
        onSubmit={handleScheduleFormSubmit}
        initialData={selectedSchedule}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete the schedule "
            {selectedSchedule?.name}"? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleConfirmDelete}
            color='error'
            variant='contained'
            disabled={loading}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Notification Panel */}
      <NotificationPanel
        open={notificationPanelOpen}
        onClose={() => setNotificationPanelOpen(false)}
        notifications={notifications}
        onMarkRead={id => exportSchedulerService.markNotificationRead(id)}
        onClearAll={() => {
          exportSchedulerService.clearNotifications();
          setNotifications([]);
        }}
      />
    </Box>
  );
};

export default ExportScheduleManager;
