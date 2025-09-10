/**
 * User Data Table Component
 *
 * A comprehensive data table for user management with sorting, pagination,
 * filtering, and role-based actions. Integrates with the existing DataTable
 * infrastructure while providing user-specific functionality.
 */

import React, { useState, useMemo, useCallback } from 'react';
import {
  Box,
  Chip,
  IconButton,
  Tooltip,
  Avatar,
  Typography,
  Stack,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Alert,
  CircularProgress,
  useTheme,
  alpha,
} from '@mui/material';
import {
  MoreVert as MoreIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Lock as LockIcon,
  LockOpen as UnlockIcon,
  PersonOff as DeactivateIcon,
  PersonAdd as ActivateIcon,
  Key as ResetPasswordIcon,
  Visibility as ViewIcon,
  Download as ExportIcon,
  AdminPanelSettings as AdminIcon,
  ManageAccounts as ManagerIcon,
  Person as UserIcon,
  Schedule as ScheduleIcon,
  CheckCircle as CheckIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';

import { DataTable, type Column } from './DataTable';
import { AdminGuard, ManagerGuard } from '@/components/guards/RoleGuards';
import { useAuth } from '@/hooks/useAuth';
import type { User, UserRole, UserStatus } from '@/types/user';
import {
  formatUserDisplayName,
  getUserInitials,
  formatLastLogin,
  getUserStatusInfo,
  isUserLocked,
  canPerformUserAction,
} from '@/utils/user.utils';
import {
  USER_ROLE_LABELS,
  USER_STATUS_LABELS,
  ROLE_COLORS,
  STATUS_COLORS,
} from '@/constants/user.constants';

// ============================================================================
// TYPES AND INTERFACES
// ============================================================================

interface UserTableProps {
  users: User[];
  loading?: boolean;
  onEdit?: (user: User) => void;
  onDelete?: (user: User) => void;
  onView?: (user: User) => void;
  onActivate?: (user: User) => void;
  onDeactivate?: (user: User) => void;
  onLock?: (user: User) => void;
  onUnlock?: (user: User) => void;
  onResetPassword?: (user: User) => void;
  onExport?: (users: User[]) => void;
  onRoleChange?: (user: User, newRole: UserRole) => void;
  selectedUsers?: string[];
  onSelectionChange?: (selectedIds: string[]) => void;
  enableSelection?: boolean;
  dense?: boolean;
  maxHeight?: string | number;
}

interface UserRowActionsProps {
  user: User;
  onEdit?: (user: User) => void;
  onDelete?: (user: User) => void;
  onView?: (user: User) => void;
  onActivate?: (user: User) => void;
  onDeactivate?: (user: User) => void;
  onLock?: (user: User) => void;
  onUnlock?: (user: User) => void;
  onResetPassword?: (user: User) => void;
  onRoleChange?: (user: User, newRole: UserRole) => void;
}

// ============================================================================
// USER ROW ACTIONS COMPONENT
// ============================================================================

function UserRowActions({
  user,
  onEdit,
  onDelete,
  onView,
  onActivate,
  onDeactivate,
  onLock,
  onUnlock,
  onResetPassword,
  onRoleChange,
}: UserRowActionsProps) {
  const { user: currentUser } = useAuth();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [roleMenuAnchor, setRoleMenuAnchor] = useState<null | HTMLElement>(
    null
  );

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setRoleMenuAnchor(null);
  };

  const handleRoleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    event.stopPropagation();
    setRoleMenuAnchor(event.currentTarget);
  };

  if (!currentUser) return null;

  const statusInfo = getUserStatusInfo(user);
  const canEdit = canPerformUserAction(currentUser, user, 'canEditUsers');
  const canDelete = canPerformUserAction(currentUser, user, 'canDeleteUsers');
  const canManageRoles = canPerformUserAction(
    currentUser,
    user,
    'canManageRoles'
  );
  const canResetPwd = canPerformUserAction(
    currentUser,
    user,
    'canResetPasswords'
  );
  const canActivate = canPerformUserAction(
    currentUser,
    user,
    'canActivateUsers'
  );
  const canDeactivate = canPerformUserAction(
    currentUser,
    user,
    'canDeactivateUsers'
  );

  // Prevent self-actions for critical operations
  const isSelf = currentUser.id === user.id;

  return (
    <>
      <Tooltip title='작업'>
        <IconButton
          size='small'
          onClick={handleMenuOpen}
          aria-label={`${user.username} 작업`}
        >
          <MoreIcon />
        </IconButton>
      </Tooltip>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        {/* View Action - Available to all */}
        <MenuItem
          onClick={() => {
            onView?.(user);
            handleMenuClose();
          }}
        >
          <ListItemIcon>
            <ViewIcon fontSize='small' />
          </ListItemIcon>
          <ListItemText primary='상세 보기' />
        </MenuItem>

        {/* Edit Actions */}
        {canEdit && (
          <MenuItem
            onClick={() => {
              onEdit?.(user);
              handleMenuClose();
            }}
          >
            <ListItemIcon>
              <EditIcon fontSize='small' />
            </ListItemIcon>
            <ListItemText primary='편집' />
          </MenuItem>
        )}

        {/* Role Management */}
        {canManageRoles && !isSelf && (
          <MenuItem onClick={handleRoleMenuOpen}>
            <ListItemIcon>
              <AdminIcon fontSize='small' />
            </ListItemIcon>
            <ListItemText primary='역할 변경' />
          </MenuItem>
        )}

        <Divider />

        {/* Status Actions */}
        {canActivate && user.status !== 'active' && (
          <MenuItem
            onClick={() => {
              onActivate?.(user);
              handleMenuClose();
            }}
          >
            <ListItemIcon>
              <ActivateIcon fontSize='small' />
            </ListItemIcon>
            <ListItemText primary='활성화' />
          </MenuItem>
        )}

        {canDeactivate && user.status === 'active' && !isSelf && (
          <MenuItem
            onClick={() => {
              onDeactivate?.(user);
              handleMenuClose();
            }}
          >
            <ListItemIcon>
              <DeactivateIcon fontSize='small' />
            </ListItemIcon>
            <ListItemText primary='비활성화' />
          </MenuItem>
        )}

        {/* Lock/Unlock Actions */}
        {statusInfo.isLocked && canActivate && (
          <MenuItem
            onClick={() => {
              onUnlock?.(user);
              handleMenuClose();
            }}
          >
            <ListItemIcon>
              <UnlockIcon fontSize='small' />
            </ListItemIcon>
            <ListItemText primary='잠금 해제' />
          </MenuItem>
        )}

        {!statusInfo.isLocked && canDeactivate && !isSelf && (
          <MenuItem
            onClick={() => {
              onLock?.(user);
              handleMenuClose();
            }}
          >
            <ListItemIcon>
              <LockIcon fontSize='small' />
            </ListItemIcon>
            <ListItemText primary='계정 잠금' />
          </MenuItem>
        )}

        {/* Password Reset */}
        {canResetPwd && (
          <MenuItem
            onClick={() => {
              onResetPassword?.(user);
              handleMenuClose();
            }}
          >
            <ListItemIcon>
              <ResetPasswordIcon fontSize='small' />
            </ListItemIcon>
            <ListItemText primary='비밀번호 재설정' />
          </MenuItem>
        )}

        <Divider />

        {/* Delete Action */}
        <AdminGuard>
          {canDelete && !isSelf && (
            <MenuItem
              onClick={() => {
                onDelete?.(user);
                handleMenuClose();
              }}
              sx={{ color: 'error.main' }}
            >
              <ListItemIcon>
                <DeleteIcon fontSize='small' color='error' />
              </ListItemIcon>
              <ListItemText primary='삭제' />
            </MenuItem>
          )}
        </AdminGuard>
      </Menu>

      {/* Role Change Submenu */}
      <Menu
        anchorEl={roleMenuAnchor}
        open={Boolean(roleMenuAnchor)}
        onClose={handleMenuClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        {(['admin', 'manager', 'user'] as UserRole[]).map(role => (
          <MenuItem
            key={role}
            onClick={() => {
              onRoleChange?.(user, role);
              handleMenuClose();
            }}
            disabled={user.role === role}
          >
            <ListItemIcon>
              {role === 'admin' && <AdminIcon fontSize='small' />}
              {role === 'manager' && <ManagerIcon fontSize='small' />}
              {role === 'user' && <UserIcon fontSize='small' />}
            </ListItemIcon>
            <ListItemText primary={USER_ROLE_LABELS[role]} />
          </MenuItem>
        ))}
      </Menu>
    </>
  );
}

// ============================================================================
// UTILITY COMPONENTS
// ============================================================================

/**
 * User Avatar Component
 */
function UserAvatar({ user }: { user: User }) {
  const theme = useTheme();
  const initials = getUserInitials(user);
  const statusInfo = getUserStatusInfo(user);

  return (
    <Box sx={{ position: 'relative', display: 'inline-block' }}>
      <Avatar
        sx={{
          width: 40,
          height: 40,
          bgcolor: statusInfo.canLogin ? 'primary.main' : 'grey.400',
          fontSize: '0.875rem',
          fontWeight: 600,
        }}
      >
        {initials}
      </Avatar>

      {/* Status indicator */}
      <Box
        sx={{
          position: 'absolute',
          bottom: 0,
          right: 0,
          width: 12,
          height: 12,
          borderRadius: '50%',
          border: `2px solid ${theme.palette.background.paper}`,
          bgcolor: STATUS_COLORS[user.status],
        }}
      />
    </Box>
  );
}

/**
 * Role Chip Component
 */
function RoleChip({ role }: { role: UserRole }) {
  const theme = useTheme();

  const getRoleIcon = () => {
    switch (role) {
      case 'admin':
        return <AdminIcon sx={{ fontSize: 16 }} />;
      case 'manager':
        return <ManagerIcon sx={{ fontSize: 16 }} />;
      case 'user':
        return <UserIcon sx={{ fontSize: 16 }} />;
    }
  };

  return (
    <Chip
      icon={getRoleIcon()}
      label={USER_ROLE_LABELS[role]}
      size='small'
      sx={{
        bgcolor: alpha(ROLE_COLORS[role], 0.1),
        color: ROLE_COLORS[role],
        border: `1px solid ${alpha(ROLE_COLORS[role], 0.3)}`,
        fontWeight: 500,
        '& .MuiChip-icon': {
          color: ROLE_COLORS[role],
        },
      }}
    />
  );
}

/**
 * Status Chip Component
 */
function StatusChip({ user }: { user: User }) {
  const statusInfo = getUserStatusInfo(user);

  const getStatusIcon = () => {
    if (statusInfo.isLocked) return <ErrorIcon sx={{ fontSize: 16 }} />;
    if (!statusInfo.canLogin) return <WarningIcon sx={{ fontSize: 16 }} />;
    return <CheckIcon sx={{ fontSize: 16 }} />;
  };

  const getStatusColor = () => {
    if (statusInfo.isLocked) return 'error';
    if (!statusInfo.canLogin) return 'warning';
    return 'success';
  };

  return (
    <Tooltip title={statusInfo.reason || statusInfo.label}>
      <Chip
        icon={getStatusIcon()}
        label={statusInfo.label}
        size='small'
        color={getStatusColor() as 'success' | 'warning' | 'error'}
        variant={statusInfo.canLogin ? 'filled' : 'outlined'}
      />
    </Tooltip>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function UserTable({
  users,
  loading = false,
  onEdit,
  onDelete,
  onView,
  onActivate,
  onDeactivate,
  onLock,
  onUnlock,
  onResetPassword,
  onExport,
  onRoleChange,
  selectedUsers = [],
  onSelectionChange,
  enableSelection = false,
  dense = false,
  maxHeight = 600,
}: UserTableProps) {
  const theme = useTheme();

  // Define table columns
  const columns = useMemo<Column<User>[]>(
    () => [
      {
        key: 'user',
        label: '사용자',
        sortable: true,
        width: 300,
        render: user => (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <UserAvatar user={user} />
            <Stack spacing={0.25}>
              <Typography variant='body2' fontWeight={500}>
                {user.fullName}
              </Typography>
              <Typography variant='caption' color='text.secondary'>
                @{user.username}
              </Typography>
              {user.email && (
                <Typography variant='caption' color='text.secondary'>
                  {user.email}
                </Typography>
              )}
            </Stack>
          </Box>
        ),
      },
      {
        key: 'role',
        label: '역할',
        sortable: true,
        width: 120,
        align: 'center',
        render: user => <RoleChip role={user.role} />,
      },
      {
        key: 'status',
        label: '상태',
        sortable: true,
        width: 120,
        align: 'center',
        render: user => <StatusChip user={user} />,
      },
      {
        key: 'department',
        label: '부서',
        sortable: true,
        width: 150,
        render: user => (
          <Typography variant='body2'>{user.department || '-'}</Typography>
        ),
      },
      {
        key: 'lastLogin',
        label: '마지막 로그인',
        sortable: true,
        width: 180,
        render: user => (
          <Stack spacing={0.25}>
            <Typography variant='body2'>
              {formatLastLogin(user.lastLogin)}
            </Typography>
            {user.lastLogin && (
              <Typography variant='caption' color='text.secondary'>
                {new Date(user.lastLogin).toLocaleDateString('ko-KR')}
              </Typography>
            )}
          </Stack>
        ),
      },
      {
        key: 'createdAt',
        label: '생성일',
        sortable: true,
        width: 120,
        render: user => (
          <Typography variant='body2'>
            {new Date(user.createdAt).toLocaleDateString('ko-KR')}
          </Typography>
        ),
      },
      {
        key: 'actions',
        label: '작업',
        sortable: false,
        width: 80,
        align: 'center',
        render: user => (
          <UserRowActions
            user={user}
            onEdit={onEdit}
            onDelete={onDelete}
            onView={onView}
            onActivate={onActivate}
            onDeactivate={onDeactivate}
            onLock={onLock}
            onUnlock={onUnlock}
            onResetPassword={onResetPassword}
            onRoleChange={onRoleChange}
          />
        ),
      },
    ],
    [
      onEdit,
      onDelete,
      onView,
      onActivate,
      onDeactivate,
      onLock,
      onUnlock,
      onResetPassword,
      onRoleChange,
    ]
  );

  // Handle row click for view action
  const handleRowClick = useCallback(
    (user: User) => {
      onView?.(user);
    },
    [onView]
  );

  // Loading state
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  // Empty state
  if (!users || users.length === 0) {
    return (
      <Alert
        severity='info'
        sx={{
          borderRadius: 2,
          '& .MuiAlert-message': {
            display: 'flex',
            alignItems: 'center',
            gap: 1,
          },
        }}
      >
        등록된 사용자가 없습니다.
      </Alert>
    );
  }

  return (
    <Box sx={{ width: '100%' }}>
      <DataTable
        data={users}
        columns={columns}
        onRowClick={handleRowClick}
        selectedRows={selectedUsers}
        onSelectionChange={onSelectionChange}
        enableSelection={enableSelection}
        dense={dense}
        stickyHeader
        maxHeight={maxHeight}
        loading={loading}
        emptyMessage='검색 결과가 없습니다.'
        sx={{
          '& .MuiTableCell-root': {
            borderBottom: `1px solid ${theme.palette.divider}`,
          },
          '& .MuiTableRow-root:hover': {
            backgroundColor: alpha(theme.palette.primary.main, 0.04),
          },
          '& .MuiTableHead-root': {
            '& .MuiTableCell-root': {
              backgroundColor: theme.palette.grey[50],
              fontWeight: 600,
              borderBottom: `2px solid ${theme.palette.divider}`,
            },
          },
        }}
      />
    </Box>
  );
}

// ============================================================================
// EXPORTS
// ============================================================================

export default UserTable;
