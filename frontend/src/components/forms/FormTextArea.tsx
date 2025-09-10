import { TextField, TextFieldProps } from '@mui/material';
import { forwardRef } from 'react';

interface FormTextAreaProps
  extends Omit<TextFieldProps, 'variant' | 'multiline'> {
  label: string;
  name: string;
  rows?: number;
}

export const FormTextArea = forwardRef<HTMLDivElement, FormTextAreaProps>(
  ({ label, name, rows = 4, ...props }, ref) => {
    return (
      <TextField
        ref={ref}
        name={name}
        label={label}
        variant='outlined'
        fullWidth
        margin='normal'
        multiline
        rows={rows}
        {...props}
      />
    );
  }
);

FormTextArea.displayName = 'FormTextArea';
