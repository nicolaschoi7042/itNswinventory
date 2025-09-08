import { useState, useEffect } from 'react';
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
  Collapse,
  LinearProgress,
  Snackbar,
  SnackbarContent,
} from '@mui/material';
import {
  Close as CloseIcon,
  CheckCircle as SuccessIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
} from '@mui/icons-material';
import { ReactNode } from 'react';

type AlertDialogSeverity = 'success' | 'error' | 'warning' | 'info';

interface AlertDialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  message: string | ReactNode;
  severity?: AlertDialogSeverity;
  autoHideDuration?: number | null;
  showIcon?: boolean;
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  actions?: ReactNode;
  details?: string | ReactNode;
  showDetails?: boolean;
  onAction?: () => void;
  actionLabel?: string;
  showProgress?: boolean;
  progress?: number;
  progressLabel?: string;
}

const severityConfig = {
  success: {
    icon: SuccessIcon,
    color: 'success' as const,
  },
  error: {
    icon: ErrorIcon,
    color: 'error' as const,
  },
  warning: {
    icon: WarningIcon,
    color: 'warning' as const,
  },
  info: {
    icon: InfoIcon,
    color: 'info' as const,
  },
};

export function AlertDialog({
  open,
  onClose,
  title,
  message,
  severity = 'info',
  autoHideDuration = null,
  showIcon = true,
  maxWidth = 'sm',
  actions,
  details,
  showDetails = false,
  onAction,
  actionLabel = 'OK',
  showProgress = false,
  progress = 0,
  progressLabel,
}: AlertDialogProps) {
  const [detailsExpanded, setDetailsExpanded] = useState(showDetails);

  const config = severityConfig[severity];
  const IconComponent = config.icon;

  useEffect(() => {
    if (open && autoHideDuration && autoHideDuration > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, autoHideDuration);

      return () => clearTimeout(timer);
    }
  }, [open, autoHideDuration, onClose]);

  const handleToggleDetails = () => {
    setDetailsExpanded(!detailsExpanded);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth={maxWidth}
      fullWidth
    >
      <DialogTitle
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          pr: 1,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          {showIcon && (
            <IconComponent
              color={config.color}
              sx={{ fontSize: 28 }}
            />
          )}
          <Typography variant="h6" component="h2" sx={{ fontWeight: 600 }}>
            {title}
          </Typography>
        </Box>

        <IconButton
          onClick={onClose}
          size="small"
          sx={{ mt: -0.5, mr: -0.5 }}
          aria-label="Close alert"
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ pb: showProgress ? 1 : 2 }}>
        <Typography variant="body1" sx={{ mb: details ? 2 : 0 }}>
          {message}
        </Typography>

        {showProgress && (
          <Box sx={{ mt: 2, mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Box sx={{ minWidth: 35 }}>
                <Typography variant="body2" color="text.secondary">
                  {Math.round(progress)}%
                </Typography>
              </Box>
              <Box sx={{ width: '100%', mr: 1 }}>
                <LinearProgress
                  variant="determinate"
                  value={progress}
                  color={config.color}
                />
              </Box>
            </Box>
            {progressLabel && (
              <Typography variant="body2" color="text.secondary">
                {progressLabel}
              </Typography>
            )}
          </Box>
        )}

        {details && (
          <>
            <Button
              onClick={handleToggleDetails}
              startIcon={detailsExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              variant="text"
              size="small"
              sx={{ mb: 1 }}
            >
              {detailsExpanded ? 'Hide Details' : 'Show Details'}
            </Button>
            
            <Collapse in={detailsExpanded}>
              <Alert severity={severity} variant="outlined">
                {typeof details === 'string' ? (
                  <Typography variant="body2">{details}</Typography>
                ) : (
                  details
                )}
              </Alert>
            </Collapse>
          </>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3 }}>
        {actions || (
          <>
            {onAction && (
              <Button
                onClick={onAction}
                variant="outlined"
                color={config.color}
              >
                {actionLabel}
              </Button>
            )}
            
            <Button
              onClick={onClose}
              variant="contained"
              color="primary"
              autoFocus
            >
              Close
            </Button>
          </>
        )}
      </DialogActions>
    </Dialog>
  );
}

// Toast notification component
interface ToastNotificationProps {
  open: boolean;
  onClose: () => void;
  message: string;
  severity?: AlertDialogSeverity;
  autoHideDuration?: number;
  action?: ReactNode;
  anchorOrigin?: {
    vertical: 'top' | 'bottom';
    horizontal: 'left' | 'center' | 'right';
  };
}

export function ToastNotification({
  open,
  onClose,
  message,
  severity = 'info',
  autoHideDuration = 6000,
  action,
  anchorOrigin = { vertical: 'top', horizontal: 'right' },
}: ToastNotificationProps) {
  const config = severityConfig[severity];
  const IconComponent = config.icon;

  return (
    <Snackbar
      open={open}
      autoHideDuration={autoHideDuration}
      onClose={onClose}
      anchorOrigin={anchorOrigin}
    >
      <SnackbarContent
        sx={{
          backgroundColor: `${config.color}.main`,
          color: `${config.color}.contrastText`,
          display: 'flex',
          alignItems: 'center',
          gap: 1,
        }}
        message={
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <IconComponent />
            <Typography variant="body2">{message}</Typography>
          </Box>
        }
        action={
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {action}
            <IconButton
              size="small"
              color="inherit"
              onClick={onClose}
              aria-label="close"
            >
              <CloseIcon />
            </IconButton>
          </Box>
        }
      />
    </Snackbar>
  );
}

// Specialized alert dialogs
interface ErrorAlertProps extends Omit<AlertDialogProps, 'severity' | 'title'> {
  error?: Error | string;
  showRetry?: boolean;
  onRetry?: () => void;
}

export function ErrorAlert({
  error,
  message,
  showRetry = false,
  onRetry,
  ...props
}: ErrorAlertProps) {
  const errorMessage = error instanceof Error ? error.message : error;
  const finalMessage = message || errorMessage || 'An unexpected error occurred.';
  
  const actions = showRetry && onRetry ? (
    <>
      <Button onClick={onRetry} variant="outlined" color="error">
        Retry
      </Button>
      <Button onClick={props.onClose} variant="contained" color="primary">
        Close
      </Button>
    </>
  ) : undefined;

  return (
    <AlertDialog
      {...props}
      title="Error"
      message={finalMessage}
      severity="error"
      details={error instanceof Error ? error.stack : undefined}
      actions={actions}
    />
  );
}

interface SuccessAlertProps extends Omit<AlertDialogProps, 'severity' | 'title'> {
  showAction?: boolean;
  actionLabel?: string;
  onAction?: () => void;
}

export function SuccessAlert({
  showAction = false,
  actionLabel = 'Continue',
  onAction,
  ...props
}: SuccessAlertProps) {
  const actions = showAction && onAction ? (
    <>
      <Button onClick={onAction} variant="contained" color="success">
        {actionLabel}
      </Button>
      <Button onClick={props.onClose} variant="outlined">
        Close
      </Button>
    </>
  ) : undefined;

  return (
    <AlertDialog
      {...props}
      title="Success"
      severity="success"
      actions={actions}
      autoHideDuration={showAction ? null : 3000}
    />
  );
}

interface ProgressAlertProps extends Omit<AlertDialogProps, 'showProgress' | 'severity'> {
  progress: number;
  progressLabel?: string;
  onCancel?: () => void;
  cancelLabel?: string;
}

export function ProgressAlert({
  progress,
  progressLabel,
  onCancel,
  cancelLabel = 'Cancel',
  ...props
}: ProgressAlertProps) {
  const actions = onCancel ? (
    <Button onClick={onCancel} variant="outlined" color="inherit">
      {cancelLabel}
    </Button>
  ) : undefined;

  return (
    <AlertDialog
      {...props}
      severity="info"
      showProgress
      progress={progress}
      progressLabel={progressLabel}
      actions={actions}
    />
  );
}

// Hook for managing alert dialogs
export function useAlertDialog() {
  const [alerts, setAlerts] = useState<Array<{
    id: string;
    props: AlertDialogProps;
  }>>([]);

  const showAlert = (alertProps: Omit<AlertDialogProps, 'open' | 'onClose'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newAlert = {
      id,
      props: {
        ...alertProps,
        open: true,
        onClose: () => hideAlert(id),
      },
    };
    setAlerts(prev => [...prev, newAlert]);
    return id;
  };

  const hideAlert = (id: string) => {
    setAlerts(prev => prev.filter(alert => alert.id !== id));
  };

  const hideAllAlerts = () => {
    setAlerts([]);
  };

  // Convenience methods
  const showSuccess = (message: string, options?: Partial<SuccessAlertProps>) => {
    return showAlert({
      title: 'Success',
      message,
      severity: 'success',
      autoHideDuration: 3000,
      ...options,
    });
  };

  const showError = (message: string | Error, options?: Partial<ErrorAlertProps>) => {
    const errorMessage = message instanceof Error ? message.message : message;
    return showAlert({
      title: 'Error',
      message: errorMessage,
      severity: 'error',
      details: message instanceof Error ? message.stack : undefined,
      ...options,
    });
  };

  const showWarning = (message: string, options?: Partial<AlertDialogProps>) => {
    return showAlert({
      title: 'Warning',
      message,
      severity: 'warning',
      ...options,
    });
  };

  const showInfo = (message: string, options?: Partial<AlertDialogProps>) => {
    return showAlert({
      title: 'Information',
      message,
      severity: 'info',
      ...options,
    });
  };

  // Render all alerts
  const renderAlerts = () => (
    <>
      {alerts.map(alert => (
        <AlertDialog key={alert.id} {...alert.props} />
      ))}
    </>
  );

  return {
    alerts,
    showAlert,
    hideAlert,
    hideAllAlerts,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    renderAlerts,
  };
}

// Hook for toast notifications
export function useToast() {
  const [toasts, setToasts] = useState<Array<{
    id: string;
    props: ToastNotificationProps;
  }>>([]);

  const showToast = (toastProps: Omit<ToastNotificationProps, 'open' | 'onClose'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newToast = {
      id,
      props: {
        ...toastProps,
        open: true,
        onClose: () => hideToast(id),
      },
    };
    setToasts(prev => [...prev, newToast]);
    return id;
  };

  const hideToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const hideAllToasts = () => {
    setToasts([]);
  };

  // Convenience methods
  const success = (message: string, options?: Partial<ToastNotificationProps>) => {
    return showToast({ message, severity: 'success', ...options });
  };

  const error = (message: string, options?: Partial<ToastNotificationProps>) => {
    return showToast({ message, severity: 'error', ...options });
  };

  const warning = (message: string, options?: Partial<ToastNotificationProps>) => {
    return showToast({ message, severity: 'warning', ...options });
  };

  const info = (message: string, options?: Partial<ToastNotificationProps>) => {
    return showToast({ message, severity: 'info', ...options });
  };

  // Render all toasts
  const renderToasts = () => (
    <>
      {toasts.map(toast => (
        <ToastNotification key={toast.id} {...toast.props} />
      ))}
    </>
  );

  return {
    toasts,
    showToast,
    hideToast,
    hideAllToasts,
    success,
    error,
    warning,
    info,
    renderToasts,
  };
}