import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Chip,
  Stack,
  Badge,
  Tooltip,
  useTheme,
  alpha,
} from '@mui/material';
import {
  Laptop as LaptopIcon,
  AccountCircle as AccountCircleIcon,
  Logout as LogoutIcon,
  Settings as SettingsIcon,
  Person as PersonIcon,
  Notifications as NotificationsIcon,
  Menu as MenuIcon,
  Refresh as RefreshIcon,
  Info as InfoIcon,
} from '@mui/icons-material';
import { useState, ReactNode } from 'react';

// Types for user and stats
export interface User {
  id: string;
  username: string;
  fullName?: string;
  email?: string;
  role: 'admin' | 'manager' | 'user';
  department?: string;
  lastLogin?: string;
  avatar?: string;
}

export interface HeaderStats {
  totalEmployees: number;
  totalHardware: number;
  totalSoftware: number;
  totalAssignments: number;
}

export interface HeaderProps {
  title?: string;
  user?: User;
  stats?: HeaderStats;
  showStats?: boolean;
  showNotifications?: boolean;
  showRefresh?: boolean;
  onLogout?: () => void;
  onUserProfile?: () => void;
  onSettings?: () => void;
  onRefresh?: () => void;
  onNotificationClick?: () => void;
  onMenuToggle?: () => void;
  notificationCount?: number;
  loading?: boolean;
  variant?: 'default' | 'compact';
  elevation?: number;
  children?: ReactNode;
}

export function Header({
  title = 'IT 자산 및 SW 인벤토리 관리시스템',
  user,
  stats,
  showStats = true,
  showNotifications = true,
  showRefresh = true,
  onLogout,
  onUserProfile,
  onSettings,
  onRefresh,
  onNotificationClick,
  onMenuToggle,
  notificationCount = 0,
  loading = false,
  variant = 'default',
  elevation = 1,
  children,
}: HeaderProps) {
  const theme = useTheme();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [notificationAnchorEl, setNotificationAnchorEl] =
    useState<null | HTMLElement>(null);

  const handleUserMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleUserMenuClose = () => {
    setAnchorEl(null);
  };

  const handleNotificationMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setNotificationAnchorEl(event.currentTarget);
    onNotificationClick?.();
  };

  const handleNotificationMenuClose = () => {
    setNotificationAnchorEl(null);
  };

  const handleLogout = () => {
    handleUserMenuClose();
    onLogout?.();
  };

  const handleUserProfile = () => {
    handleUserMenuClose();
    onUserProfile?.();
  };

  const handleSettings = () => {
    handleUserMenuClose();
    onSettings?.();
  };

  const getUserDisplayName = (): string => {
    if (!user) return '사용자';
    return user.fullName || user.username || '사용자';
  };

  const getRoleLabel = (role: string): string => {
    const roleLabels = {
      admin: '관리자',
      manager: '매니저',
      user: '사용자',
    };
    return roleLabels[role as keyof typeof roleLabels] || role;
  };

  const getRoleColor = (
    role: string
  ):
    | 'default'
    | 'primary'
    | 'secondary'
    | 'error'
    | 'info'
    | 'success'
    | 'warning' => {
    const roleColors = {
      admin: 'error' as const,
      manager: 'warning' as const,
      user: 'info' as const,
    };
    return roleColors[role as keyof typeof roleColors] || 'default';
  };

  const renderStats = () => {
    if (!showStats || !stats || variant === 'compact') return null;

    return (
      <Stack direction='row' spacing={3} sx={{ mr: 3 }}>
        <Box sx={{ textAlign: 'center' }}>
          <Typography
            variant='h6'
            sx={{ fontWeight: 700, color: 'primary.main' }}
          >
            {stats.totalEmployees.toLocaleString()}
          </Typography>
          <Typography variant='caption' color='text.secondary'>
            임직원
          </Typography>
        </Box>

        <Box sx={{ textAlign: 'center' }}>
          <Typography
            variant='h6'
            sx={{ fontWeight: 700, color: 'secondary.main' }}
          >
            {stats.totalHardware.toLocaleString()}
          </Typography>
          <Typography variant='caption' color='text.secondary'>
            하드웨어
          </Typography>
        </Box>

        <Box sx={{ textAlign: 'center' }}>
          <Typography variant='h6' sx={{ fontWeight: 700, color: 'info.main' }}>
            {stats.totalSoftware.toLocaleString()}
          </Typography>
          <Typography variant='caption' color='text.secondary'>
            소프트웨어
          </Typography>
        </Box>

        <Box sx={{ textAlign: 'center' }}>
          <Typography
            variant='h6'
            sx={{ fontWeight: 700, color: 'success.main' }}
          >
            {stats.totalAssignments.toLocaleString()}
          </Typography>
          <Typography variant='caption' color='text.secondary'>
            할당
          </Typography>
        </Box>
      </Stack>
    );
  };

  const renderUserMenu = () => {
    if (!user) return null;

    return (
      <>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            cursor: 'pointer',
            px: 1,
            py: 0.5,
            borderRadius: 1,
            '&:hover': {
              backgroundColor: alpha(theme.palette.common.white, 0.1),
            },
          }}
          onClick={handleUserMenuOpen}
        >
          {user.avatar ? (
            <img
              src={user.avatar}
              alt={getUserDisplayName()}
              style={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                objectFit: 'cover',
              }}
            />
          ) : (
            <AccountCircleIcon sx={{ fontSize: 32 }} />
          )}

          <Box sx={{ textAlign: 'left' }}>
            <Typography
              variant='body2'
              sx={{ fontWeight: 600, color: 'inherit' }}
            >
              {getUserDisplayName()}
            </Typography>
            <Chip
              label={getRoleLabel(user.role)}
              size='small'
              color={getRoleColor(user.role)}
              variant='outlined'
              sx={{
                height: 16,
                fontSize: '0.65rem',
                '& .MuiChip-label': { px: 0.5 },
              }}
            />
          </Box>
        </Box>

        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleUserMenuClose}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          PaperProps={{
            sx: {
              mt: 1,
              minWidth: 200,
            },
          }}
        >
          <Box sx={{ px: 2, py: 1, borderBottom: 1, borderColor: 'divider' }}>
            <Typography variant='subtitle2' sx={{ fontWeight: 600 }}>
              {getUserDisplayName()}
            </Typography>
            <Typography variant='caption' color='text.secondary'>
              {user.email || user.username}
            </Typography>
            {user.department && (
              <Typography
                variant='caption'
                color='text.secondary'
                sx={{ display: 'block' }}
              >
                {user.department}
              </Typography>
            )}
            {user.lastLogin && (
              <Typography
                variant='caption'
                color='text.secondary'
                sx={{ display: 'block' }}
              >
                마지막 로그인:{' '}
                {new Date(user.lastLogin).toLocaleDateString('ko-KR')}
              </Typography>
            )}
          </Box>

          {onUserProfile && (
            <MenuItem onClick={handleUserProfile}>
              <ListItemIcon>
                <PersonIcon fontSize='small' />
              </ListItemIcon>
              <ListItemText>프로필</ListItemText>
            </MenuItem>
          )}

          {onSettings && (
            <MenuItem onClick={handleSettings}>
              <ListItemIcon>
                <SettingsIcon fontSize='small' />
              </ListItemIcon>
              <ListItemText>설정</ListItemText>
            </MenuItem>
          )}

          <MenuItem onClick={handleLogout}>
            <ListItemIcon>
              <LogoutIcon fontSize='small' />
            </ListItemIcon>
            <ListItemText>로그아웃</ListItemText>
          </MenuItem>
        </Menu>
      </>
    );
  };

  const renderNotifications = () => {
    if (!showNotifications) return null;

    return (
      <Tooltip title='알림'>
        <IconButton
          color='inherit'
          onClick={handleNotificationMenuOpen}
          sx={{ mr: 1 }}
        >
          <Badge badgeContent={notificationCount} color='error' max={99}>
            <NotificationsIcon />
          </Badge>
        </IconButton>
      </Tooltip>
    );
  };

  const renderActions = () => (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      {showRefresh && (
        <Tooltip title='새로고침'>
          <IconButton
            color='inherit'
            onClick={onRefresh}
            disabled={loading}
            sx={{ mr: 1 }}
          >
            <RefreshIcon />
          </IconButton>
        </Tooltip>
      )}

      {renderNotifications()}
      {renderUserMenu()}

      {onMenuToggle && (
        <Tooltip title='메뉴'>
          <IconButton color='inherit' onClick={onMenuToggle} sx={{ ml: 1 }}>
            <MenuIcon />
          </IconButton>
        </Tooltip>
      )}
    </Box>
  );

  return (
    <AppBar
      position='sticky'
      elevation={elevation}
      sx={{
        backgroundColor: 'primary.main',
        color: 'primary.contrastText',
      }}
    >
      <Toolbar
        sx={{
          minHeight: variant === 'compact' ? 56 : 64,
          px: { xs: 2, sm: 3 },
        }}
      >
        {/* Logo and Title */}
        <Box sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>
          <LaptopIcon sx={{ mr: 1, fontSize: 28 }} />
          <Typography
            variant={variant === 'compact' ? 'h6' : 'h5'}
            sx={{
              fontWeight: 600,
              display: { xs: 'none', sm: 'block' },
              ...(variant === 'compact' && {
                fontSize: '1.1rem',
              }),
            }}
          >
            {title}
          </Typography>
          <Typography
            variant='h6'
            sx={{
              fontWeight: 600,
              display: { xs: 'block', sm: 'none' },
              fontSize: '1rem',
            }}
          >
            IT 자산관리
          </Typography>
        </Box>

        {/* Spacer */}
        <Box sx={{ flexGrow: 1 }} />

        {/* Stats */}
        {renderStats()}

        {/* Custom children */}
        {children}

        {/* Actions */}
        {renderActions()}
      </Toolbar>
    </AppBar>
  );
}

// Compact header variant for mobile/small screens
export function CompactHeader(props: Omit<HeaderProps, 'variant'>) {
  return <Header {...props} variant='compact' showStats={false} />;
}

// Header with minimal features for login/error pages
interface SimpleHeaderProps {
  title?: string;
  showLogo?: boolean;
  elevation?: number;
  children?: ReactNode;
}

export function SimpleHeader({
  title = 'IT 자산 관리시스템',
  showLogo = true,
  elevation = 0,
  children,
}: SimpleHeaderProps) {
  return (
    <AppBar
      position='static'
      elevation={elevation}
      sx={{
        backgroundColor: 'primary.main',
        color: 'primary.contrastText',
      }}
    >
      <Toolbar sx={{ minHeight: 56, px: { xs: 2, sm: 3 } }}>
        {showLogo && (
          <Box sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>
            <LaptopIcon sx={{ mr: 1, fontSize: 24 }} />
            <Typography
              variant='h6'
              sx={{
                fontWeight: 600,
                fontSize: '1rem',
              }}
            >
              {title}
            </Typography>
          </Box>
        )}

        <Box sx={{ flexGrow: 1 }} />
        {children}
      </Toolbar>
    </AppBar>
  );
}

// Hook for header state management
export function useHeaderState() {
  const [user, setUser] = useState<User | null>(null);
  const [stats, setStats] = useState<HeaderStats>({
    totalEmployees: 0,
    totalHardware: 0,
    totalSoftware: 0,
    totalAssignments: 0,
  });
  const [notificationCount, setNotificationCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const updateStats = (newStats: Partial<HeaderStats>) => {
    setStats(prev => ({ ...prev, ...newStats }));
  };

  const refreshStats = async (fetchFn?: () => Promise<HeaderStats>) => {
    if (!fetchFn) return;

    setLoading(true);
    try {
      const newStats = await fetchFn();
      setStats(newStats);
    } catch (error) {
      console.error('Failed to refresh header stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateUser = (newUser: User | null) => {
    setUser(newUser);
  };

  const updateNotificationCount = (count: number) => {
    setNotificationCount(count);
  };

  return {
    user,
    stats,
    notificationCount,
    loading,
    updateStats,
    refreshStats,
    updateUser,
    updateNotificationCount,
  };
}
