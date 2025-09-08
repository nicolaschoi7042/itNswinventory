'use client';

// Login page for IT Asset & Software Inventory Management System
// Matches the design and functionality of the original vanilla JavaScript version

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  InputAdornment,
  IconButton,
  Fade,
  CircularProgress,
  Container,
  Divider,
} from '@mui/material';
import {
  Laptop as LaptopIcon,
  Person as PersonIcon,
  Lock as LockIcon,
  Visibility,
  VisibilityOff,
  Login as LoginIcon,
} from '@mui/icons-material';
import { useAuth } from '@/contexts/AuthContext';
import type { LoginCredentials } from '@/lib/auth';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, isAuthenticated, isLoading: authLoading } = useAuth();
  
  // Form state
  const [credentials, setCredentials] = useState<LoginCredentials>({
    username: '',
    password: '',
  });
  
  // UI state
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  // Redirect if already authenticated
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      // Check for intended destination from sessionStorage first
      const intendedDestination = typeof window !== 'undefined' 
        ? sessionStorage.getItem('intended_destination') 
        : null;
      
      const redirectTo = intendedDestination || searchParams?.get('redirect') || '/dashboard';
      
      // Clear the stored destination
      if (intendedDestination && typeof window !== 'undefined') {
        sessionStorage.removeItem('intended_destination');
      }
      
      router.push(redirectTo);
    }
  }, [isAuthenticated, authLoading, router, searchParams]);

  // Handle form input changes
  const handleInputChange = (field: keyof LoginCredentials) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setCredentials(prev => ({
      ...prev,
      [field]: event.target.value,
    }));
    
    // Clear errors when user starts typing
    if (error) setError(null);
    if (info) setInfo(null);
  };

  // Handle form submission
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    if (!credentials.username.trim() || !credentials.password.trim()) {
      setError('사용자명과 비밀번호를 모두 입력해주세요.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setInfo(null);

    try {
      const result = await login(credentials);
      
      if (result.success) {
        setInfo('로그인 성공! 페이지를 이동합니다...');
        
        // Redirect after successful login
        setTimeout(() => {
          // Check for intended destination from sessionStorage first
          const intendedDestination = typeof window !== 'undefined' 
            ? sessionStorage.getItem('intended_destination') 
            : null;
          
          const redirectTo = intendedDestination || searchParams?.get('redirect') || '/dashboard';
          
          // Clear the stored destination
          if (intendedDestination && typeof window !== 'undefined') {
            sessionStorage.removeItem('intended_destination');
          }
          
          router.push(redirectTo);
        }, 1000);
      } else {
        setError(result.message || '로그인에 실패했습니다.');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('로그인 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle password visibility toggle
  const handleTogglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // Show loading spinner while checking authentication
  if (authLoading) {
    return (
      <Container maxWidth="sm" sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        minHeight: '100vh' 
      }}>
        <Box textAlign="center">
          <CircularProgress size={60} sx={{ mb: 2 }} />
          <Typography variant="h6" color="text.secondary">
            시스템 초기화 중...
          </Typography>
        </Box>
      </Container>
    );
  }

  // Don't render login form if already authenticated
  if (isAuthenticated) {
    return null;
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 2,
      }}
    >
      <Container maxWidth="xs">
        <Fade in timeout={800}>
          <Card
            elevation={3}
            sx={{
              borderRadius: '20px',
              overflow: 'hidden',
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(20px)',
              boxShadow: '0 8px 32px rgba(31, 38, 135, 0.37)',
              maxWidth: 400,
              width: '100%',
              margin: '0 auto',
            }}
          >
            <CardContent sx={{ p: 4 }}>
              {/* Header */}
              <Box textAlign="center" mb={4}>
                <Box
                  sx={{
                    width: 80,
                    height: 80,
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 20px',
                    boxShadow: '0 4px 20px rgba(102, 126, 234, 0.3)',
                  }}
                >
                  <LaptopIcon sx={{ fontSize: 40, color: 'white' }} />
                </Box>
                
                <Typography
                  variant="h6"
                  component="h1"
                  gutterBottom
                  sx={{
                    fontWeight: 'bold',
                    color: 'text.primary',
                    mb: 1,
                    whiteSpace: 'nowrap',
                    fontSize: { xs: '1.1rem', sm: '1.25rem' }
                  }}
                >
                  IT 자산 및 SW 인벤토리 관리시스템
                </Typography>
                
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 3, fontSize: '0.875rem' }}
                >
                  시스템에 로그인하여 자산 관리를 시작하세요
                </Typography>
                
                <Divider sx={{ mx: 'auto', width: 100 }} />
              </Box>

              {/* Login Form */}
              <Box component="form" onSubmit={handleSubmit} noValidate>
                {/* Username Field */}
                <TextField
                  fullWidth
                  label="사용자명"
                  type="text"
                  value={credentials.username}
                  onChange={handleInputChange('username')}
                  required
                  autoComplete="off"
                  placeholder="사용자명을 입력하세요"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PersonIcon color="action" />
                      </InputAdornment>
                    ),
                  }}
                  sx={{ mb: 3 }}
                  disabled={isLoading}
                />

                {/* Password Field */}
                <TextField
                  fullWidth
                  label="비밀번호"
                  type={showPassword ? 'text' : 'password'}
                  value={credentials.password}
                  onChange={handleInputChange('password')}
                  required
                  autoComplete="off"
                  placeholder="비밀번호를 입력하세요"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LockIcon color="action" />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="toggle password visibility"
                          onClick={handleTogglePasswordVisibility}
                          edge="end"
                          disabled={isLoading}
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  sx={{ mb: 4 }}
                  disabled={isLoading}
                />

                {/* Login Button */}
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  size="large"
                  disabled={isLoading || !credentials.username.trim() || !credentials.password.trim()}
                  startIcon={
                    isLoading ? (
                      <CircularProgress size={20} color="inherit" />
                    ) : (
                      <LoginIcon />
                    )
                  }
                  sx={{
                    py: 1.5,
                    borderRadius: '10px',
                    textTransform: 'none',
                    fontSize: '1.1rem',
                    fontWeight: 500,
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 8px 25px rgba(102, 126, 234, 0.4)',
                    },
                    '&:disabled': {
                      background: '#ccc',
                      color: '#999',
                      boxShadow: 'none',
                    },
                    mb: 2,
                  }}
                >
                  {isLoading ? '로그인 중...' : '로그인'}
                </Button>

                {/* Error Alert */}
                {error && (
                  <Fade in>
                    <Alert 
                      severity="error" 
                      sx={{ 
                        mb: 2,
                        borderRadius: '10px',
                      }}
                      onClose={() => setError(null)}
                    >
                      {error}
                    </Alert>
                  </Fade>
                )}

                {/* Info Alert */}
                {info && (
                  <Fade in>
                    <Alert 
                      severity="success" 
                      sx={{ 
                        mb: 2,
                        borderRadius: '10px',
                      }}
                    >
                      {info}
                    </Alert>
                  </Fade>
                )}
              </Box>

              {/* Footer */}
              <Box textAlign="center" mt={4}>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ display: 'block', mb: 1 }}
                >
                  © 2024 Roboe Technology Inc.
                </Typography>
                <Typography
                  variant="caption"
                  color="text.secondary"
                >
                  IT 자산 및 소프트웨어 인벤토리 관리 시스템 v2.0
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Fade>
      </Container>
    </Box>
  );
}