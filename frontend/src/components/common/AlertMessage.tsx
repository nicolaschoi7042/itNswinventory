import { Alert, AlertTitle, Snackbar } from '@mui/material';
import { ReactNode } from 'react';

type AlertSeverity = 'error' | 'warning' | 'info' | 'success';

interface AlertMessageProps {
  open: boolean;
  onClose: () => void;
  severity: AlertSeverity;
  title?: string;
  children: ReactNode;
  autoHideDuration?: number;
}

export function AlertMessage({ 
  open, 
  onClose, 
  severity, 
  title, 
  children,
  autoHideDuration = 6000 
}: AlertMessageProps) {
  return (
    <Snackbar
      open={open}
      autoHideDuration={autoHideDuration}
      onClose={onClose}
      anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
    >
      <Alert 
        onClose={onClose} 
        severity={severity}
        variant="filled"
        sx={{ width: '100%' }}
      >
        {title && <AlertTitle>{title}</AlertTitle>}
        {children}
      </Alert>
    </Snackbar>
  );
}

// Static alert component for inline display
interface InlineAlertProps {
  severity: AlertSeverity;
  title?: string;
  children: ReactNode;
  onClose?: () => void;
}

export function InlineAlert({ severity, title, children, onClose }: InlineAlertProps) {
  return (
    <Alert 
      severity={severity}
      {...(onClose && { onClose: () => onClose() })}
      sx={{ mb: 2 }}
    >
      {title && <AlertTitle>{title}</AlertTitle>}
      {children}
    </Alert>
  );
}