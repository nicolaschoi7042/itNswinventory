'use client';

import { ManagerGuard } from '@/components/guards/RoleGuards';
import { Box, Typography, Card, CardContent } from '@mui/material';
import { Apps as AppsIcon } from '@mui/icons-material';

export default function SoftwarePage() {
  return (
    <ManagerGuard>
      <Box sx={{ p: 3 }}>
        <Box display="flex" alignItems="center" gap={2} mb={3}>
          <AppsIcon color="primary" />
          <Typography variant="h4" component="h1">
            소프트웨어 관리
          </Typography>
        </Box>
        
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              소프트웨어 라이센스 관리
            </Typography>
            <Typography variant="body2" color="text.secondary">
              이 페이지는 관리자 또는 매니저만 접근할 수 있습니다.
              회사의 소프트웨어 라이센스를 관리할 수 있습니다.
            </Typography>
          </CardContent>
        </Card>
      </Box>
    </ManagerGuard>
  );
}