import { Button, ButtonProps } from '@mui/material';
import { ReactNode } from 'react';

interface FormButtonProps extends ButtonProps {
  children: ReactNode;
  loading?: boolean;
}

export function FormButton({
  children,
  loading,
  disabled,
  ...props
}: FormButtonProps) {
  return (
    <Button disabled={disabled || loading} {...props}>
      {children}
    </Button>
  );
}

export default FormButton;
