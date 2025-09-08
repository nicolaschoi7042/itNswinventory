'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { 
  Paper, 
  Tabs, 
  Tab,
  useTheme,
  useMediaQuery 
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  Computer as ComputerIcon,
  Apps as AppsIcon,
  Assignment as AssignmentIcon,
  SupervisorAccount as SupervisorAccountIcon,
} from '@mui/icons-material';

interface NavItem {
  label: string;
  path: string;
  icon: React.ReactElement;
  adminOnly?: boolean;
}

const navItems: NavItem[] = [
  {
    label: '대시보드',
    path: '/dashboard',
    icon: <DashboardIcon />,
  },
  {
    label: '직원 관리',
    path: '/employees',
    icon: <PeopleIcon />,
  },
  {
    label: '하드웨어',
    path: '/hardware',
    icon: <ComputerIcon />,
  },
  {
    label: '소프트웨어',
    path: '/software', 
    icon: <AppsIcon />,
  },
  {
    label: '자산 할당',
    path: '/assignments',
    icon: <AssignmentIcon />,
  },
  {
    label: '사용자 관리',
    path: '/users',
    icon: <SupervisorAccountIcon />,
    adminOnly: true,
  },
];

export function Navigation() {
  const pathname = usePathname();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  // TODO: Replace with actual user role from context/store
  const userRole = 'Admin'; // Mock admin role to show all tabs

  // Filter navigation items based on user role
  const visibleNavItems = navItems.filter(item => {
    if (item.adminOnly) {
      return userRole === 'Admin';
    }
    return true;
  });

  // Find current tab index
  const currentTab = visibleNavItems.findIndex(item => pathname.startsWith(item.path));
  
  return (
    <Paper 
      elevation={2}
      sx={{ 
        borderRadius: 2,
        overflow: 'hidden',
        mb: 2,
      }}
    >
      <Tabs
        value={currentTab === -1 ? false : currentTab}
        variant={isMobile ? 'scrollable' : 'fullWidth'}
        scrollButtons="auto"
        sx={{
          '& .MuiTabs-indicator': {
            height: 3,
            backgroundColor: 'primary.main',
          },
        }}
      >
        {visibleNavItems.map((item) => (
          <Tab
            key={item.path}
            label={item.label}
            icon={item.icon}
            iconPosition="start"
            component={Link}
            href={item.path}
            sx={{
              flex: 1,
              py: 2,
              px: { xs: 1, sm: 2 },
              minHeight: 64,
              fontSize: { xs: '0.875rem', sm: '1rem' },
              fontWeight: 500,
              color: 'text.secondary',
              transition: 'all 0.3s ease',
              '&:hover': {
                backgroundColor: 'rgba(102, 126, 234, 0.04)',
                color: 'primary.main',
              },
              '&.Mui-selected': {
                backgroundColor: 'rgba(102, 126, 234, 0.08)',
                color: 'primary.main',
                fontWeight: 600,
              },
              '& .MuiTab-iconWrapper': {
                marginBottom: 0,
                marginRight: { xs: 0.5, sm: 1 },
              },
              // Mobile adjustments
              ...(isMobile && {
                minWidth: 120,
                '& .MuiTab-iconWrapper': {
                  marginRight: 0.5,
                },
              }),
            }}
          />
        ))}
      </Tabs>
    </Paper>
  );
}