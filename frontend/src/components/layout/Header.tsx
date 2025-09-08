'use client';

import { Box, Paper, Typography, Button } from '@mui/material';
import { Logout as LogoutIcon } from '@mui/icons-material';

export function Header() {
  // TODO: Replace with actual user data from context/store
  const mockUser = {
    name: 'Admin User',
    role: 'Admin'
  };

  const mockStats = {
    totalHardware: 156,
    totalSoftware: 89,
    totalEmployees: 245,
    totalAssignments: 312
  };

  const handleLogout = () => {
    // TODO: Implement actual logout logic
    console.log('Logout clicked');
  };

  return (
    <Paper
      elevation={3}
      sx={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        p: { xs: 2, sm: 2.5, md: 3 },
        borderRadius: 2,
        mb: 2,
        display: 'flex',
        flexDirection: { xs: 'column', md: 'row' },
        justifyContent: 'space-between',
        alignItems: { xs: 'center', md: 'center' },
        gap: { xs: 2, md: 0 },
      }}
    >
      {/* Title */}
      <Box sx={{ textAlign: { xs: 'center', md: 'left' } }}>
        <Typography 
          variant="h5" 
          component="h1" 
          sx={{ 
            fontWeight: 300,
            display: 'flex',
            alignItems: 'center',
            justifyContent: { xs: 'center', md: 'flex-start' },
            gap: 1.5,
          }}
        >
          <Box component="span" sx={{ color: '#ffd700', fontSize: '1.8rem' }}>
            💼
          </Box>
          IT Asset & Software Inventory Management System
        </Typography>
      </Box>

      {/* Stats and User Info */}
      <Box sx={{ 
        display: 'flex', 
        flexDirection: { xs: 'column', sm: 'row' },
        alignItems: 'center',
        gap: { xs: 2, sm: 3 },
      }}>
        {/* Stats */}
        <Box sx={{ 
          display: 'flex', 
          gap: { xs: 2, sm: 2.5 },
          flexWrap: 'wrap',
          justifyContent: 'center',
        }}>
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#ffd700' }}>
              {mockStats.totalHardware}
            </Typography>
            <Typography variant="caption" sx={{ opacity: 0.9, fontSize: '0.7rem' }}>
              하드웨어
            </Typography>
          </Box>
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#ffd700' }}>
              {mockStats.totalSoftware}
            </Typography>
            <Typography variant="caption" sx={{ opacity: 0.9, fontSize: '0.7rem' }}>
              소프트웨어
            </Typography>
          </Box>
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#ffd700' }}>
              {mockStats.totalEmployees}
            </Typography>
            <Typography variant="caption" sx={{ opacity: 0.9, fontSize: '0.7rem' }}>
              직원
            </Typography>
          </Box>
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#ffd700' }}>
              {mockStats.totalAssignments}
            </Typography>
            <Typography variant="caption" sx={{ opacity: 0.9, fontSize: '0.7rem' }}>
              할당
            </Typography>
          </Box>
        </Box>

        {/* User Info and Logout */}
        <Box sx={{ 
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
        }}>
          <Box sx={{ 
            textAlign: 'right',
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            padding: '0.5rem 1rem',
            borderRadius: 1,
            border: '1px solid rgba(255, 255, 255, 0.2)',
          }}>
            <Typography variant="body2" sx={{ fontWeight: 500, fontSize: '0.85rem' }}>
              {mockUser.name}
            </Typography>
            <Typography variant="caption" sx={{ fontSize: '0.7rem', opacity: 0.8 }}>
              {mockUser.role}
            </Typography>
          </Box>
          
          <Button
            onClick={handleLogout}
            sx={{
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              color: 'white',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              padding: '0.5rem 1rem',
              borderRadius: 1,
              minWidth: 'auto',
              fontSize: '0.8rem',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                borderColor: 'rgba(255, 255, 255, 0.5)',
                transform: 'translateY(-1px)',
              },
              transition: 'all 0.3s ease',
            }}
            startIcon={<LogoutIcon fontSize="small" />}
          >
            로그아웃
          </Button>
        </Box>
      </Box>
    </Paper>
  );
}