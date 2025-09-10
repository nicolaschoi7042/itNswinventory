/**
 * User Form Modal Component
 *
 * Comprehensive modal for creating and editing users with role selection,
 * password generation, validation, and profile management.
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
  Typography,
  Box,
  Stack,
  Divider,
  Alert,
  CircularProgress,
  InputAdornment,
  Tooltip,
  Chip,
  Card,
  CardContent,
  Grid,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  useTheme,
  alpha,
} from '@mui/material';
import {
  Close as CloseIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Refresh as RefreshIcon,
  Security as SecurityIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Business as BusinessIcon,
  Work as WorkIcon,
  VpnKey as PasswordIcon,
  AdminPanelSettings as AdminIcon,
  ManageAccounts as ManagerIcon,
  Check as CheckIcon,
  Warning as WarningIcon,
  ExpandMore as ExpandIcon,
  Autorenew as AutoGenerateIcon,
} from '@mui/icons-material';

import { FormModal } from './FormModal';
import { AdminGuard } from '@/components/guards/RoleGuards';
import type {
  User,
  CreateUserData,
  UpdateUserData,
  UserRole,
  UserStatus,
  UserValidationResult,
} from '@/types/user';
import {
  USER_ROLES,
  USER_ROLE_LABELS,
  USER_ROLE_DESCRIPTIONS,
  USER_STATUSES,
  USER_STATUS_LABELS,
  DEFAULT_DEPARTMENTS,
  DEFAULT_POSITIONS,
  ROLE_COLORS,
} from '@/constants/user.constants';
import {
  validateUserData,
  validatePasswordStrength,
  getUserPermissions,
} from '@/utils/user.utils';

// ============================================================================
// TYPES AND INTERFACES
// ============================================================================

interface UserFormModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (userData: CreateUserData | UpdateUserData) => Promise<void>;
  user?: User; // For editing
  mode: 'create' | 'edit';
  loading?: boolean;
}

interface PasswordGeneratorProps {
  onPasswordGenerated: (password: string) => void;
  disabled?: boolean;
}

interface RolePermissionDisplayProps {
  role: UserRole;
  compact?: boolean;
}

// ============================================================================
// PASSWORD GENERATOR COMPONENT
// ============================================================================

function PasswordGenerator({
  onPasswordGenerated,
  disabled,
}: PasswordGeneratorProps) {
  const [generatedPassword, setGeneratedPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const generatePassword = () => {
    const uppercaseChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lowercaseChars = 'abcdefghijklmnopqrstuvwxyz';
    const numberChars = '0123456789';
    const specialChars = '!@#$%^&*()_+-=[]{}|;:,.<>?';

    const allChars =
      uppercaseChars + lowercaseChars + numberChars + specialChars;

    // Ensure at least one character from each required set
    let password = '';
    password +=
      uppercaseChars[Math.floor(Math.random() * uppercaseChars.length)];
    password +=
      lowercaseChars[Math.floor(Math.random() * lowercaseChars.length)];
    password += numberChars[Math.floor(Math.random() * numberChars.length)];
    password += specialChars[Math.floor(Math.random() * specialChars.length)];

    // Fill the rest with random characters
    for (let i = 4; i < 12; i++) {
      password += allChars[Math.floor(Math.random() * allChars.length)];
    }

    // Shuffle the password
    const shuffled = password
      .split('')
      .sort(() => Math.random() - 0.5)
      .join('');

    setGeneratedPassword(shuffled);
    onPasswordGenerated(shuffled);
  };

  const copyToClipboard = async () => {
    if (generatedPassword) {
      try {
        await navigator.clipboard.writeText(generatedPassword);
      } catch (error) {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = generatedPassword;
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }
    }
  };

  return (
    <Box sx={{ mt: 2 }}>
      <Stack direction='row' spacing={1} alignItems='center'>
        <Button
          variant='outlined'
          size='small'
          onClick={generatePassword}
          disabled={disabled}
          startIcon={<AutoGenerateIcon />}
        >
          비밀번호 생성
        </Button>

        {generatedPassword && (
          <>
            <TextField
              size='small'
              value={generatedPassword}
              type={showPassword ? 'text' : 'password'}
              InputProps={{
                readOnly: true,
                endAdornment: (
                  <InputAdornment position='end'>
                    <IconButton
                      size='small'
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <VisibilityOffIcon />
                      ) : (
                        <VisibilityIcon />
                      )}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{ flex: 1 }}
            />

            <Tooltip title='클립보드로 복사'>
              <Button size='small' onClick={copyToClipboard}>
                복사
              </Button>
            </Tooltip>
          </>
        )}
      </Stack>
    </Box>
  );
}

// ============================================================================
// ROLE PERMISSION DISPLAY COMPONENT
// ============================================================================

function RolePermissionDisplay({
  role,
  compact = false,
}: RolePermissionDisplayProps) {
  const theme = useTheme();
  const permissions = getUserPermissions(role);

  const permissionGroups = {
    '사용자 관리': [
      { key: 'canCreateUsers', label: '사용자 생성' },
      { key: 'canEditUsers', label: '사용자 편집' },
      { key: 'canDeleteUsers', label: '사용자 삭제' },
      { key: 'canViewUsers', label: '사용자 조회' },
      { key: 'canManageRoles', label: '역할 관리' },
    ],
    '계정 관리': [
      { key: 'canResetPasswords', label: '비밀번호 재설정' },
      { key: 'canActivateUsers', label: '사용자 활성화' },
      { key: 'canDeactivateUsers', label: '사용자 비활성화' },
    ],
    시스템: [
      { key: 'canViewAuditLogs', label: '감사 로그 조회' },
      { key: 'canExportData', label: '데이터 내보내기' },
    ],
    '자산 관리': [
      { key: 'canManageAssets', label: '자산 관리' },
      { key: 'canAssignAssets', label: '자산 할당' },
    ],
  };

  if (compact) {
    const enabledCount = Object.values(permissions).filter(Boolean).length;
    const totalCount = Object.values(permissions).length;

    return (
      <Chip
        label={`${enabledCount}/${totalCount} 권한`}
        size='small'
        sx={{
          bgcolor: alpha(ROLE_COLORS[role], 0.1),
          color: ROLE_COLORS[role],
          border: `1px solid ${alpha(ROLE_COLORS[role], 0.3)}`,
        }}
      />
    );
  }

  return (
    <Card variant='outlined' sx={{ mt: 2 }}>
      <CardContent sx={{ pb: 2 }}>
        <Typography variant='subtitle2' gutterBottom>
          역할 권한: {USER_ROLE_LABELS[role]}
        </Typography>

        <Grid container spacing={2}>
          {Object.entries(permissionGroups).map(
            ([groupName, groupPermissions]) => (
              <Grid item xs={12} sm={6} key={groupName}>
                <Typography
                  variant='caption'
                  color='text.secondary'
                  fontWeight={600}
                >
                  {groupName}
                </Typography>
                <List dense sx={{ pt: 0 }}>
                  {groupPermissions.map(({ key, label }) => (
                    <ListItem key={key} sx={{ py: 0.25, px: 0 }}>
                      <ListItemIcon sx={{ minWidth: 24 }}>
                        {permissions[key as keyof typeof permissions] ? (
                          <CheckIcon color='success' fontSize='small' />
                        ) : (
                          <CloseIcon color='disabled' fontSize='small' />
                        )}
                      </ListItemIcon>
                      <ListItemText
                        primary={label}
                        primaryTypographyProps={{
                          variant: 'body2',
                          color: permissions[key as keyof typeof permissions]
                            ? 'text.primary'
                            : 'text.disabled',
                        }}
                      />
                    </ListItem>
                  ))}
                </List>
              </Grid>
            )
          )}
        </Grid>
      </CardContent>
    </Card>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function UserFormModal({
  open,
  onClose,
  onSubmit,
  user,
  mode,
  loading = false,
}: UserFormModalProps) {
  const theme = useTheme();

  // Form state
  const [formData, setFormData] = useState<CreateUserData | UpdateUserData>({
    username: '',
    fullName: '',
    email: '',
    role: 'user',
    department: '',
    position: '',
    phone: '',
    password: mode === 'create' ? '' : undefined,
    status: 'active',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [validation, setValidation] = useState<UserValidationResult>({
    isValid: true,
    errors: [],
    warnings: [],
  });
  const [showPermissions, setShowPermissions] = useState(false);

  // Initialize form data when user prop changes
  useEffect(() => {
    if (mode === 'edit' && user) {
      setFormData({
        username: user.username,
        fullName: user.fullName,
        email: user.email || '',
        role: user.role,
        department: user.department || '',
        position: user.position || '',
        phone: user.phone || '',
        status: user.status,
      });
    } else if (mode === 'create') {
      setFormData({
        username: '',
        fullName: '',
        email: '',
        role: 'user',
        department: '',
        position: '',
        phone: '',
        password: '',
        status: 'active',
      });
    }
  }, [user, mode, open]);

  // Validate form data
  useEffect(() => {
    const result = validateUserData(formData, mode === 'edit');
    setValidation(result);
  }, [formData, mode]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handlePasswordGenerated = (password: string) => {
    handleInputChange('password', password);
  };

  const handleSubmit = async () => {
    if (validation.isValid) {
      try {
        await onSubmit(formData);
        onClose();
      } catch (error) {
        console.error('Failed to save user:', error);
      }
    }
  };

  const passwordStrength = useMemo(() => {
    if (mode === 'edit' || !formData.password) return null;
    return validatePasswordStrength(formData.password as string);
  }, [formData.password, mode]);

  const getRoleIcon = (role: UserRole) => {
    switch (role) {
      case 'admin':
        return <AdminIcon />;
      case 'manager':
        return <ManagerIcon />;
      case 'user':
        return <PersonIcon />;
    }
  };

  return (
    <FormModal
      open={open}
      onClose={onClose}
      title={mode === 'create' ? '새 사용자 추가' : '사용자 편집'}
      subtitle={
        mode === 'edit' && user
          ? `${user.fullName} (${user.username})`
          : '사용자 정보를 입력하세요'
      }
      onSubmit={handleSubmit}
      submitLabel={mode === 'create' ? '사용자 생성' : '변경사항 저장'}
      loading={loading}
      disabled={!validation.isValid}
      maxWidth='md'
      fullWidth
    >
      <Stack spacing={3}>
        {/* Validation Alerts */}
        {validation.errors.length > 0 && (
          <Alert severity='error'>
            <Typography variant='body2' fontWeight={500} gutterBottom>
              다음 오류를 수정해주세요:
            </Typography>
            <ul style={{ margin: 0, paddingLeft: 20 }}>
              {validation.errors.map((error, index) => (
                <li key={index}>
                  <Typography variant='body2'>{error.message}</Typography>
                </li>
              ))}
            </ul>
          </Alert>
        )}

        {validation.warnings.length > 0 && (
          <Alert severity='warning'>
            <Typography variant='body2' fontWeight={500} gutterBottom>
              주의사항:
            </Typography>
            <ul style={{ margin: 0, paddingLeft: 20 }}>
              {validation.warnings.map((warning, index) => (
                <li key={index}>
                  <Typography variant='body2'>{warning}</Typography>
                </li>
              ))}
            </ul>
          </Alert>
        )}

        {/* Basic Information */}
        <Box>
          <Typography
            variant='h6'
            gutterBottom
            sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
          >
            <PersonIcon color='primary' />
            기본 정보
          </Typography>

          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label='사용자명'
                value={formData.username || ''}
                onChange={e => handleInputChange('username', e.target.value)}
                required
                disabled={mode === 'edit'} // Username cannot be changed
                InputProps={{
                  startAdornment: (
                    <InputAdornment position='start'>
                      <PersonIcon color='action' />
                    </InputAdornment>
                  ),
                }}
                helperText={
                  mode === 'edit'
                    ? '사용자명은 변경할 수 없습니다'
                    : '3-50자, 영문/숫자/특수문자(.-_)만 사용'
                }
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label='이름'
                value={formData.fullName || ''}
                onChange={e => handleInputChange('fullName', e.target.value)}
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position='start'>
                      <PersonIcon color='action' />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label='이메일'
                type='email'
                value={formData.email || ''}
                onChange={e => handleInputChange('email', e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position='start'>
                      <EmailIcon color='action' />
                    </InputAdornment>
                  ),
                }}
                helperText='비밀번호 재설정 등에 사용됩니다'
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label='전화번호'
                value={formData.phone || ''}
                onChange={e => handleInputChange('phone', e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position='start'>
                      <PhoneIcon color='action' />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
          </Grid>
        </Box>

        {/* Organization Information */}
        <Box>
          <Typography
            variant='h6'
            gutterBottom
            sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
          >
            <BusinessIcon color='primary' />
            조직 정보
          </Typography>

          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>부서</InputLabel>
                <Select
                  value={formData.department || ''}
                  onChange={e =>
                    handleInputChange('department', e.target.value)
                  }
                  label='부서'
                >
                  <MenuItem value=''>
                    <em>선택 안함</em>
                  </MenuItem>
                  {DEFAULT_DEPARTMENTS.map(dept => (
                    <MenuItem key={dept} value={dept}>
                      {dept}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>직급</InputLabel>
                <Select
                  value={formData.position || ''}
                  onChange={e => handleInputChange('position', e.target.value)}
                  label='직급'
                >
                  <MenuItem value=''>
                    <em>선택 안함</em>
                  </MenuItem>
                  {DEFAULT_POSITIONS.map(position => (
                    <MenuItem key={position} value={position}>
                      {position}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </Box>

        {/* Security Settings */}
        <AdminGuard>
          <Box>
            <Typography
              variant='h6'
              gutterBottom
              sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
            >
              <SecurityIcon color='primary' />
              보안 설정
            </Typography>

            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>역할</InputLabel>
                  <Select
                    value={formData.role || 'user'}
                    onChange={e => handleInputChange('role', e.target.value)}
                    label='역할'
                    renderValue={value => (
                      <Box
                        sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                      >
                        {getRoleIcon(value as UserRole)}
                        {USER_ROLE_LABELS[value as UserRole]}
                      </Box>
                    )}
                  >
                    {Object.values(USER_ROLES).map(role => (
                      <MenuItem key={role} value={role}>
                        <Box
                          sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                        >
                          {getRoleIcon(role)}
                          <Box>
                            <Typography variant='body2'>
                              {USER_ROLE_LABELS[role]}
                            </Typography>
                            <Typography
                              variant='caption'
                              color='text.secondary'
                            >
                              {USER_ROLE_DESCRIPTIONS[role]}
                            </Typography>
                          </Box>
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>상태</InputLabel>
                  <Select
                    value={formData.status || 'active'}
                    onChange={e => handleInputChange('status', e.target.value)}
                    label='상태'
                  >
                    {Object.values(USER_STATUSES).map(status => (
                      <MenuItem key={status} value={status}>
                        {USER_STATUS_LABELS[status]}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>

            {/* Role Permissions Display */}
            <Box sx={{ mt: 2 }}>
              <Button
                variant='outlined'
                size='small'
                onClick={() => setShowPermissions(!showPermissions)}
                endIcon={
                  <ExpandIcon
                    sx={{
                      transform: showPermissions
                        ? 'rotate(180deg)'
                        : 'rotate(0deg)',
                      transition: 'transform 0.2s',
                    }}
                  />
                }
              >
                역할 권한 보기
              </Button>

              {showPermissions && (
                <RolePermissionDisplay role={formData.role as UserRole} />
              )}
            </Box>
          </Box>
        </AdminGuard>

        {/* Password Settings (Create mode only) */}
        {mode === 'create' && (
          <Box>
            <Typography
              variant='h6'
              gutterBottom
              sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
            >
              <PasswordIcon color='primary' />
              비밀번호 설정
            </Typography>

            <TextField
              fullWidth
              label='비밀번호'
              type={showPassword ? 'text' : 'password'}
              value={formData.password || ''}
              onChange={e => handleInputChange('password', e.target.value)}
              required
              InputProps={{
                startAdornment: (
                  <InputAdornment position='start'>
                    <PasswordIcon color='action' />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position='end'>
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge='end'
                    >
                      {showPassword ? (
                        <VisibilityOffIcon />
                      ) : (
                        <VisibilityIcon />
                      )}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              helperText='최소 8자, 대소문자, 숫자 포함'
            />

            <PasswordGenerator onPasswordGenerated={handlePasswordGenerated} />

            {passwordStrength && (
              <Box sx={{ mt: 2 }}>
                <Typography variant='caption' color='text.secondary'>
                  비밀번호 강도: {passwordStrength.score}/6
                </Typography>
                {passwordStrength.issues.length > 0 && (
                  <Alert severity='warning' sx={{ mt: 1 }}>
                    <ul style={{ margin: 0, paddingLeft: 20 }}>
                      {passwordStrength.issues.map((issue, index) => (
                        <li key={index}>
                          <Typography variant='caption'>{issue}</Typography>
                        </li>
                      ))}
                    </ul>
                  </Alert>
                )}
              </Box>
            )}
          </Box>
        )}
      </Stack>
    </FormModal>
  );
}

// ============================================================================
// EXPORTS
// ============================================================================

export default UserFormModal;
