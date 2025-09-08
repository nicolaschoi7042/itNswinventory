'use client';

import { AdminOnlyGuard } from '@/components/guards/RoleGuards';
import { Box, Typography, Card, CardContent } from '@mui/material';
import { AdminPanelSettings as AdminIcon } from '@mui/icons-material';

export default function UsersPage() {
  return (
    <AdminOnlyGuard>
      <Box sx={{ p: 3 }}>
        <Box display="flex" alignItems="center" gap={2} mb={3}>
          <AdminIcon color="primary" />
          <Typography variant="h4" component="h1">
            사용자 관리
          </Typography>
        </Box>
        
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              사용자 관리 시스템
            </Typography>
            <Typography variant="body2" color="text.secondary">
              이 페이지는 관리자만 접근할 수 있습니다.
              시스템 사용자를 관리하고 권한을 설정할 수 있습니다.
            </Typography>
          </CardContent>
        </Card>
      </Box>
    </AdminOnlyGuard>
  );
}