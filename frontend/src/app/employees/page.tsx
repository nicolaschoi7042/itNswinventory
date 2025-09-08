'use client';

import { ManagerGuard } from '@/components/guards/RoleGuards';
import { Box, Typography, Card, CardContent } from '@mui/material';
import { People as PeopleIcon } from '@mui/icons-material';

export default function EmployeesPage() {
  return (
    <ManagerGuard>
      <Box sx={{ p: 3 }}>
        <Box display="flex" alignItems="center" gap={2} mb={3}>
          <PeopleIcon color="primary" />
          <Typography variant="h4" component="h1">
            직원 관리
          </Typography>
        </Box>
        
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              직원 정보 관리
            </Typography>
            <Typography variant="body2" color="text.secondary">
              이 페이지는 관리자 또는 매니저만 접근할 수 있습니다.
              회사 직원 정보를 관리할 수 있습니다.
            </Typography>
          </CardContent>
        </Card>
      </Box>
    </ManagerGuard>
  );
}