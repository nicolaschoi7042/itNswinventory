/**
 * Employee Information Display Components
 * 
 * Components for displaying employee information in various contexts
 * with consistent styling and enhanced visual presentation.
 */

import React from 'react';
import {
  Box,
  Typography,
  Avatar,
  Card,
  CardContent,
  Chip,
  Tooltip,
  Badge,
  Stack,
  Divider,
  useTheme,
  alpha
} from '@mui/material';
import {
  Person as PersonIcon,
  Email as EmailIcon,
  Business as BusinessIcon,
  Work as WorkIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
  Assignment as AssignmentIcon
} from '@mui/icons-material';

// ============================================================================
// TYPES AND INTERFACES
// ============================================================================

interface EmployeeInfo {
  id: string;
  name: string;
  department: string;
  position: string;
  email?: string;
  phone?: string;
  location?: string;
  avatar?: string;
}

interface EmployeeInfoDisplayProps {
  employee: EmployeeInfo;
  variant?: 'compact' | 'standard' | 'detailed' | 'card';
  showAvatar?: boolean;
  showContact?: boolean;
  showDepartment?: boolean;
  showPosition?: boolean;
  size?: 'small' | 'medium' | 'large';
  assignmentCount?: number;
  onEmployeeClick?: (employee: EmployeeInfo) => void;
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

const getInitials = (name: string): string => {
  return name
    .split(' ')
    .map(part => part.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

const getDepartmentColor = (department: string): string => {
  const colors = ['primary', 'secondary', 'success', 'warning', 'info', 'error'];
  const hash = department.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return colors[hash % colors.length];
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function EmployeeInfoDisplay({
  employee,
  variant = 'standard',
  showAvatar = true,
  showContact = true,
  showDepartment = true,
  showPosition = true,
  size = 'medium',
  assignmentCount,
  onEmployeeClick
}: EmployeeInfoDisplayProps) {
  const theme = useTheme();
  
  const avatarSize = size === 'large' ? 56 : size === 'medium' ? 40 : 32;
  const departmentColor = getDepartmentColor(employee.department);

  // Compact variant - minimal display
  if (variant === 'compact') {
    return (
      <Box 
        sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 1,
          cursor: onEmployeeClick ? 'pointer' : 'default',
          '&:hover': onEmployeeClick ? {
            backgroundColor: alpha(theme.palette.primary.main, 0.04),
            borderRadius: 1
          } : {}
        }}
        onClick={() => onEmployeeClick?.(employee)}
      >
        {showAvatar && (
          <Avatar 
            src={employee.avatar}
            sx={{ 
              width: avatarSize, 
              height: avatarSize, 
              bgcolor: `${departmentColor}.main`,
              fontSize: size === 'large' ? '1.2rem' : size === 'medium' ? '1rem' : '0.8rem'
            }}
          >
            {employee.avatar ? null : getInitials(employee.name)}
          </Avatar>
        )}
        <Box sx={{ minWidth: 0, flexGrow: 1 }}>
          <Typography 
            variant={size === 'large' ? 'subtitle1' : 'body2'} 
            fontWeight="medium"
            noWrap
          >
            {employee.name}
          </Typography>
          {showDepartment && (
            <Typography 
              variant="caption" 
              color="text.secondary"
              noWrap
            >
              {employee.department}
            </Typography>
          )}
        </Box>
        {assignmentCount !== undefined && (
          <Badge
            badgeContent={assignmentCount}
            color="primary"
            sx={{
              '& .MuiBadge-badge': {
                fontSize: '0.7rem',
                minWidth: 16,
                height: 16
              }
            }}
          >
            <AssignmentIcon fontSize="small" color="action" />
          </Badge>
        )}
      </Box>
    );
  }

  // Card variant - full card display
  if (variant === 'card') {
    return (
      <Card 
        sx={{ 
          cursor: onEmployeeClick ? 'pointer' : 'default',
          '&:hover': onEmployeeClick ? {
            boxShadow: theme.shadows[4],
            transform: 'translateY(-2px)'
          } : {},
          transition: 'all 0.2s ease-in-out'
        }}
        onClick={() => onEmployeeClick?.(employee)}
      >
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
            {showAvatar && (
              <Avatar 
                src={employee.avatar}
                sx={{ 
                  width: 64, 
                  height: 64, 
                  bgcolor: `${departmentColor}.main`,
                  fontSize: '1.5rem'
                }}
              >
                {employee.avatar ? null : getInitials(employee.name)}
              </Avatar>
            )}
            <Box sx={{ flexGrow: 1, minWidth: 0 }}>
              <Typography variant="h6" gutterBottom>
                {employee.name}
              </Typography>
              
              {showPosition && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
                  <WorkIcon fontSize="small" color="action" />
                  <Typography variant="body2" color="text.secondary">
                    {employee.position}
                  </Typography>
                </Box>
              )}
              
              {showDepartment && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
                  <BusinessIcon fontSize="small" color="action" />
                  <Chip
                    label={employee.department}
                    size="small"
                    color={departmentColor as any}
                    variant="outlined"
                  />
                </Box>
              )}

              {showContact && (
                <Stack spacing={0.5} sx={{ mt: 2 }}>
                  {employee.email && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <EmailIcon fontSize="small" color="action" />
                      <Typography variant="caption" color="text.secondary">
                        {employee.email}
                      </Typography>
                    </Box>
                  )}
                  {employee.phone && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <PhoneIcon fontSize="small" color="action" />
                      <Typography variant="caption" color="text.secondary">
                        {employee.phone}
                      </Typography>
                    </Box>
                  )}
                  {employee.location && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <LocationIcon fontSize="small" color="action" />
                      <Typography variant="caption" color="text.secondary">
                        {employee.location}
                      </Typography>
                    </Box>
                  )}
                </Stack>
              )}

              {assignmentCount !== undefined && (
                <Box sx={{ mt: 2, pt: 2, borderTop: `1px solid ${theme.palette.divider}` }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <AssignmentIcon fontSize="small" color="primary" />
                    <Typography variant="body2" color="primary.main">
                      할당된 자산: {assignmentCount}개
                    </Typography>
                  </Box>
                </Box>
              )}
            </Box>
          </Box>
        </CardContent>
      </Card>
    );
  }

  // Detailed variant - comprehensive information
  if (variant === 'detailed') {
    return (
      <Box 
        sx={{ 
          display: 'flex', 
          gap: 2,
          cursor: onEmployeeClick ? 'pointer' : 'default',
          '&:hover': onEmployeeClick ? {
            backgroundColor: alpha(theme.palette.primary.main, 0.04),
            borderRadius: 1,
            p: 1,
            m: -1
          } : {}
        }}
        onClick={() => onEmployeeClick?.(employee)}
      >
        {showAvatar && (
          <Avatar 
            src={employee.avatar}
            sx={{ 
              width: avatarSize, 
              height: avatarSize, 
              bgcolor: `${departmentColor}.main`,
              fontSize: size === 'large' ? '1.2rem' : '1rem'
            }}
          >
            {employee.avatar ? null : getInitials(employee.name)}
          </Avatar>
        )}
        <Box sx={{ flexGrow: 1, minWidth: 0 }}>
          <Typography 
            variant={size === 'large' ? 'h6' : 'subtitle1'} 
            fontWeight="medium"
            gutterBottom
          >
            {employee.name}
          </Typography>
          
          <Stack spacing={0.5}>
            {showPosition && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <WorkIcon fontSize="small" color="action" />
                <Typography variant="body2" color="text.secondary">
                  {employee.position}
                </Typography>
              </Box>
            )}
            
            {showDepartment && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <BusinessIcon fontSize="small" color="action" />
                <Chip
                  label={employee.department}
                  size="small"
                  color={departmentColor as any}
                  variant="outlined"
                />
              </Box>
            )}
            
            {showContact && employee.email && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <EmailIcon fontSize="small" color="action" />
                <Typography variant="caption" color="text.secondary">
                  {employee.email}
                </Typography>
              </Box>
            )}
          </Stack>

          {assignmentCount !== undefined && (
            <Box sx={{ mt: 1, display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <AssignmentIcon fontSize="small" color="primary" />
              <Typography variant="caption" color="primary.main">
                {assignmentCount}개 할당
              </Typography>
            </Box>
          )}
        </Box>
      </Box>
    );
  }

  // Standard variant - default display
  return (
    <Box 
      sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: 1.5,
        cursor: onEmployeeClick ? 'pointer' : 'default',
        '&:hover': onEmployeeClick ? {
          backgroundColor: alpha(theme.palette.primary.main, 0.04),
          borderRadius: 1
        } : {}
      }}
      onClick={() => onEmployeeClick?.(employee)}
    >
      {showAvatar && (
        <Avatar 
          src={employee.avatar}
          sx={{ 
            width: avatarSize, 
            height: avatarSize, 
            bgcolor: `${departmentColor}.main`,
            fontSize: size === 'large' ? '1.2rem' : size === 'medium' ? '1rem' : '0.8rem'
          }}
        >
          {employee.avatar ? null : getInitials(employee.name)}
        </Avatar>
      )}
      <Box sx={{ flexGrow: 1, minWidth: 0 }}>
        <Typography 
          variant={size === 'large' ? 'subtitle1' : 'body2'} 
          fontWeight="medium"
        >
          {employee.name}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
          {showDepartment && (
            <Typography variant="caption" color="text.secondary">
              {employee.department}
            </Typography>
          )}
          {showPosition && showDepartment && (
            <Typography variant="caption" color="text.disabled">
              •
            </Typography>
          )}
          {showPosition && (
            <Typography variant="caption" color="text.secondary">
              {employee.position}
            </Typography>
          )}
        </Box>
        {showContact && employee.email && (
          <Typography variant="caption" color="text.secondary" noWrap>
            {employee.email}
          </Typography>
        )}
      </Box>
      {assignmentCount !== undefined && (
        <Tooltip title={`할당된 자산 ${assignmentCount}개`}>
          <Badge
            badgeContent={assignmentCount}
            color="primary"
            sx={{
              '& .MuiBadge-badge': {
                fontSize: '0.7rem',
                minWidth: 16,
                height: 16
              }
            }}
          >
            <AssignmentIcon fontSize="small" color="action" />
          </Badge>
        </Tooltip>
      )}
    </Box>
  );
}

// ============================================================================
// QUICK EMPLOYEE CARD COMPONENT
// ============================================================================

interface QuickEmployeeCardProps {
  employee: EmployeeInfo;
  assignments?: number;
  onClick?: () => void;
}

export function QuickEmployeeCard({ 
  employee, 
  assignments, 
  onClick 
}: QuickEmployeeCardProps) {
  const theme = useTheme();
  const departmentColor = getDepartmentColor(employee.department);

  return (
    <Card 
      sx={{ 
        cursor: onClick ? 'pointer' : 'default',
        transition: 'all 0.2s ease-in-out',
        '&:hover': onClick ? {
          transform: 'translateY(-1px)',
          boxShadow: theme.shadows[3]
        } : {}
      }}
      onClick={onClick}
    >
      <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Avatar 
            src={employee.avatar}
            sx={{ 
              width: 48, 
              height: 48, 
              bgcolor: `${departmentColor}.main`,
              fontSize: '1.1rem'
            }}
          >
            {employee.avatar ? null : getInitials(employee.name)}
          </Avatar>
          <Box sx={{ flexGrow: 1, minWidth: 0 }}>
            <Typography variant="subtitle2" fontWeight="medium" noWrap>
              {employee.name}
            </Typography>
            <Typography variant="caption" color="text.secondary" noWrap>
              {employee.position}
            </Typography>
            <Box sx={{ mt: 0.5 }}>
              <Chip
                label={employee.department}
                size="small"
                color={departmentColor as any}
                variant="outlined"
                sx={{ fontSize: '0.7rem' }}
              />
            </Box>
          </Box>
          {assignments !== undefined && (
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h6" color="primary.main">
                {assignments}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                할당
              </Typography>
            </Box>
          )}
        </Box>
      </CardContent>
    </Card>
  );
}

// ============================================================================
// EXPORTS
// ============================================================================

export default EmployeeInfoDisplay;