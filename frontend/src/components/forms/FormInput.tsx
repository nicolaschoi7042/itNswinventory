import { TextField, TextFieldProps } from '@mui/material';
import { forwardRef } from 'react';

interface FormInputProps extends Omit<TextFieldProps, 'variant'> {
  label: string;
  name: string;
}

export const FormInput = forwardRef<HTMLDivElement, FormInputProps>(
  ({ label, name, ...props }, ref) => {
    return (
      <TextField
        ref={ref}
        name={name}
        label={label}
        variant='outlined'
        fullWidth
        margin='normal'
        {...props}
      />
    );
  }
);

FormInput.displayName = 'FormInput';
