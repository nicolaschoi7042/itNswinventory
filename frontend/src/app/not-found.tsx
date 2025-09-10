'use client';

import Link from 'next/link';
import { Box, Container, Typography, Button } from '@mui/material';
import {
  Home as HomeIcon,
  ArrowBack as ArrowBackIcon,
} from '@mui/icons-material';

export default function NotFound() {
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
        <Typography
          variant='h1'
          component='h1'
          sx={{ fontSize: '6rem', fontWeight: 'bold', color: 'primary.main' }}
        >
          404
        </Typography>

        <Typography variant='h4' component='h2' gutterBottom>
          페이지를 찾을 수 없습니다
        </Typography>

        <Typography
          variant='body1'
          color='text.secondary'
          sx={{ maxWidth: 500 }}
        >
          요청하신 페이지가 존재하지 않거나 이동되었을 수 있습니다. 아래 버튼을
          통해 메인 페이지로 돌아가거나 이전 페이지로 이동하세요.
        </Typography>

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
            startIcon={<HomeIcon />}
            component={Link}
            href='/dashboard'
            sx={{ minWidth: 150 }}
          >
            대시보드로
          </Button>

          <Button
            variant='outlined'
            size='large'
            startIcon={<ArrowBackIcon />}
            onClick={() => window.history.back()}
            sx={{ minWidth: 150 }}
          >
            이전 페이지로
          </Button>
        </Box>
      </Box>
    </Container>
  );
}
