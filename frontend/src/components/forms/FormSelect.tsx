import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  SelectProps,
} from '@mui/material';
import { forwardRef, ReactNode } from 'react';

interface Option {
  value: string | number;
  label: string;
}

interface FormSelectProps extends Omit<SelectProps, 'label'> {
  label: string;
  name: string;
  options: Option[];
  helperText?: string;
  error?: boolean;
}

export const FormSelect = forwardRef<HTMLDivElement, FormSelectProps>(
  ({ label, name, options, helperText, error, ...props }, ref) => {
    return (
      <FormControl fullWidth margin='normal' error={error}>
        <InputLabel>{label}</InputLabel>
        <Select ref={ref} name={name} label={label} {...props}>
          {options.map(option => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </Select>
        {helperText && <FormHelperText>{helperText}</FormHelperText>}
      </FormControl>
    );
  }
);

FormSelect.displayName = 'FormSelect';
