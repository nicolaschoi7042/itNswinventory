'use client';

import { ReactNode } from 'react';
import { Box, Container } from '@mui/material';
import { Header } from './Header';
import { Navigation } from './Navigation';

interface DashboardLayoutProps {
  children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: 'background.default' }}>
      <Container maxWidth='xl' sx={{ padding: { xs: 1, sm: 2, md: 2.5 } }}>
        <Header />
        <Navigation />
        <Box component='main' sx={{ mt: 2 }}>
          {children}
        </Box>
      </Container>
    </Box>
  );
}
