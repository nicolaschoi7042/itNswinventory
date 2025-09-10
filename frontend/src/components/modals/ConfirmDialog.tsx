import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  IconButton,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  Warning as WarningIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  CheckCircle as SuccessIcon,
  Delete as DeleteIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { ReactNode } from 'react';

type ConfirmDialogVariant = 'warning' | 'error' | 'info' | 'success';

interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title: string;
  message: string | ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: ConfirmDialogVariant;
  loading?: boolean;
  disabled?: boolean;
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  showIcon?: boolean;
  destructive?: boolean;
  additionalInfo?: string | ReactNode;
  confirmColor?:
    | 'primary'
    | 'secondary'
    | 'error'
    | 'warning'
    | 'info'
    | 'success';
}

const variantConfig = {
  warning: {
    icon: WarningIcon,
    color: 'warning' as const,
    confirmColor: 'warning' as const,
  },
  error: {
    icon: ErrorIcon,
    color: 'error' as const,
    confirmColor: 'error' as const,
  },
  info: {
    icon: InfoIcon,
    color: 'info' as const,
    confirmColor: 'primary' as const,
  },
  success: {
    icon: SuccessIcon,
    color: 'success' as const,
    confirmColor: 'success' as const,
  },
};

export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'warning',
  loading = false,
  disabled = false,
  maxWidth = 'xs',
  showIcon = true,
  destructive = false,
  additionalInfo,
  confirmColor,
}: ConfirmDialogProps) {
  const [isConfirming, setIsConfirming] = useState(false);

  const config = variantConfig[variant];
  const IconComponent = config.icon;
  const finalConfirmColor =
    confirmColor || (destructive ? 'error' : config.confirmColor);

  const handleConfirm = async () => {
    if (loading || disabled || isConfirming) return;

    setIsConfirming(true);
    try {
      await onConfirm();
      onClose();
    } catch (error) {
      console.error('Confirm action failed:', error);
    } finally {
      setIsConfirming(false);
    }
  };

  const handleClose = () => {
    if (!loading && !isConfirming) {
      onClose();
    }
  };

  const isLoading = loading || isConfirming;

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth={maxWidth}
      fullWidth
      disableEscapeKeyDown={isLoading}
    >
      <DialogTitle
        sx={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          pr: 1,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          {showIcon && (
            <IconComponent color={config.color} sx={{ fontSize: 28 }} />
          )}
          <Typography variant='h6' component='h2' sx={{ fontWeight: 600 }}>
            {title}
          </Typography>
        </Box>

        <IconButton
          onClick={handleClose}
          disabled={isLoading}
          size='small'
          sx={{ mt: -0.5, mr: -0.5 }}
          aria-label='Close dialog'
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ pb: 2 }}>
        <Typography variant='body1' sx={{ mb: additionalInfo ? 2 : 0 }}>
          {message}
        </Typography>

        {additionalInfo && (
          <Alert severity={config.color} variant='outlined' sx={{ mt: 2 }}>
            {additionalInfo}
          </Alert>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button
          onClick={handleClose}
          disabled={isLoading}
          variant='outlined'
          color='inherit'
        >
          {cancelLabel}
        </Button>

        <Button
          onClick={handleConfirm}
          disabled={disabled || isLoading}
          variant='contained'
          color={finalConfirmColor}
          startIcon={
            isLoading ? (
              <CircularProgress size={16} color='inherit' />
            ) : destructive ? (
              <DeleteIcon />
            ) : undefined
          }
        >
          {isLoading ? 'Processing...' : confirmLabel}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// Specialized confirm dialogs for common use cases
interface DeleteConfirmDialogProps
  extends Omit<
    ConfirmDialogProps,
    'variant' | 'destructive' | 'confirmLabel' | 'title'
  > {
  itemName?: string;
  itemType?: string;
  customTitle?: string;
  showWarning?: boolean;
}

export function DeleteConfirmDialog({
  itemName,
  itemType = 'item',
  customTitle,
  showWarning = true,
  ...props
}: DeleteConfirmDialogProps) {
  const title = customTitle || `Delete ${itemType}`;
  const baseMessage = itemName
    ? `Are you sure you want to delete "${itemName}"?`
    : `Are you sure you want to delete this ${itemType}?`;

  const warningMessage = showWarning
    ? 'This action cannot be undone and may affect related data.'
    : undefined;

  return (
    <ConfirmDialog
      {...props}
      title={title}
      message={baseMessage}
      confirmLabel='Delete'
      variant='error'
      destructive
      additionalInfo={warningMessage}
    />
  );
}

interface LogoutConfirmDialogProps
  extends Omit<
    ConfirmDialogProps,
    'variant' | 'title' | 'message' | 'confirmLabel'
  > {
  showUnsavedWarning?: boolean;
}

export function LogoutConfirmDialog({
  showUnsavedWarning = false,
  ...props
}: LogoutConfirmDialogProps) {
  const warningMessage = showUnsavedWarning
    ? 'You have unsaved changes that will be lost.'
    : undefined;

  return (
    <ConfirmDialog
      {...props}
      title='Sign Out'
      message='Are you sure you want to sign out?'
      confirmLabel='Sign Out'
      variant='warning'
      additionalInfo={warningMessage}
    />
  );
}

interface UnsavedChangesDialogProps
  extends Omit<
    ConfirmDialogProps,
    'variant' | 'title' | 'message' | 'confirmLabel'
  > {
  action?: string;
}

export function UnsavedChangesDialog({
  action = 'leave',
  ...props
}: UnsavedChangesDialogProps) {
  return (
    <ConfirmDialog
      {...props}
      title='Unsaved Changes'
      message={`You have unsaved changes. Are you sure you want to ${action}?`}
      confirmLabel='Discard Changes'
      variant='warning'
      additionalInfo='All unsaved changes will be lost.'
    />
  );
}

// Hook for managing confirm dialog state
export function useConfirmDialog() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [config, setConfig] = useState<Partial<ConfirmDialogProps>>({});

  const showConfirm = (dialogConfig: Partial<ConfirmDialogProps> = {}) => {
    setConfig(dialogConfig);
    setOpen(true);
    setLoading(false);
  };

  const hideConfirm = () => {
    if (!loading) {
      setOpen(false);
      setConfig({});
    }
  };

  const setConfirmLoading = (isLoading: boolean) => {
    setLoading(isLoading);
  };

  // Quick access methods for common dialogs
  const showDeleteConfirm = (
    onConfirm: () => void | Promise<void>,
    options: Partial<DeleteConfirmDialogProps> = {}
  ) => {
    showConfirm({
      title: `Delete ${options.itemType || 'item'}`,
      message: options.itemName
        ? `Are you sure you want to delete "${options.itemName}"?`
        : `Are you sure you want to delete this ${options.itemType || 'item'}?`,
      confirmLabel: 'Delete',
      variant: 'error',
      destructive: true,
      additionalInfo: 'This action cannot be undone.',
      onConfirm,
      ...options,
    });
  };

  const showLogoutConfirm = (onConfirm: () => void | Promise<void>) => {
    showConfirm({
      title: 'Sign Out',
      message: 'Are you sure you want to sign out?',
      confirmLabel: 'Sign Out',
      variant: 'warning',
      onConfirm,
    });
  };

  const showUnsavedChangesConfirm = (
    onConfirm: () => void | Promise<void>,
    action: string = 'leave'
  ) => {
    showConfirm({
      title: 'Unsaved Changes',
      message: `You have unsaved changes. Are you sure you want to ${action}?`,
      confirmLabel: 'Discard Changes',
      variant: 'warning',
      additionalInfo: 'All unsaved changes will be lost.',
      onConfirm,
    });
  };

  return {
    open,
    loading,
    config,
    showConfirm,
    hideConfirm,
    setConfirmLoading,
    showDeleteConfirm,
    showLogoutConfirm,
    showUnsavedChangesConfirm,
  };
}

// HOC for adding confirm dialog to any component
export function withConfirmDialog<T extends object>(
  WrappedComponent: React.ComponentType<T>
) {
  return function WithConfirmDialogComponent(props: T) {
    const confirmDialog = useConfirmDialog();

    return (
      <>
        <WrappedComponent {...props} confirmDialog={confirmDialog} />

        <ConfirmDialog
          open={confirmDialog.open}
          onClose={confirmDialog.hideConfirm}
          loading={confirmDialog.loading}
          {...confirmDialog.config}
        />
      </>
    );
  };
}
