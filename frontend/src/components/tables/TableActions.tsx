import { 
  Box, 
  Button, 
  IconButton, 
  Tooltip, 
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
  ButtonGroup,
  Typography,
} from '@mui/material';
import { 
  MoreVert as MoreVertIcon,
  Visibility as ViewIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Download as DownloadIcon,
  Upload as UploadIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { ReactNode, useState } from 'react';

export type UserRole = 'admin' | 'manager' | 'user';

interface TableAction {
  label: string;
  icon?: ReactNode;
  onClick: () => void;
  variant?: 'text' | 'outlined' | 'contained';
  color?: 'primary' | 'secondary' | 'success' | 'error' | 'info' | 'warning';
  disabled?: boolean;
  tooltip?: string;
  requiresRole?: UserRole | UserRole[];
  confirmMessage?: string;
  loading?: boolean;
  startIcon?: ReactNode;
  endIcon?: ReactNode;
}

interface RowAction {
  label: string;
  icon?: ReactNode;
  onClick: (rowData?: any, index?: number) => void;
  color?: 'primary' | 'secondary' | 'success' | 'error' | 'info' | 'warning';
  disabled?: boolean | ((rowData?: any, index?: number) => boolean);
  tooltip?: string;
  requiresRole?: UserRole | UserRole[];
  confirmMessage?: string;
  divider?: boolean; // Add divider after this action
}

interface TableActionsProps {
  actions?: TableAction[];
  rowActions?: RowAction[];
  rowData?: any;
  rowIndex?: number;
  currentUserRole?: UserRole;
  dense?: boolean;
  showLabels?: boolean;
  variant?: 'buttons' | 'menu' | 'mixed';
  maxVisibleActions?: number;
}

export function TableActions({ 
  actions = [],
  rowActions = [],
  rowData,
  rowIndex,
  currentUserRole = 'user',
  dense = false,
  showLabels = true,
  variant = 'buttons',
  maxVisibleActions = 3
}: TableActionsProps) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const hasRole = (requiredRole: UserRole | UserRole[]): boolean => {
    if (!requiredRole) return true;
    
    const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
    
    // Admin has access to everything
    if (currentUserRole === 'admin') return true;
    
    // Manager has access to manager and user actions
    if (currentUserRole === 'manager') {
      return roles.includes('manager') || roles.includes('user');
    }
    
    // User only has access to user actions
    return roles.includes('user');
  };

  const filteredActions = actions.filter(action => hasRole(action.requiresRole || 'user'));
  const filteredRowActions = rowActions.filter(action => hasRole(action.requiresRole || 'user'));

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleActionClick = (action: TableAction) => {
    if (action.confirmMessage) {
      if (window.confirm(action.confirmMessage)) {
        action.onClick();
      }
    } else {
      action.onClick();
    }
  };

  const handleRowActionClick = (action: RowAction) => {
    handleMenuClose();
    if (action.confirmMessage) {
      if (window.confirm(action.confirmMessage)) {
        action.onClick(rowData, rowIndex);
      }
    } else {
      action.onClick(rowData, rowIndex);
    }
  };

  const renderAction = (action: TableAction, key: number) => {
    const isDisabled = action.disabled || action.loading;
    const ButtonComponent = (
      <Button
        key={key}
        variant={action.variant || 'outlined'}
        color={action.color || 'primary'}
        size={dense ? 'small' : 'medium'}
        disabled={isDisabled}
        onClick={() => handleActionClick(action)}
        startIcon={action.startIcon || action.icon}
        endIcon={action.endIcon}
        sx={{ minWidth: showLabels ? 'auto' : '40px' }}
      >
        {showLabels ? action.label : null}
      </Button>
    );

    return action.tooltip ? (
      <Tooltip key={key} title={action.tooltip}>
        <span>{ButtonComponent}</span>
      </Tooltip>
    ) : ButtonComponent;
  };

  const renderRowAction = (action: RowAction, key: number) => {
    const isDisabled = typeof action.disabled === 'function' 
      ? action.disabled(rowData, rowIndex)
      : action.disabled || false;

    return (
      <Box key={key}>
        <MenuItem 
          onClick={() => handleRowActionClick(action)}
          disabled={isDisabled}
        >
          {action.icon && <ListItemIcon>{action.icon}</ListItemIcon>}
          <ListItemText>{action.label}</ListItemText>
        </MenuItem>
        {action.divider && <Divider />}
      </Box>
    );
  };

  // For table header actions
  if (actions.length > 0 && !rowData) {
    const visibleActions = variant === 'mixed' 
      ? filteredActions.slice(0, maxVisibleActions)
      : filteredActions;
    
    const menuActions = variant === 'mixed' 
      ? filteredActions.slice(maxVisibleActions)
      : [];

    return (
      <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
        {variant === 'buttons' || variant === 'mixed' ? (
          <ButtonGroup size={dense ? 'small' : 'medium'} variant="outlined">
            {visibleActions.map(renderAction)}
          </ButtonGroup>
        ) : null}
        
        {(variant === 'menu' || (variant === 'mixed' && menuActions.length > 0)) && (
          <>
            <IconButton
              size={dense ? 'small' : 'medium'}
              onClick={handleMenuOpen}
              aria-label="More actions"
            >
              <MoreVertIcon />
            </IconButton>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
              transformOrigin={{ horizontal: 'right', vertical: 'top' }}
              anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            >
              {(variant === 'menu' ? filteredActions : menuActions).map((action, index) => (
                <MenuItem 
                  key={index}
                  onClick={() => {
                    handleMenuClose();
                    handleActionClick(action);
                  }}
                  disabled={action.disabled || action.loading}
                >
                  {action.icon && <ListItemIcon>{action.icon}</ListItemIcon>}
                  <ListItemText>{action.label}</ListItemText>
                </MenuItem>
              ))}
            </Menu>
          </>
        )}
      </Box>
    );
  }

  // For row actions
  if (filteredRowActions.length > 0 && rowData) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <IconButton
          size={dense ? 'small' : 'medium'}
          onClick={handleMenuOpen}
          aria-label="Row actions"
        >
          <MoreVertIcon />
        </IconButton>
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        >
          {filteredRowActions.map(renderRowAction)}
        </Menu>
      </Box>
    );
  }

  return null;
}

// Pre-defined common actions with role-based access
export const commonTableActions = {
  add: (onClick: () => void, requiresRole: UserRole | UserRole[] = 'manager'): TableAction => ({
    label: 'Add New',
    icon: <AddIcon />,
    onClick,
    variant: 'contained',
    color: 'primary',
    requiresRole,
    tooltip: 'Add new item'
  }),
  
  refresh: (onClick: () => void): TableAction => ({
    label: 'Refresh',
    icon: <RefreshIcon />,
    onClick,
    variant: 'outlined',
    requiresRole: 'user',
    tooltip: 'Refresh data'
  }),

  export: (onClick: () => void): TableAction => ({
    label: 'Export',
    icon: <DownloadIcon />,
    onClick,
    variant: 'outlined',
    requiresRole: 'user',
    tooltip: 'Export to Excel'
  }),

  import: (onClick: () => void, requiresRole: UserRole | UserRole[] = 'manager'): TableAction => ({
    label: 'Import',
    icon: <UploadIcon />,
    onClick,
    variant: 'outlined',
    requiresRole,
    tooltip: 'Import from file'
  }),
};

export const commonRowActions = {
  view: (onClick: (rowData?: any, index?: number) => void): RowAction => ({
    label: 'View Details',
    icon: <ViewIcon />,
    onClick,
    requiresRole: 'user',
    tooltip: 'View item details'
  }),

  edit: (onClick: (rowData?: any, index?: number) => void, requiresRole: UserRole | UserRole[] = 'manager'): RowAction => ({
    label: 'Edit',
    icon: <EditIcon />,
    onClick,
    requiresRole,
    tooltip: 'Edit item',
    color: 'primary'
  }),

  delete: (onClick: (rowData?: any, index?: number) => void, requiresRole: UserRole | UserRole[] = 'admin'): RowAction => ({
    label: 'Delete',
    icon: <DeleteIcon />,
    onClick,
    requiresRole,
    tooltip: 'Delete item',
    color: 'error',
    confirmMessage: 'Are you sure you want to delete this item? This action cannot be undone.',
    divider: true
  }),
};

// Hook for getting current user role (to be implemented with your auth system)
export function useUserRole(): UserRole {
  // This would typically get the role from your auth context/state
  // For now, return a default role
  const user = localStorage.getItem('inventory_user');
  if (user) {
    try {
      const userData = JSON.parse(user);
      return userData.role || 'user';
    } catch {
      return 'user';
    }
  }
  return 'user';
}

// Utility function to check if user has required role
export function checkRole(userRole: UserRole, requiredRole: UserRole | UserRole[]): boolean {
  if (!requiredRole) return true;
  
  const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
  
  if (userRole === 'admin') return true;
  if (userRole === 'manager') return roles.includes('manager') || roles.includes('user');
  return roles.includes('user');
}