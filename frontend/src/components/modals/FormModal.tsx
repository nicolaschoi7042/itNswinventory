import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  IconButton,
  Typography,
  Box,
  Divider,
  CircularProgress,
} from '@mui/material';
import {
  Close as CloseIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
} from '@mui/icons-material';
import { ReactNode, FormEvent } from 'react';

interface FormModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: ReactNode;
  onSubmit?: (event: FormEvent<HTMLFormElement>) => void | Promise<void>;
  submitLabel?: string;
  cancelLabel?: string;
  loading?: boolean;
  disabled?: boolean;
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  fullWidth?: boolean;
  disableEscapeKeyDown?: boolean;
  disableBackdropClick?: boolean;
  showDivider?: boolean;
  additionalActions?: ReactNode;
  formId?: string;
  hideActions?: boolean;
  customActions?: ReactNode;
}

export function FormModal({
  open,
  onClose,
  title,
  subtitle,
  children,
  onSubmit,
  submitLabel = 'Save',
  cancelLabel = 'Cancel',
  loading = false,
  disabled = false,
  maxWidth = 'sm',
  fullWidth = true,
  disableEscapeKeyDown = false,
  disableBackdropClick = false,
  showDivider = true,
  additionalActions,
  formId,
  hideActions = false,
  customActions
}: FormModalProps) {
  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (onSubmit && !loading && !disabled) {
      await onSubmit(event);
    }
  };

  const handleClose = () => {
    if (!loading && !disableBackdropClick) {
      onClose();
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth={maxWidth}
      fullWidth={fullWidth}
      disableEscapeKeyDown={disableEscapeKeyDown || loading}
      PaperProps={{
        component: onSubmit ? 'form' : 'div',
        onSubmit: onSubmit ? handleSubmit : undefined,
        id: formId,
        sx: {
          minHeight: 200,
          ...(loading && {
            pointerEvents: 'none',
            opacity: 0.7,
          }),
        },
      }}
    >
      {/* Dialog Header */}
      <DialogTitle
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          pb: showDivider ? 1 : 2,
          pr: 1,
        }}
      >
        <Box>
          <Typography variant="h6" component="h2" sx={{ fontWeight: 600 }}>
            {title}
          </Typography>
          {subtitle && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              {subtitle}
            </Typography>
          )}
        </Box>
        
        <IconButton
          onClick={onClose}
          disabled={loading}
          size="small"
          sx={{ mt: -0.5, mr: -0.5 }}
          aria-label="Close modal"
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      {showDivider && <Divider />}

      {/* Dialog Content */}
      <DialogContent
        sx={{
          py: 3,
          position: 'relative',
          minHeight: 120,
        }}
      >
        {loading && (
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'rgba(255, 255, 255, 0.8)',
              zIndex: 1,
            }}
          >
            <CircularProgress size={40} />
          </Box>
        )}
        
        {children}
      </DialogContent>

      {/* Dialog Actions */}
      {!hideActions && (
        <>
          {showDivider && <Divider />}
          <DialogActions
            sx={{
              px: 3,
              py: 2,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              {additionalActions}
            </Box>
            
            <Box sx={{ display: 'flex', gap: 1 }}>
              {customActions || (
                <>
                  <Button
                    onClick={onClose}
                    disabled={loading}
                    variant="outlined"
                    startIcon={<CancelIcon />}
                    color="inherit"
                  >
                    {cancelLabel}
                  </Button>
                  
                  {onSubmit && (
                    <Button
                      type="submit"
                      disabled={disabled || loading}
                      variant="contained"
                      startIcon={loading ? <CircularProgress size={16} /> : <SaveIcon />}
                      color="primary"
                    >
                      {loading ? 'Saving...' : submitLabel}
                    </Button>
                  )}
                </>
              )}
            </Box>
          </DialogActions>
        </>
      )}
    </Dialog>
  );
}

// Specialized form modal variants
interface ConfirmFormModalProps extends Omit<FormModalProps, 'onSubmit'> {
  onConfirm: () => void | Promise<void>;
  confirmLabel?: string;
  confirmColor?: 'primary' | 'secondary' | 'error' | 'warning' | 'info' | 'success';
  showCancel?: boolean;
}

export function ConfirmFormModal({
  onConfirm,
  confirmLabel = 'Confirm',
  confirmColor = 'primary',
  showCancel = true,
  ...props
}: ConfirmFormModalProps) {
  const handleConfirm = async () => {
    if (!props.loading && !props.disabled) {
      await onConfirm();
    }
  };

  const customActions = (
    <>
      {showCancel && (
        <Button
          onClick={props.onClose}
          disabled={props.loading}
          variant="outlined"
          color="inherit"
        >
          {props.cancelLabel || 'Cancel'}
        </Button>
      )}
      
      <Button
        onClick={handleConfirm}
        disabled={props.disabled || props.loading}
        variant="contained"
        color={confirmColor}
        startIcon={props.loading ? <CircularProgress size={16} /> : <SaveIcon />}
      >
        {props.loading ? 'Processing...' : confirmLabel}
      </Button>
    </>
  );

  return (
    <FormModal
      {...props}
      customActions={customActions}
    />
  );
}

// Quick access form modal with common configurations
interface QuickFormModalProps extends Omit<FormModalProps, 'maxWidth' | 'fullWidth'> {
  size?: 'small' | 'medium' | 'large' | 'extra-large';
}

export function QuickFormModal({ 
  size = 'medium', 
  ...props 
}: QuickFormModalProps) {
  const sizeConfig = {
    small: { maxWidth: 'xs' as const, fullWidth: true },
    medium: { maxWidth: 'sm' as const, fullWidth: true },
    large: { maxWidth: 'md' as const, fullWidth: true },
    'extra-large': { maxWidth: 'lg' as const, fullWidth: true },
  };

  return (
    <FormModal
      {...props}
      {...sizeConfig[size]}
    />
  );
}

// Hook for managing form modal state
export function useFormModal(initialOpen: boolean = false) {
  const [open, setOpen] = useState(initialOpen);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const openModal = () => {
    setOpen(true);
    setError(null);
  };

  const closeModal = () => {
    if (!loading) {
      setOpen(false);
      setError(null);
    }
  };

  const setModalLoading = (isLoading: boolean) => {
    setLoading(isLoading);
  };

  const setModalError = (errorMessage: string | null) => {
    setError(errorMessage);
  };

  return {
    open,
    loading,
    error,
    openModal,
    closeModal,
    setModalLoading,
    setModalError,
  };
}