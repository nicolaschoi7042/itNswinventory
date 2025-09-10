/**
 * User Management Page
 *
 * Main page for user management with comprehensive functionality including
 * user listing, filtering, CRUD operations, role management, and audit tracking.
 */

'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Box,
  Typography,
  Button,
  Stack,
  Alert,
  Snackbar,
  CircularProgress,
  Container,
  Card,
  CardContent,
  Grid,
  Fade,
  useTheme,
} from '@mui/material';
import {
  Add as AddIcon,
  Download as ExportIcon,
  Refresh as RefreshIcon,
  Group as GroupIcon,
  Security as SecurityIcon,
} from '@mui/icons-material';

import { DataTable, Column } from '@/components/common/DataTable';
import { UserSearchFilter } from '@/components/search/UserSearchFilter';
import { UserFormModal } from '@/components/modals/UserFormModal';
import { UserDetailModal } from '@/components/modals/UserDetailModal';
import { ConfirmDialog } from '@/components/modals/ConfirmDialog';
import { UserOverview } from '@/components/visualization/UserStatusVisualization';
import { AdminGuard } from '@/components/guards/RoleGuards';
import MainLayout from '@/components/layout/MainLayout';
import { useAuth } from '@/hooks/useAuth';
import { UserService } from '@/services/user.service';
import { ApiClient } from '@/lib/api-client';
import type {
  User,
  CreateUserData,
  UpdateUserData,
  UserRole,
  UserActivity,
  UserSearchCriteria,
} from '@/types/user';
import { formatUserDisplayName, getUserStatusInfo } from '@/utils/user.utils';
import { getApiErrorMessage, logError } from '@/utils/errorHandling.utils';

// ============================================================================
// TYPES AND INTERFACES
// ============================================================================

interface NotificationState {
  open: boolean;
  message: string;
  severity: 'success' | 'error' | 'warning' | 'info';
}

interface ModalState {
  userForm: {
    open: boolean;
    mode: 'create' | 'edit';
    user?: User;
  };
  userDetail: {
    open: boolean;
    user?: User;
    activities?: UserActivity[];
  };
  confirmDelete: {
    open: boolean;
    user?: User;
  };
}

// ============================================================================
// TABLE CONFIGURATION
// ============================================================================

const userColumns: Column[] = [
  {
    id: 'username',
    label: 'Username',
    sortable: true,
    minWidth: 120,
  },
  {
    id: 'fullName',
    label: 'Full Name',
    sortable: true,
    minWidth: 150,
  },
  {
    id: 'email',
    label: 'Email',
    sortable: true,
    minWidth: 200,
  },
  {
    id: 'role',
    label: 'Role',
    sortable: true,
    type: 'chip',
    minWidth: 100,
  },
  {
    id: 'status',
    label: 'Status',
    sortable: true,
    type: 'chip',
    minWidth: 100,
  },
  {
    id: 'department',
    label: 'Department',
    sortable: true,
    minWidth: 120,
  },
  {
    id: 'lastLogin',
    label: 'Last Login',
    sortable: true,
    type: 'date',
    minWidth: 150,
  },
  {
    id: 'actions',
    label: 'Actions',
    type: 'actions',
    align: 'center',
    minWidth: 120,
  },
];

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function UsersPage() {
  const theme = useTheme();
  const { user: currentUser } = useAuth();

  // State management
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [searchCriteria, setSearchCriteria] = useState<UserSearchCriteria>({});

  const [notification, setNotification] = useState<NotificationState>({
    open: false,
    message: '',
    severity: 'info',
  });

  const [modals, setModals] = useState<ModalState>({
    userForm: { open: false, mode: 'create' },
    userDetail: { open: false },
    confirmDelete: { open: false },
  });

  // Initialize services
  const apiClient = useMemo(() => new ApiClient(), []);
  const userService = useMemo(() => new UserService(apiClient), [apiClient]);

  // ============================================================================
  // DATA LOADING
  // ============================================================================

  const loadUsers = useCallback(async () => {
    if (!currentUser) return;

    try {
      setLoading(true);
      const response = await userService.getAll();

      if (response.success && response.data) {
        setUsers(response.data);
        setFilteredUsers(response.data);
      } else {
        throw new Error(response.error || 'Failed to load users');
      }
    } catch (error) {
      logError('Failed to load users', error);
      showNotification('사용자 목록을 불러오는데 실패했습니다.', 'error');
    } finally {
      setLoading(false);
    }
  }, [currentUser, userService]);

  const loadUserActivities = useCallback(
    async (userId: string): Promise<UserActivity[]> => {
      try {
        // This would need to be implemented in the UserService
        // For now, return empty array
        return [];
      } catch (error) {
        logError('Failed to load user activities', error);
        return [];
      }
    },
    []
  );

  // Initial load
  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  // ============================================================================
  // UTILITY FUNCTIONS
  // ============================================================================

  const showNotification = (
    message: string,
    severity: NotificationState['severity'] = 'info'
  ) => {
    setNotification({ open: true, message, severity });
  };

  const handleCloseNotification = () => {
    setNotification(prev => ({ ...prev, open: false }));
  };

  const openModal = (modalType: keyof ModalState, data: any = {}) => {
    setModals(prev => ({
      ...prev,
      [modalType]: { ...prev[modalType], open: true, ...data },
    }));
  };

  const closeModal = (modalType: keyof ModalState) => {
    setModals(prev => ({
      ...prev,
      [modalType]: { ...prev[modalType], open: false },
    }));
  };

  // ============================================================================
  // USER OPERATIONS
  // ============================================================================

  const handleCreateUser = async (userData: CreateUserData) => {
    try {
      setActionLoading(true);
      const response = await userService.create(userData);

      if (response.success && response.data) {
        await loadUsers(); // Refresh the list
        showNotification(
          `사용자 '${userData.fullName}'이(가) 성공적으로 생성되었습니다.`,
          'success'
        );
        closeModal('userForm');
      } else {
        throw new Error(response.error || 'Failed to create user');
      }
    } catch (error) {
      const errorMessage = getApiErrorMessage(error, '사용자 생성');
      showNotification(errorMessage, 'error');
      logError('Failed to create user', error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateUser = async (userData: UpdateUserData) => {
    if (!modals.userForm.user) return;

    try {
      setActionLoading(true);
      const response = await userService.update(
        modals.userForm.user.id,
        userData
      );

      if (response.success && response.data) {
        await loadUsers(); // Refresh the list
        showNotification(
          `사용자 정보가 성공적으로 업데이트되었습니다.`,
          'success'
        );
        closeModal('userForm');
      } else {
        throw new Error(response.error || 'Failed to update user');
      }
    } catch (error) {
      const errorMessage = getApiErrorMessage(error, '사용자 업데이트');
      showNotification(errorMessage, 'error');
      logError('Failed to update user', error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteUser = async (user: User) => {
    try {
      setActionLoading(true);
      const response = await userService.delete(user.id);

      if (response.success) {
        await loadUsers(); // Refresh the list
        showNotification(
          `사용자 '${formatUserDisplayName(user)}'이(가) 삭제되었습니다.`,
          'success'
        );
        closeModal('confirmDelete');
      } else {
        throw new Error(response.error || 'Failed to delete user');
      }
    } catch (error) {
      const errorMessage = getApiErrorMessage(error, '사용자 삭제');
      showNotification(errorMessage, 'error');
      logError('Failed to delete user', error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleActivateUser = async (user: User) => {
    try {
      setActionLoading(true);
      const response = await userService.activate(user.id);

      if (response.success) {
        await loadUsers();
        showNotification(
          `사용자 '${formatUserDisplayName(user)}'이(가) 활성화되었습니다.`,
          'success'
        );
      } else {
        throw new Error(response.error || 'Failed to activate user');
      }
    } catch (error) {
      const errorMessage = getApiErrorMessage(error, '사용자 활성화');
      showNotification(errorMessage, 'error');
      logError('Failed to activate user', error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeactivateUser = async (user: User) => {
    try {
      setActionLoading(true);
      const response = await userService.deactivate(user.id);

      if (response.success) {
        await loadUsers();
        showNotification(
          `사용자 '${formatUserDisplayName(user)}'이(가) 비활성화되었습니다.`,
          'success'
        );
      } else {
        throw new Error(response.error || 'Failed to deactivate user');
      }
    } catch (error) {
      const errorMessage = getApiErrorMessage(error, '사용자 비활성화');
      showNotification(errorMessage, 'error');
      logError('Failed to deactivate user', error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleResetPassword = async (user: User) => {
    const newPassword = prompt('새 비밀번호를 입력하세요:');
    if (!newPassword) return;

    try {
      setActionLoading(true);
      const response = await userService.resetPassword(user.id, newPassword);

      if (response.success) {
        showNotification(
          `사용자 '${formatUserDisplayName(user)}'의 비밀번호가 재설정되었습니다.`,
          'success'
        );
      } else {
        throw new Error(response.error || 'Failed to reset password');
      }
    } catch (error) {
      const errorMessage = getApiErrorMessage(error, '비밀번호 재설정');
      showNotification(errorMessage, 'error');
      logError('Failed to reset password', error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleRoleChange = async (user: User, newRole: UserRole) => {
    try {
      setActionLoading(true);
      const response = await userService.update(user.id, { role: newRole });

      if (response.success) {
        await loadUsers();
        showNotification(
          `사용자 '${formatUserDisplayName(user)}'의 역할이 변경되었습니다.`,
          'success'
        );
      } else {
        throw new Error(response.error || 'Failed to change role');
      }
    } catch (error) {
      const errorMessage = getApiErrorMessage(error, '역할 변경');
      showNotification(errorMessage, 'error');
      logError('Failed to change role', error);
    } finally {
      setActionLoading(false);
    }
  };

  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================

  const handleUserFormSubmit = async (
    userData: CreateUserData | UpdateUserData
  ) => {
    if (modals.userForm.mode === 'create') {
      await handleCreateUser(userData as CreateUserData);
    } else {
      await handleUpdateUser(userData as UpdateUserData);
    }
  };

  const handleViewUser = async (user: User) => {
    const activities = await loadUserActivities(user.id);
    openModal('userDetail', { user, activities });
  };

  const handleExportUsers = async () => {
    try {
      // Implement export functionality
      showNotification('사용자 데이터 내보내기가 시작되었습니다.', 'info');
    } catch (error) {
      showNotification('내보내기에 실패했습니다.', 'error');
      logError('Failed to export users', error);
    }
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  if (!currentUser) {
    return (
      <Box
        display='flex'
        justifyContent='center'
        alignItems='center'
        minHeight='400px'
      >
        <CircularProgress />
      </Box>
    );
  }

  // Check if user has permission to view users
  const canViewUsers = currentUser.role === 'admin';

  if (!canViewUsers) {
    return (
      <Container maxWidth='md' sx={{ py: 4 }}>
        <Alert severity='warning'>
          사용자 관리 페이지에 접근할 권한이 없습니다.
        </Alert>
      </Container>
    );
  }

  return (
    <MainLayout>
      <Container maxWidth='xl' sx={{ py: 3 }}>
      <Fade in={true}>
        <Stack spacing={3}>
          {/* Page Header */}
          <Box>
            <Stack
              direction='row'
              alignItems='center'
              justifyContent='space-between'
              mb={2}
            >
              <Stack direction='row' alignItems='center' spacing={2}>
                <GroupIcon color='primary' sx={{ fontSize: 32 }} />
                <Box>
                  <Typography variant='h4' fontWeight={600}>
                    사용자 관리
                  </Typography>
                  <Typography variant='body1' color='text.secondary'>
                    시스템 사용자 관리 및 권한 설정
                  </Typography>
                </Box>
              </Stack>

              <Stack direction='row' spacing={1}>
                <Button
                  variant='outlined'
                  startIcon={<RefreshIcon />}
                  onClick={loadUsers}
                  disabled={loading}
                >
                  새로고침
                </Button>

                <Button
                  variant='outlined'
                  startIcon={<ExportIcon />}
                  onClick={handleExportUsers}
                  disabled={loading || filteredUsers.length === 0}
                >
                  내보내기
                </Button>

                <AdminGuard>
                  <Button
                    variant='contained'
                    startIcon={<AddIcon />}
                    onClick={() => openModal('userForm', { mode: 'create' })}
                    disabled={loading}
                  >
                    사용자 추가
                  </Button>
                </AdminGuard>
              </Stack>
            </Stack>
          </Box>

          {/* User Statistics Overview */}
          {!loading && users.length > 0 && <UserOverview users={users} />}

          {/* Search and Filters */}
          <UserSearchFilter
            users={users}
            onFilteredUsersChange={setFilteredUsers}
            onSearchCriteriaChange={setSearchCriteria}
            enableSavedSearches
          />

          {/* User Table */}
          <Card>
            <CardContent sx={{ p: 0 }}>
              <DataTable
                data={filteredUsers}
                columns={userColumns}
                loading={loading}
                onEdit={user => openModal('userForm', { mode: 'edit', user })}
                onDelete={user => openModal('confirmDelete', { user })}
                onView={handleViewUser}
                emptyMessage='등록된 사용자가 없습니다.'
                pagination={true}
              />
            </CardContent>
          </Card>

          {/* Empty State */}
          {!loading && filteredUsers.length === 0 && users.length > 0 && (
            <Alert severity='info'>
              검색 조건에 맞는 사용자가 없습니다. 필터를 조정해보세요.
            </Alert>
          )}

          {!loading && users.length === 0 && (
            <Alert severity='info'>
              등록된 사용자가 없습니다. 새 사용자를 추가해보세요.
            </Alert>
          )}
        </Stack>
      </Fade>

      {/* User Form Modal */}
      <UserFormModal
        open={modals.userForm.open}
        onClose={() => closeModal('userForm')}
        onSubmit={handleUserFormSubmit}
        user={modals.userForm.user}
        mode={modals.userForm.mode}
        loading={actionLoading}
      />

      {/* User Detail Modal */}
      <UserDetailModal
        open={modals.userDetail.open}
        onClose={() => closeModal('userDetail')}
        user={modals.userDetail.user!}
        activities={modals.userDetail.activities}
        onEdit={user => {
          closeModal('userDetail');
          openModal('userForm', { mode: 'edit', user });
        }}
        onDelete={user => {
          closeModal('userDetail');
          openModal('confirmDelete', { user });
        }}
        onActivate={handleActivateUser}
        onDeactivate={handleDeactivateUser}
        onResetPassword={handleResetPassword}
        onRoleChange={handleRoleChange}
        loading={actionLoading}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={modals.confirmDelete.open}
        onClose={() => closeModal('confirmDelete')}
        onConfirm={() =>
          modals.confirmDelete.user &&
          handleDeleteUser(modals.confirmDelete.user)
        }
        title='사용자 삭제 확인'
        message={
          modals.confirmDelete.user
            ? `사용자 '${formatUserDisplayName(modals.confirmDelete.user)}'을(를) 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.`
            : ''
        }
        confirmLabel='삭제'
        cancelLabel='취소'
        severity='error'
        loading={actionLoading}
      />

      {/* Notification Snackbar */}
      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={handleCloseNotification}
      >
        <Alert
          onClose={handleCloseNotification}
          severity={notification.severity}
          sx={{ width: '100%' }}
        >
          {notification.message}
        </Alert>
      </Snackbar>

      {/* Loading Overlay */}
      {actionLoading && (
        <Box
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            bgcolor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: theme.zIndex.modal + 1,
          }}
        >
          <CircularProgress />
        </Box>
      )}
      </Container>
    </MainLayout>
  );
}
