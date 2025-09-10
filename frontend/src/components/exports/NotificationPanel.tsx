/**
 * Notification Panel Component
 *
 * Displays export notifications with filtering and management capabilities
 */

import React, { useState } from 'react';
import {
  Drawer,
  Box,
  Typography,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  Avatar,
  Chip,
  Button,
  Divider,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Card,
  CardContent,
  Badge,
  Tooltip,
  Menu,
  MenuList,
  MenuItem as MenuItemComponent,
  ListItemButton,
} from '@mui/material';
import {
  Close as CloseIcon,
  Search as SearchIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  Download as DownloadIcon,
  Schedule as ScheduleIcon,
  MoreVert as MoreVertIcon,
  MarkEmailRead as MarkEmailReadIcon,
  DeleteSweep as DeleteSweepIcon,
  FilterList as FilterListIcon,
  Notifications as NotificationsIcon,
  NotificationsOff as NotificationsOffIcon,
} from '@mui/icons-material';
import { formatDistanceToNow } from 'date-fns';
import type { ExportNotification } from '@/types/export';

// ============================================================================
// TYPES AND INTERFACES
// ============================================================================

interface NotificationPanelProps {
  open: boolean;
  onClose: () => void;
  notifications: ExportNotification[];
  onMarkRead: (notificationId: string) => void;
  onClearAll: () => void;
}

type NotificationFilter = 'all' | 'unread' | 'success' | 'error' | 'warning';

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export const NotificationPanel: React.FC<NotificationPanelProps> = ({
  open,
  onClose,
  notifications,
  onMarkRead,
  onClearAll,
}) => {
  // ============================================================================
  // STATE MANAGEMENT
  // ============================================================================

  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<NotificationFilter>('all');
  const [selectedNotification, setSelectedNotification] =
    useState<ExportNotification | null>(null);
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);

  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================

  const filteredNotifications = notifications.filter(notification => {
    // Apply search filter
    const searchMatch =
      !searchTerm ||
      notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notification.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notification.scheduleName
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

    if (!searchMatch) return false;

    // Apply type filter
    switch (filter) {
      case 'unread':
        return !notification.read;
      case 'success':
        return notification.type === 'success';
      case 'error':
        return notification.type === 'error';
      case 'warning':
        return notification.type === 'warning';
      default:
        return true;
    }
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================

  const handleNotificationClick = (notification: ExportNotification) => {
    if (!notification.read) {
      onMarkRead(notification.id);
    }
    setSelectedNotification(notification);
  };

  const handleMenuClick = (
    event: React.MouseEvent<HTMLElement>,
    notification: ExportNotification
  ) => {
    event.stopPropagation();
    setMenuAnchorEl(event.currentTarget);
    setSelectedNotification(notification);
  };

  const handleMenuClose = () => {
    setMenuAnchorEl(null);
    setSelectedNotification(null);
  };

  const handleMarkAsRead = () => {
    if (selectedNotification && !selectedNotification.read) {
      onMarkRead(selectedNotification.id);
    }
    handleMenuClose();
  };

  const handleDownloadFile = () => {
    if (selectedNotification?.data?.fileName) {
      // In real implementation, trigger file download
      console.log('Download file:', selectedNotification.data.fileName);
    }
    handleMenuClose();
  };

  // ============================================================================
  // UTILITY FUNCTIONS
  // ============================================================================

  const getNotificationIcon = (type: ExportNotification['type']) => {
    switch (type) {
      case 'success':
        return <CheckCircleIcon color='success' />;
      case 'error':
        return <ErrorIcon color='error' />;
      case 'warning':
        return <WarningIcon color='warning' />;
      case 'info':
      default:
        return <InfoIcon color='info' />;
    }
  };

  const getNotificationColor = (type: ExportNotification['type']) => {
    switch (type) {
      case 'success':
        return 'success';
      case 'error':
        return 'error';
      case 'warning':
        return 'warning';
      case 'info':
      default:
        return 'info';
    }
  };

  const formatTimestamp = (timestamp: Date): string => {
    return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
  };

  const formatFileSize = (bytes: number): string => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + ' ' + sizes[i];
  };

  // ============================================================================
  // RENDER METHODS
  // ============================================================================

  const renderNotificationItem = (notification: ExportNotification) => (
    <ListItem
      key={notification.id}
      sx={{
        bgcolor: notification.read ? 'transparent' : 'action.hover',
        borderLeft: `4px solid`,
        borderLeftColor: `${getNotificationColor(notification.type)}.main`,
        mb: 1,
        borderRadius: 1,
        '&:hover': {
          bgcolor: 'action.selected',
        },
      }}
    >
      <ListItemButton onClick={() => handleNotificationClick(notification)}>
        <ListItemIcon>
          <Avatar
            sx={{
              bgcolor: `${getNotificationColor(notification.type)}.light`,
              width: 40,
              height: 40,
            }}
          >
            {getNotificationIcon(notification.type)}
          </Avatar>
        </ListItemIcon>

        <ListItemText
          primary={
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography
                variant='subtitle2'
                fontWeight={notification.read ? 'normal' : 'bold'}
                noWrap
              >
                {notification.title}
              </Typography>
              {!notification.read && <Badge color='primary' variant='dot' />}
            </Box>
          }
          secondary={
            <Box>
              <Typography
                variant='body2'
                color='text.secondary'
                sx={{ mb: 0.5 }}
              >
                {notification.message}
              </Typography>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  flexWrap: 'wrap',
                }}
              >
                <Chip
                  label={notification.scheduleName}
                  size='small'
                  variant='outlined'
                  icon={<ScheduleIcon />}
                />
                <Typography variant='caption' color='text.secondary'>
                  {formatTimestamp(notification.timestamp)}
                </Typography>
                {notification.data?.fileSize && (
                  <Typography variant='caption' color='text.secondary'>
                    • {formatFileSize(notification.data.fileSize)}
                  </Typography>
                )}
                {notification.data?.recordCount && (
                  <Typography variant='caption' color='text.secondary'>
                    • {notification.data.recordCount} records
                  </Typography>
                )}
              </Box>
            </Box>
          }
        />

        <ListItemSecondaryAction>
          <IconButton
            size='small'
            onClick={e => handleMenuClick(e, notification)}
          >
            <MoreVertIcon />
          </IconButton>
        </ListItemSecondaryAction>
      </ListItemButton>
    </ListItem>
  );

  const renderEmptyState = () => (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: 200,
        textAlign: 'center',
        color: 'text.secondary',
      }}
    >
      <NotificationsOffIcon sx={{ fontSize: 64, mb: 2, opacity: 0.5 }} />
      <Typography variant='h6' gutterBottom>
        No notifications
      </Typography>
      <Typography variant='body2'>
        {filter === 'unread'
          ? "You're all caught up! No unread notifications."
          : 'Export notifications will appear here.'}
      </Typography>
    </Box>
  );

  const renderFilterControls = () => (
    <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
      {/* Search */}
      <TextField
        fullWidth
        size='small'
        placeholder='Search notifications...'
        value={searchTerm}
        onChange={e => setSearchTerm(e.target.value)}
        InputProps={{
          startAdornment: (
            <InputAdornment position='start'>
              <SearchIcon />
            </InputAdornment>
          ),
        }}
        sx={{ mb: 2 }}
      />

      {/* Filter */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <FormControl size='small' sx={{ minWidth: 120 }}>
          <InputLabel>Filter</InputLabel>
          <Select
            value={filter}
            label='Filter'
            onChange={e => setFilter(e.target.value as NotificationFilter)}
          >
            <MenuItem value='all'>All</MenuItem>
            <MenuItem value='unread'>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                Unread
                {unreadCount > 0 && (
                  <Chip label={unreadCount} size='small' color='primary' />
                )}
              </Box>
            </MenuItem>
            <MenuItem value='success'>Success</MenuItem>
            <MenuItem value='error'>Error</MenuItem>
            <MenuItem value='warning'>Warning</MenuItem>
          </Select>
        </FormControl>

        {notifications.length > 0 && (
          <Button
            size='small'
            startIcon={<DeleteSweepIcon />}
            onClick={onClearAll}
            color='error'
          >
            Clear All
          </Button>
        )}
      </Box>
    </Box>
  );

  const renderNotificationDetails = () => {
    if (!selectedNotification) return null;

    return (
      <Card sx={{ m: 2 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            {getNotificationIcon(selectedNotification.type)}
            <Box>
              <Typography variant='h6'>{selectedNotification.title}</Typography>
              <Typography variant='body2' color='text.secondary'>
                {selectedNotification.scheduleName} •{' '}
                {formatTimestamp(selectedNotification.timestamp)}
              </Typography>
            </Box>
          </Box>

          <Typography variant='body1' sx={{ mb: 2 }}>
            {selectedNotification.message}
          </Typography>

          {selectedNotification.data && (
            <Box>
              <Typography variant='subtitle2' gutterBottom>
                Details:
              </Typography>

              {selectedNotification.data.fileName && (
                <Typography variant='body2'>
                  <strong>File:</strong> {selectedNotification.data.fileName}
                </Typography>
              )}

              {selectedNotification.data.fileSize && (
                <Typography variant='body2'>
                  <strong>Size:</strong>{' '}
                  {formatFileSize(selectedNotification.data.fileSize)}
                </Typography>
              )}

              {selectedNotification.data.recordCount && (
                <Typography variant='body2'>
                  <strong>Records:</strong>{' '}
                  {selectedNotification.data.recordCount}
                </Typography>
              )}

              {selectedNotification.data.executionTime && (
                <Typography variant='body2'>
                  <strong>Execution Time:</strong>{' '}
                  {selectedNotification.data.executionTime}ms
                </Typography>
              )}

              {selectedNotification.data.error && (
                <Alert severity='error' sx={{ mt: 2 }}>
                  <Typography variant='body2'>
                    {selectedNotification.data.error}
                  </Typography>
                </Alert>
              )}
            </Box>
          )}
        </CardContent>
      </Card>
    );
  };

  // ============================================================================
  // MAIN RENDER
  // ============================================================================

  return (
    <>
      <Drawer
        anchor='right'
        open={open}
        onClose={onClose}
        PaperProps={{
          sx: { width: 400 },
        }}
      >
        {/* Header */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            p: 2,
            borderBottom: 1,
            borderColor: 'divider',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <NotificationsIcon />
            <Typography variant='h6'>Notifications</Typography>
            {unreadCount > 0 && (
              <Chip label={unreadCount} size='small' color='primary' />
            )}
          </Box>
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>

        {/* Filter Controls */}
        {renderFilterControls()}

        {/* Notification List */}
        <Box sx={{ flex: 1, overflow: 'auto' }}>
          {filteredNotifications.length > 0 ? (
            <List sx={{ p: 1 }}>
              {filteredNotifications.map(renderNotificationItem)}
            </List>
          ) : (
            renderEmptyState()
          )}
        </Box>

        {/* Selected Notification Details */}
        {selectedNotification && renderNotificationDetails()}
      </Drawer>

      {/* Context Menu */}
      <Menu
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={handleMenuClose}
      >
        <MenuList>
          {selectedNotification && !selectedNotification.read && (
            <MenuItemComponent onClick={handleMarkAsRead}>
              <ListItemIcon>
                <MarkEmailReadIcon fontSize='small' />
              </ListItemIcon>
              <ListItemText>Mark as Read</ListItemText>
            </MenuItemComponent>
          )}

          {selectedNotification?.data?.fileName && (
            <MenuItemComponent onClick={handleDownloadFile}>
              <ListItemIcon>
                <DownloadIcon fontSize='small' />
              </ListItemIcon>
              <ListItemText>Download File</ListItemText>
            </MenuItemComponent>
          )}
        </MenuList>
      </Menu>
    </>
  );
};

export default NotificationPanel;
