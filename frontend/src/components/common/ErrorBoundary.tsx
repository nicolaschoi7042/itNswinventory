'use client';

import { Component, ReactNode } from 'react';
import { Box, Typography, Button, Paper } from '@mui/material';
import { Refresh as RefreshIcon } from '@mui/icons-material';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  override componentDidCatch(error: Error, errorInfo: any) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false });
  };

  override render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <Paper
          elevation={1}
          sx={{
            p: 4,
            m: 2,
            textAlign: 'center',
            borderColor: 'error.main',
            borderWidth: 1,
            borderStyle: 'solid',
          }}
        >
          <Typography variant='h6' color='error.main' gutterBottom>
            오류가 발생했습니다
          </Typography>

          <Typography variant='body2' color='text.secondary' sx={{ mb: 3 }}>
            컴포넌트를 로드하는 중 문제가 발생했습니다.
          </Typography>

          {this.state.error && (
            <Box
              sx={{
                backgroundColor: 'error.light',
                color: 'error.contrastText',
                p: 2,
                borderRadius: 1,
                mb: 3,
                fontFamily: 'monospace',
                fontSize: '0.75rem',
                textAlign: 'left',
                overflow: 'auto',
              }}
            >
              {this.state.error.message}
            </Box>
          )}

          <Button
            variant='outlined'
            startIcon={<RefreshIcon />}
            onClick={this.handleReset}
          >
            다시 시도
          </Button>
        </Paper>
      );
    }

    return this.props.children;
  }
}
