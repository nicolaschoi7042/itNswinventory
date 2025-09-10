import {
  Avatar,
  Box,
  Button,
  Chip,
  Divider,
  IconButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  MenuList,
  Paper,
  Popper,
  Stack,
  Typography,
  useTheme,
  alpha,
  Fade,
  ClickAwayListener,
  Grow,
} from '@mui/material';
import {
  AccountCircle as AccountCircleIcon,
  Logout as LogoutIcon,
  Settings as SettingsIcon,
  Person as PersonIcon,
  Security as SecurityIcon,
  Help as HelpIcon,
  Info as InfoIcon,
  Brightness4 as DarkModeIcon,
  Language as LanguageIcon,
  Notifications as NotificationsIcon,
  KeyboardArrowDown as ArrowDownIcon,
} from '@mui/icons-material';
import { useState, useRef, ReactNode } from 'react';
import type { User } from './Header';

export interface UserMenuAction {
  id: string;
  label: string;
  icon: ReactNode;
  onClick: () => void;
  disabled?: boolean;
  divider?: boolean;
  danger?: boolean;
}

export interface UserMenuProps {
  user: User;
  onLogout: () => void;
  onProfile?: () => void;
  onSettings?: () => void;
  onSecurity?: () => void;
  onHelp?: () => void;
  onAbout?: () => void;
  onThemeToggle?: () => void;
  onLanguageChange?: () => void;
  onNotifications?: () => void;
  customActions?: UserMenuAction[];
  variant?: 'menu' | 'popover' | 'button';
  showRole?: boolean;
  showAvatar?: boolean;
  showArrow?: boolean;
  compact?: boolean;
  placement?: 'bottom-start' | 'bottom-end' | 'top-start' | 'top-end';
}

export function UserMenu({
  user,
  onLogout,
  onProfile,
  onSettings,
  onSecurity,
  onHelp,
  onAbout,
  onThemeToggle,
  onLanguageChange,
  onNotifications,
  customActions = [],
  variant = 'menu',
  showRole = true,
  showAvatar = true,
  showArrow = true,
  compact = false,
  placement = 'bottom-end',
}: UserMenuProps) {
  const theme = useTheme();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [popoverOpen, setPopoverOpen] = useState(false);
  const anchorRef = useRef<HTMLButtonElement>(null);
  const open = Boolean(anchorEl) || popoverOpen;

  const handleOpen = (event: React.MouseEvent<HTMLElement>) => {
    if (variant === 'popover') {
      setPopoverOpen(true);
    } else {
      setAnchorEl(event.currentTarget);
    }
  };

  const handleClose = () => {
    if (variant === 'popover') {
      setPopoverOpen(false);
    } else {
      setAnchorEl(null);
    }
  };

  const handleMenuItemClick = (action: () => void) => {
    action();
    handleClose();
  };

  const getUserDisplayName = (): string => {
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

  // Build default actions list
  const defaultActions: UserMenuAction[] = [
    ...(onProfile
      ? [
          {
            id: 'profile',
            label: '프로필',
            icon: <PersonIcon />,
            onClick: onProfile,
          },
        ]
      : []),
    ...(onSettings
      ? [
          {
            id: 'settings',
            label: '설정',
            icon: <SettingsIcon />,
            onClick: onSettings,
          },
        ]
      : []),
    ...(onSecurity
      ? [
          {
            id: 'security',
            label: '보안',
            icon: <SecurityIcon />,
            onClick: onSecurity,
          },
        ]
      : []),
    ...(onNotifications
      ? [
          {
            id: 'notifications',
            label: '알림 설정',
            icon: <NotificationsIcon />,
            onClick: onNotifications,
          },
        ]
      : []),
    ...(onThemeToggle
      ? [
          {
            id: 'theme',
            label: '테마 변경',
            icon: <DarkModeIcon />,
            onClick: onThemeToggle,
            divider: true,
          },
        ]
      : []),
    ...(onLanguageChange
      ? [
          {
            id: 'language',
            label: '언어 설정',
            icon: <LanguageIcon />,
            onClick: onLanguageChange,
          },
        ]
      : []),
    ...(onHelp
      ? [
          {
            id: 'help',
            label: '도움말',
            icon: <HelpIcon />,
            onClick: onHelp,
          },
        ]
      : []),
    ...(onAbout
      ? [
          {
            id: 'about',
            label: '정보',
            icon: <InfoIcon />,
            onClick: onAbout,
          },
        ]
      : []),
    {
      id: 'logout',
      label: '로그아웃',
      icon: <LogoutIcon />,
      onClick: onLogout,
      danger: true,
      divider: true,
    },
  ];

  const allActions = [...customActions, ...defaultActions];

  const renderUserInfo = () => (
    <Box sx={{ px: 2, py: 1.5, borderBottom: 1, borderColor: 'divider' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
        {showAvatar &&
          (user.avatar ? (
            <Avatar
              src={user.avatar}
              alt={getUserDisplayName()}
              sx={{ width: compact ? 32 : 40, height: compact ? 32 : 40 }}
            />
          ) : (
            <Avatar
              sx={{ width: compact ? 32 : 40, height: compact ? 32 : 40 }}
            >
              {getUserDisplayName().charAt(0).toUpperCase()}
            </Avatar>
          ))}

        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography
            variant={compact ? 'body2' : 'subtitle1'}
            sx={{ fontWeight: 600, lineHeight: 1.2 }}
            noWrap
          >
            {getUserDisplayName()}
          </Typography>

          {user.email && (
            <Typography
              variant='caption'
              color='text.secondary'
              sx={{ display: 'block', lineHeight: 1.2 }}
              noWrap
            >
              {user.email}
            </Typography>
          )}

          {user.department && !compact && (
            <Typography
              variant='caption'
              color='text.secondary'
              sx={{ display: 'block', lineHeight: 1.2 }}
              noWrap
            >
              {user.department}
            </Typography>
          )}
        </Box>
      </Box>

      {showRole && (
        <Box sx={{ mt: 1 }}>
          <Chip
            label={getRoleLabel(user.role)}
            size='small'
            color={getRoleColor(user.role)}
            variant='outlined'
            sx={{ fontSize: '0.7rem' }}
          />

          {user.lastLogin && !compact && (
            <Typography
              variant='caption'
              color='text.secondary'
              sx={{ display: 'block', mt: 0.5 }}
            >
              마지막 로그인:{' '}
              {new Date(user.lastLogin).toLocaleDateString('ko-KR')}
            </Typography>
          )}
        </Box>
      )}
    </Box>
  );

  const renderMenuItem = (action: UserMenuAction) => (
    <MenuItem
      key={action.id}
      onClick={() => handleMenuItemClick(action.onClick)}
      disabled={action.disabled}
      sx={{
        py: 1,
        ...(action.danger && {
          color: 'error.main',
          '&:hover': {
            backgroundColor: alpha(theme.palette.error.main, 0.1),
          },
        }),
      }}
    >
      <ListItemIcon sx={{ color: action.danger ? 'error.main' : 'inherit' }}>
        {action.icon}
      </ListItemIcon>
      <ListItemText>{action.label}</ListItemText>
    </MenuItem>
  );

  const renderMenuContent = () => (
    <>
      {renderUserInfo()}
      <MenuList dense={compact}>
        {allActions.map((action, index) => (
          <Box key={action.id}>
            {action.divider && index > 0 && <Divider />}
            {renderMenuItem(action)}
          </Box>
        ))}
      </MenuList>
    </>
  );

  const renderTrigger = () => {
    const triggerContent = (
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          cursor: 'pointer',
          px: compact ? 0.5 : 1,
          py: 0.5,
          borderRadius: 1,
          minHeight: compact ? 32 : 40,
          '&:hover': {
            backgroundColor: alpha(theme.palette.common.white, 0.1),
          },
        }}
        onClick={handleOpen}
        ref={variant === 'popover' ? anchorRef : undefined}
      >
        {showAvatar &&
          (user.avatar ? (
            <Avatar
              src={user.avatar}
              alt={getUserDisplayName()}
              sx={{ width: compact ? 24 : 32, height: compact ? 24 : 32 }}
            />
          ) : (
            <AccountCircleIcon sx={{ fontSize: compact ? 24 : 32 }} />
          ))}

        {!compact && (
          <Box sx={{ textAlign: 'left', display: { xs: 'none', sm: 'block' } }}>
            <Typography
              variant='body2'
              sx={{ fontWeight: 600, color: 'inherit', lineHeight: 1.2 }}
              noWrap
            >
              {getUserDisplayName()}
            </Typography>
            {showRole && (
              <Typography
                variant='caption'
                sx={{ color: 'inherit', opacity: 0.8, lineHeight: 1.2 }}
                noWrap
              >
                {getRoleLabel(user.role)}
              </Typography>
            )}
          </Box>
        )}

        {showArrow && (
          <ArrowDownIcon
            sx={{
              fontSize: 16,
              transition: 'transform 0.2s',
              transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
            }}
          />
        )}
      </Box>
    );

    if (variant === 'button') {
      return (
        <Button
          onClick={handleOpen}
          startIcon={
            showAvatar ? (
              user.avatar ? (
                <Avatar src={user.avatar} sx={{ width: 24, height: 24 }} />
              ) : (
                <AccountCircleIcon />
              )
            ) : undefined
          }
          endIcon={showArrow ? <ArrowDownIcon /> : undefined}
          sx={{
            textTransform: 'none',
            color: 'inherit',
            justifyContent: 'flex-start',
          }}
        >
          {getUserDisplayName()}
        </Button>
      );
    }

    if (variant === 'popover') {
      return (
        <IconButton onClick={handleOpen} ref={anchorRef} sx={{ p: 0.5 }}>
          {triggerContent}
        </IconButton>
      );
    }

    return triggerContent;
  };

  const renderMenu = () => {
    if (variant === 'popover') {
      return (
        <Popper
          open={popoverOpen}
          anchorEl={anchorRef.current}
          placement={placement}
          transition
          disablePortal
          sx={{ zIndex: theme.zIndex.modal }}
        >
          {({ TransitionProps }) => (
            <Grow {...TransitionProps} timeout={150}>
              <Paper
                sx={{
                  minWidth: 280,
                  maxWidth: 320,
                  boxShadow: theme.shadows[8],
                  mt: 1,
                }}
              >
                <ClickAwayListener onClickAway={handleClose}>
                  <Box>{renderMenuContent()}</Box>
                </ClickAwayListener>
              </Paper>
            </Grow>
          )}
        </Popper>
      );
    }

    return (
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        TransitionComponent={Fade}
        PaperProps={{
          sx: {
            minWidth: 280,
            maxWidth: 320,
            mt: 1,
          },
        }}
      >
        {renderMenuContent()}
      </Menu>
    );
  };

  return (
    <>
      {renderTrigger()}
      {renderMenu()}
    </>
  );
}

// Compact user menu for headers and toolbars
export function CompactUserMenu(props: Omit<UserMenuProps, 'compact'>) {
  return <UserMenu {...props} compact showArrow={false} />;
}

// User menu button variant
export function UserMenuButton(props: Omit<UserMenuProps, 'variant'>) {
  return <UserMenu {...props} variant='button' />;
}

// User menu with popover
export function UserMenuPopover(props: Omit<UserMenuProps, 'variant'>) {
  return <UserMenu {...props} variant='popover' />;
}

// Hook for user menu state
export function useUserMenuState() {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [user, setUser] = useState<User | null>(null);

  const openMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const closeMenu = () => {
    setAnchorEl(null);
  };

  const updateUser = (newUser: User | null) => {
    setUser(newUser);
  };

  return {
    anchorEl,
    open: Boolean(anchorEl),
    user,
    openMenu,
    closeMenu,
    updateUser,
  };
}

// User menu utilities
export const userMenuUtils = {
  // Create custom action
  createAction: (
    id: string,
    label: string,
    icon: ReactNode,
    onClick: () => void,
    options?: Partial<UserMenuAction>
  ): UserMenuAction => ({
    id,
    label,
    icon,
    onClick,
    ...options,
  }),

  // Create divider action
  createDivider: (id: string): UserMenuAction => ({
    id,
    label: '',
    icon: null,
    onClick: () => {},
    divider: true,
    disabled: true,
  }),

  // Group actions with dividers
  groupActions: (groups: UserMenuAction[][]): UserMenuAction[] => {
    return groups.reduce((acc, group, index) => {
      if (index > 0) {
        acc.push(userMenuUtils.createDivider(`divider-${index}`));
      }
      return acc.concat(group);
    }, [] as UserMenuAction[]);
  },

  // Get user initials for avatar
  getUserInitials: (user: User): string => {
    const name = user.fullName || user.username || 'U';
    return name
      .split(' ')
      .map(word => word.charAt(0).toUpperCase())
      .slice(0, 2)
      .join('');
  },
};
