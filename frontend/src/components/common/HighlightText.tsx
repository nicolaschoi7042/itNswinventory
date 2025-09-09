import { Box, Typography } from '@mui/material';
import { ReactNode } from 'react';

interface HighlightTextProps {
  text: string;
  searchTerm: string;
  variant?: 'body1' | 'body2' | 'caption' | 'subtitle1' | 'subtitle2';
  color?: 'text.primary' | 'text.secondary' | 'inherit';
  highlightColor?: string;
  highlightBackground?: string;
}

export function HighlightText({
  text,
  searchTerm,
  variant = 'body2',
  color = 'inherit',
  highlightColor = '#d32f2f',
  highlightBackground = '#ffebee'
}: HighlightTextProps) {
  if (!searchTerm || !text) {
    return (
      <Typography variant={variant} color={color} component="span">
        {text || '-'}
      </Typography>
    );
  }

  const parts = text.split(new RegExp(`(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi'));

  return (
    <Typography variant={variant} color={color} component="span">
      {parts.map((part, index) => 
        part.toLowerCase() === searchTerm.toLowerCase() ? (
          <Box
            key={index}
            component="span"
            sx={{
              backgroundColor: highlightBackground,
              color: highlightColor,
              fontWeight: 'bold',
              px: 0.5,
              borderRadius: 0.5
            }}
          >
            {part}
          </Box>
        ) : (
          part
        )
      )}
    </Typography>
  );
}

// Hook for creating highlighted text renderer
export function useHighlightRenderer(searchTerm: string) {
  return (text: string | undefined | null, options?: Partial<HighlightTextProps>) => (
    <HighlightText
      text={text || ''}
      searchTerm={searchTerm}
      {...options}
    />
  );
}