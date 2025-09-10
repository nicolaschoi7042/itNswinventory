'use client';

import { useEffect } from 'react';
import { Box, Container, Typography, Button } from '@mui/material';
import { Refresh as RefreshIcon, Home as HomeIcon } from '@mui/icons-material';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log the error to error reporting service
    console.error('Application error:', error);
  }, [error]);

  return (
    <Container maxWidth='md'>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          textAlign: 'center',
          gap: 3,
        }}
      >
        <Typography variant='h4' component='h1' color='error.main' gutterBottom>
          오류가 발생했습니다
        </Typography>

        <Typography
          variant='body1'
          color='text.secondary'
          sx={{ maxWidth: 500 }}
        >
          시스템에 일시적인 문제가 발생했습니다. 페이지를 새로고침하거나 잠시 후
          다시 시도해 주세요.
        </Typography>

        {error.message && (
          <Box
            sx={{
              backgroundColor: 'error.light',
              color: 'error.contrastText',
              p: 2,
              borderRadius: 1,
              maxWidth: 600,
              fontFamily: 'monospace',
              fontSize: '0.875rem',
              wordBreak: 'break-all',
            }}
          >
            {error.message}
          </Box>
        )}

        <Box
          sx={{
            display: 'flex',
            gap: 2,
            flexWrap: 'wrap',
            justifyContent: 'center',
          }}
        >
          <Button
            variant='contained'
            size='large'
            startIcon={<RefreshIcon />}
            onClick={reset}
            sx={{ minWidth: 150 }}
          >
            다시 시도
          </Button>

          <Button
            variant='outlined'
            size='large'
            startIcon={<HomeIcon />}
            onClick={() => (window.location.href = '/dashboard')}
            sx={{ minWidth: 150 }}
          >
            대시보드로
          </Button>
        </Box>
      </Box>
    </Container>
  );
}
