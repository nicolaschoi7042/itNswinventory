/**
 * User Detail Modal Component
 *
 * Comprehensive modal for viewing user details, activity history,
 * permissions, and performing user management actions.
 */

import React, { useState, useMemo } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  IconButton,
  Typography,
  Box,
  Stack,
  Divider,
  Avatar,
  Chip,
  Grid,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Tabs,
  Tab,
  Badge,
  Tooltip,
  Alert,
  useTheme,
  alpha,
} from '@mui/material';
import {
  Close as CloseIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Lock as LockIcon,
  LockOpen as UnlockIcon,
  PersonOff as DeactivateIcon,
  PersonAdd as ActivateIcon,
  Key as ResetPasswordIcon,
  Security as SecurityIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Business as BusinessIcon,
  Work as WorkIcon,
  Schedule as TimeIcon,
  Login as LoginIcon,
  AdminPanelSettings as AdminIcon,
  ManageAccounts as ManagerIcon,
  CheckCircle as CheckIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
} from '@mui/icons-material';

import { AdminGuard, ManagerGuard } from '@/components/guards/RoleGuards';
import { UserActivityDisplay } from '@/components/activity/UserActivityDisplay';
import { RoleDistribution } from '@/components/visualization/UserStatusVisualization';
import type { User, UserActivity, UserSession, UserRole } from '@/types/user';
import {
  formatUserDisplayName,
  getUserInitials,
  formatLastLogin,
  getUserStatusInfo,
  getUserPermissions,
  canPerformUserAction,
} from '@/utils/user.utils';
import {
  USER_ROLE_LABELS,
  USER_STATUS_LABELS,
  ROLE_COLORS,
  STATUS_COLORS,
} from '@/constants/user.constants';
import { useAuth } from '@/hooks/useAuth';

// ============================================================================
// TYPES AND INTERFACES
// ============================================================================

interface UserDetailModalProps {
  open: boolean;
  onClose: () => void;
  user: User;
  activities?: UserActivity[];
  sessions?: UserSession[];
  onEdit?: (user: User) => void;
  onDelete?: (user: User) => void;
  onActivate?: (user: User) => void;
  onDeactivate?: (user: User) => void;
  onLock?: (user: User) => void;
  onUnlock?: (user: User) => void;
  onResetPassword?: (user: User) => void;
  onRoleChange?: (user: User, newRole: UserRole) => void;
  loading?: boolean;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

// ============================================================================
// TAB PANEL COMPONENT
// ============================================================================

function TabPanel({ children, value, index, ...other }: TabPanelProps) {
  return (
    <div
      role='tabpanel'
      hidden={value !== index}
      id={`user-detail-tabpanel-${index}`}
      aria-labelledby={`user-detail-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

// ============================================================================
// USER INFO CARD COMPONENT
// ============================================================================

function UserInfoCard({ user }: { user: User }) {
  const theme = useTheme();
  const statusInfo = getUserStatusInfo(user);
  const initials = getUserInitials(user);

  return (
    <Card variant='outlined' sx={{ mb: 3 }}>
      <CardContent>
        <Stack direction='row' spacing={3} alignItems='center'>
          {/* Avatar */}
          <Box sx={{ position: 'relative' }}>
            <Avatar
              sx={{
                width: 80,
                height: 80,
                bgcolor: statusInfo.canLogin ? 'primary.main' : 'grey.400',
                fontSize: '1.5rem',
                fontWeight: 600,
              }}
            >
              {initials}
            </Avatar>

            {/* Status indicator */}
            <Box
              sx={{
                position: 'absolute',
                bottom: 4,
                right: 4,
                width: 20,
                height: 20,
                borderRadius: '50%',
                border: `3px solid ${theme.palette.background.paper}`,
                bgcolor: STATUS_COLORS[user.status],
              }}
            />
          </Box>

          {/* User Details */}
          <Box sx={{ flex: 1 }}>
            <Stack spacing={1}>
              <Typography variant='h5' fontWeight={600}>
                {user.fullName}
              </Typography>

              <Typography variant='body1' color='text.secondary'>
                @{user.username}
              </Typography>

              <Stack
                direction='row'
                spacing={1}
                flexWrap='wrap'
                sx={{ gap: 1 }}
              >
                {/* Role Chip */}
                <Chip
                  icon={
                    user.role === 'admin' ? (
                      <AdminIcon sx={{ fontSize: 16 }} />
                    ) : user.role === 'manager' ? (
                      <ManagerIcon sx={{ fontSize: 16 }} />
                    ) : (
                      <PersonIcon sx={{ fontSize: 16 }} />
                    )
                  }
                  label={USER_ROLE_LABELS[user.role]}
                  size='small'
                  sx={{
                    bgcolor: alpha(ROLE_COLORS[user.role], 0.1),
                    color: ROLE_COLORS[user.role],
                    border: `1px solid ${alpha(ROLE_COLORS[user.role], 0.3)}`,
                    fontWeight: 500,
                  }}
                />

                {/* Status Chip */}
                <Tooltip title={statusInfo.reason || statusInfo.label}>
                  <Chip
                    icon={
                      statusInfo.isLocked ? (
                        <ErrorIcon sx={{ fontSize: 16 }} />
                      ) : !statusInfo.canLogin ? (
                        <WarningIcon sx={{ fontSize: 16 }} />
                      ) : (
                        <CheckIcon sx={{ fontSize: 16 }} />
                      )
                    }
                    label={statusInfo.label}
                    size='small'
                    color={
                      statusInfo.isLocked
                        ? 'error'
                        : !statusInfo.canLogin
                          ? 'warning'
                          : 'success'
                    }
                    variant={statusInfo.canLogin ? 'filled' : 'outlined'}
                  />
                </Tooltip>

                {/* Authentication Type */}
                <Chip
                  label={user.authenticationType === 'ldap' ? 'LDAP' : '로컬'}
                  size='small'
                  variant='outlined'
                />
              </Stack>

              <Typography variant='body2' color='text.secondary'>
                마지막 로그인: {formatLastLogin(user.lastLogin)}
              </Typography>
            </Stack>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}

// ============================================================================
// USER PROFILE TAB COMPONENT
// ============================================================================

function UserProfileTab({ user }: { user: User }) {
  return (
    <Grid container spacing={3}>
      {/* Contact Information */}
      <Grid item xs={12} md={6}>
        <Card variant='outlined'>
          <CardContent>
            <Typography
              variant='h6'
              gutterBottom
              sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
            >
              <PersonIcon color='primary' />
              연락처 정보
            </Typography>

            <List>
              <ListItem sx={{ px: 0 }}>
                <ListItemIcon>
                  <EmailIcon color='action' />
                </ListItemIcon>
                <ListItemText
                  primary='이메일'
                  secondary={user.email || '미설정'}
                />
              </ListItem>

              <ListItem sx={{ px: 0 }}>
                <ListItemIcon>
                  <PhoneIcon color='action' />
                </ListItemIcon>
                <ListItemText
                  primary='전화번호'
                  secondary={user.phone || '미설정'}
                />
              </ListItem>
            </List>
          </CardContent>
        </Card>
      </Grid>

      {/* Organization Information */}
      <Grid item xs={12} md={6}>
        <Card variant='outlined'>
          <CardContent>
            <Typography
              variant='h6'
              gutterBottom
              sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
            >
              <BusinessIcon color='primary' />
              조직 정보
            </Typography>

            <List>
              <ListItem sx={{ px: 0 }}>
                <ListItemIcon>
                  <BusinessIcon color='action' />
                </ListItemIcon>
                <ListItemText
                  primary='부서'
                  secondary={user.department || '미설정'}
                />
              </ListItem>

              <ListItem sx={{ px: 0 }}>
                <ListItemIcon>
                  <WorkIcon color='action' />
                </ListItemIcon>
                <ListItemText
                  primary='직급'
                  secondary={user.position || '미설정'}
                />
              </ListItem>
            </List>
          </CardContent>
        </Card>
      </Grid>

      {/* Account Information */}
      <Grid item xs={12}>
        <Card variant='outlined'>
          <CardContent>
            <Typography
              variant='h6'
              gutterBottom
              sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
            >
              <SecurityIcon color='primary' />
              계정 정보
            </Typography>

            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={3}>
                <Typography variant='body2' color='text.secondary'>
                  계정 생성일
                </Typography>
                <Typography variant='body1'>
                  {new Date(user.createdAt).toLocaleDateString('ko-KR')}
                </Typography>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <Typography variant='body2' color='text.secondary'>
                  마지막 업데이트
                </Typography>
                <Typography variant='body1'>
                  {new Date(user.updatedAt).toLocaleDateString('ko-KR')}
                </Typography>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <Typography variant='body2' color='text.secondary'>
                  로그인 시도 횟수
                </Typography>
                <Typography variant='body1'>{user.loginAttempts}/5</Typography>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <Typography variant='body2' color='text.secondary'>
                  인증 방식
                </Typography>
                <Typography variant='body1'>
                  {user.authenticationType === 'ldap' ? 'LDAP' : '로컬 계정'}
                </Typography>
              </Grid>
            </Grid>

            {user.lockedUntil && new Date(user.lockedUntil) > new Date() && (
              <Alert severity='warning' sx={{ mt: 2 }}>
                계정이 {new Date(user.lockedUntil).toLocaleString('ko-KR')}까지
                잠겨있습니다.
              </Alert>
            )}
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
}

// ============================================================================
// USER PERMISSIONS TAB COMPONENT
// ============================================================================

function UserPermissionsTab({ user }: { user: User }) {
  const permissions = getUserPermissions(user.role);

  const permissionGroups = {
    '사용자 관리': [
      {
        key: 'canCreateUsers',
        label: '사용자 생성',
        description: '새로운 사용자 계정을 생성할 수 있습니다',
      },
      {
        key: 'canEditUsers',
        label: '사용자 편집',
        description: '기존 사용자 정보를 수정할 수 있습니다',
      },
      {
        key: 'canDeleteUsers',
        label: '사용자 삭제',
        description: '사용자 계정을 삭제할 수 있습니다',
      },
      {
        key: 'canViewUsers',
        label: '사용자 조회',
        description: '다른 사용자 정보를 조회할 수 있습니다',
      },
      {
        key: 'canManageRoles',
        label: '역할 관리',
        description: '사용자의 역할을 변경할 수 있습니다',
      },
    ],
    '계정 관리': [
      {
        key: 'canResetPasswords',
        label: '비밀번호 재설정',
        description: '다른 사용자의 비밀번호를 재설정할 수 있습니다',
      },
      {
        key: 'canActivateUsers',
        label: '사용자 활성화',
        description: '비활성화된 사용자를 활성화할 수 있습니다',
      },
      {
        key: 'canDeactivateUsers',
        label: '사용자 비활성화',
        description: '사용자 계정을 비활성화할 수 있습니다',
      },
    ],
    시스템: [
      {
        key: 'canViewAuditLogs',
        label: '감사 로그 조회',
        description: '시스템 감사 로그를 조회할 수 있습니다',
      },
      {
        key: 'canExportData',
        label: '데이터 내보내기',
        description: '시스템 데이터를 내보낼 수 있습니다',
      },
    ],
    '자산 관리': [
      {
        key: 'canManageAssets',
        label: '자산 관리',
        description: '하드웨어 및 소프트웨어 자산을 관리할 수 있습니다',
      },
      {
        key: 'canAssignAssets',
        label: '자산 할당',
        description: '자산을 직원에게 할당하거나 회수할 수 있습니다',
      },
    ],
  };

  return (
    <Stack spacing={3}>
      <Alert severity='info' icon={<InfoIcon />}>
        사용자의 역할({USER_ROLE_LABELS[user.role]})에 따른 시스템 권한입니다.
      </Alert>

      {Object.entries(permissionGroups).map(([groupName, groupPermissions]) => (
        <Card key={groupName} variant='outlined'>
          <CardContent>
            <Typography variant='h6' gutterBottom color='primary'>
              {groupName}
            </Typography>

            <List>
              {groupPermissions.map(({ key, label, description }) => (
                <ListItem key={key} sx={{ px: 0 }}>
                  <ListItemIcon>
                    {permissions[key as keyof typeof permissions] ? (
                      <CheckIcon color='success' />
                    ) : (
                      <ErrorIcon color='disabled' />
                    )}
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Typography
                        variant='body1'
                        color={
                          permissions[key as keyof typeof permissions]
                            ? 'text.primary'
                            : 'text.disabled'
                        }
                        fontWeight={
                          permissions[key as keyof typeof permissions]
                            ? 500
                            : 400
                        }
                      >
                        {label}
                      </Typography>
                    }
                    secondary={
                      <Typography
                        variant='body2'
                        color={
                          permissions[key as keyof typeof permissions]
                            ? 'text.secondary'
                            : 'text.disabled'
                        }
                      >
                        {description}
                      </Typography>
                    }
                  />
                </ListItem>
              ))}
            </List>
          </CardContent>
        </Card>
      ))}
    </Stack>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function UserDetailModal({
  open,
  onClose,
  user,
  activities = [],
  sessions = [],
  onEdit,
  onDelete,
  onActivate,
  onDeactivate,
  onLock,
  onUnlock,
  onResetPassword,
  onRoleChange,
  loading = false,
}: UserDetailModalProps) {
  const { user: currentUser } = useAuth();
  const [tabValue, setTabValue] = useState(0);

  const statusInfo = getUserStatusInfo(user);

  // Permission checks
  const canEdit =
    currentUser && canPerformUserAction(currentUser, user, 'canEditUsers');
  const canDelete =
    currentUser && canPerformUserAction(currentUser, user, 'canDeleteUsers');
  const canResetPwd =
    currentUser && canPerformUserAction(currentUser, user, 'canResetPasswords');
  const canActivate =
    currentUser && canPerformUserAction(currentUser, user, 'canActivateUsers');
  const canDeactivate =
    currentUser &&
    canPerformUserAction(currentUser, user, 'canDeactivateUsers');

  // Prevent self-actions for critical operations
  const isSelf = currentUser?.id === user?.id;

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // Early return if user is not provided
  if (!user) {
    return (
      <Dialog open={open} onClose={onClose}>
        <DialogTitle>오류</DialogTitle>
        <DialogContent>
          <Typography>사용자 정보를 불러올 수 없습니다.</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>닫기</Button>
        </DialogActions>
      </Dialog>
    );
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth='lg'
      fullWidth
      PaperProps={{
        sx: { height: '90vh', maxHeight: '90vh' },
      }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Stack
          direction='row'
          alignItems='center'
          justifyContent='space-between'
        >
          <Typography variant='h6' fontWeight={600}>
            사용자 상세 정보
          </Typography>
          <IconButton onClick={onClose} size='small'>
            <CloseIcon />
          </IconButton>
        </Stack>
      </DialogTitle>

      <Divider />

      <DialogContent
        sx={{
          p: 3,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* User Info Card */}
        <UserInfoCard user={user} />

        {/* Tabs */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 0 }}>
          <Tabs value={tabValue} onChange={handleTabChange}>
            <Tab
              label='프로필'
              id='user-detail-tab-0'
              aria-controls='user-detail-tabpanel-0'
            />
            <Tab
              label='권한'
              id='user-detail-tab-1'
              aria-controls='user-detail-tabpanel-1'
            />
            <Tab
              label={
                <Badge
                  badgeContent={activities.length}
                  color='primary'
                  showZero
                >
                  활동 기록
                </Badge>
              }
              id='user-detail-tab-2'
              aria-controls='user-detail-tabpanel-2'
            />
          </Tabs>
        </Box>

        {/* Tab Panels */}
        <Box sx={{ flex: 1, overflow: 'auto' }}>
          <TabPanel value={tabValue} index={0}>
            <UserProfileTab user={user} />
          </TabPanel>

          <TabPanel value={tabValue} index={1}>
            <UserPermissionsTab user={user} />
          </TabPanel>

          <TabPanel value={tabValue} index={2}>
            <UserActivityDisplay
              user={user}
              activities={activities}
              maxItems={50}
            />
          </TabPanel>
        </Box>
      </DialogContent>

      <Divider />

      <DialogActions sx={{ p: 2 }}>
        <Stack direction='row' spacing={1} sx={{ flex: 1 }}>
          {/* Edit Button */}
          {canEdit && (
            <Button
              variant='outlined'
              startIcon={<EditIcon />}
              onClick={() => onEdit?.(user)}
            >
              편집
            </Button>
          )}

          {/* Status Actions */}
          {canActivate && user.status !== 'active' && (
            <Button
              variant='outlined'
              color='success'
              startIcon={<ActivateIcon />}
              onClick={() => onActivate?.(user)}
            >
              활성화
            </Button>
          )}

          {canDeactivate && user.status === 'active' && !isSelf && (
            <Button
              variant='outlined'
              color='warning'
              startIcon={<DeactivateIcon />}
              onClick={() => onDeactivate?.(user)}
            >
              비활성화
            </Button>
          )}

          {/* Lock/Unlock Actions */}
          {statusInfo.isLocked && canActivate && (
            <Button
              variant='outlined'
              color='info'
              startIcon={<UnlockIcon />}
              onClick={() => onUnlock?.(user)}
            >
              잠금 해제
            </Button>
          )}

          {!statusInfo.isLocked && canDeactivate && !isSelf && (
            <Button
              variant='outlined'
              color='warning'
              startIcon={<LockIcon />}
              onClick={() => onLock?.(user)}
            >
              계정 잠금
            </Button>
          )}

          {/* Password Reset */}
          {canResetPwd && (
            <Button
              variant='outlined'
              color='secondary'
              startIcon={<ResetPasswordIcon />}
              onClick={() => onResetPassword?.(user)}
            >
              비밀번호 재설정
            </Button>
          )}
        </Stack>

        <Stack direction='row' spacing={1}>
          {/* Delete Button */}
          <AdminGuard>
            {canDelete && !isSelf && (
              <Button
                variant='outlined'
                color='error'
                startIcon={<DeleteIcon />}
                onClick={() => onDelete?.(user)}
              >
                삭제
              </Button>
            )}
          </AdminGuard>

          <Button onClick={onClose}>닫기</Button>
        </Stack>
      </DialogActions>
    </Dialog>
  );
}

// ============================================================================
// EXPORTS
// ============================================================================

export default UserDetailModal;
