import { Box, Typography } from '@mui/material';
import { ReactNode } from 'react';

interface FormGroupProps {
  title?: string;
  children: ReactNode;
  spacing?: number;
}

export function FormGroup({ title, children, spacing = 2 }: FormGroupProps) {
  return (
    <Box sx={{ mb: spacing }}>
      {title && (
        <Typography
          variant="h6"
          component="legend"
          sx={{ 
            mb: 1, 
            fontWeight: 600,
            color: 'text.primary'
          }}
        >
          {title}
        </Typography>
      )}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {children}
      </Box>
    </Box>
  );
}

export default FormGroup;