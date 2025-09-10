import {
  Box,
  Tab,
  Tabs,
  Badge,
  Tooltip,
  useTheme,
  useMediaQuery,
  BottomNavigation,
  BottomNavigationAction,
  Paper,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Divider,
  IconButton,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  Computer as ComputerIcon,
  Memory as SoftwareIcon,
  SwapHoriz as AssignmentIcon,
  AdminPanelSettings as AdminIcon,
  Analytics as AnalyticsIcon,
  Settings as SettingsIcon,
  Close as CloseIcon,
  ChevronRight as ChevronRightIcon,
} from '@mui/icons-material';
import { ReactNode, useState, SyntheticEvent } from 'react';

// Navigation tab configuration
export interface NavigationTab {
  id: string;
  label: string;
  icon: ReactNode;
  path: string;
  roles?: ('admin' | 'manager' | 'user')[];
  badge?: number;
  disabled?: boolean;
  description?: string;
  children?: NavigationTab[];
}

export interface NavigationTabsProps {
  tabs: NavigationTab[];
  currentTab: string;
  userRole: 'admin' | 'manager' | 'user';
  onChange: (tabId: string) => void;
  orientation?: 'horizontal' | 'vertical';
  variant?: 'standard' | 'scrollable' | 'fullWidth' | 'bottom' | 'drawer';
  showLabels?: boolean;
  showBadges?: boolean;
  showTooltips?: boolean;
  allowIndicator?: boolean;
  centered?: boolean;
  dense?: boolean;
  drawerOpen?: boolean;
  onDrawerClose?: () => void;
  drawerWidth?: number;
}

// Default tabs configuration matching original system
export const defaultTabs: NavigationTab[] = [
  {
    id: 'dashboard',
    label: '대시보드',
    icon: <DashboardIcon />,
    path: '/dashboard',
    description: '시스템 현황과 통계를 확인합니다',
  },
  {
    id: 'employees',
    label: '임직원 관리',
    icon: <PeopleIcon />,
    path: '/employees',
    roles: ['admin', 'manager'],
    description: '임직원 정보를 관리합니다',
  },
  {
    id: 'hardware',
    label: '하드웨어 자산',
    icon: <ComputerIcon />,
    path: '/hardware',
    description: '하드웨어 자산을 관리합니다',
  },
  {
    id: 'software',
    label: '소프트웨어',
    icon: <SoftwareIcon />,
    path: '/software',
    description: '소프트웨어 라이센스를 관리합니다',
  },
  {
    id: 'assignment',
    label: '자산 할당',
    icon: <AssignmentIcon />,
    path: '/assignments',
    description: '자산 할당 현황을 관리합니다',
  },
  {
    id: 'admin',
    label: '사용자 관리',
    icon: <AdminIcon />,
    path: '/admin/users',
    roles: ['admin'],
    description: '시스템 사용자를 관리합니다',
  },
];

export function NavigationTabs({
  tabs,
  currentTab,
  userRole,
  onChange,
  orientation = 'horizontal',
  variant = 'standard',
  showLabels = true,
  showBadges = true,
  showTooltips = false,
  allowIndicator = true,
  centered = false,
  dense = false,
  drawerOpen = false,
  onDrawerClose,
  drawerWidth = 280,
}: NavigationTabsProps) {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('md'));

  // Filter tabs based on user role
  const getVisibleTabs = (): NavigationTab[] => {
    return tabs.filter(tab => {
      if (!tab.roles || tab.roles.length === 0) return true;
      return tab.roles.includes(userRole);
    });
  };

  const visibleTabs = getVisibleTabs();

  const handleTabChange = (_event: SyntheticEvent, newValue: string) => {
    onChange(newValue);
  };

  const handleBottomNavChange = (_event: SyntheticEvent, newValue: string) => {
    onChange(newValue);
  };

  const renderTabContent = (tab: NavigationTab) => {
    const icon =
      showBadges && tab.badge ? (
        <Badge badgeContent={tab.badge} color='error' max={99}>
          {tab.icon}
        </Badge>
      ) : (
        tab.icon
      );

    if (showTooltips) {
      return (
        <Tooltip title={tab.description || tab.label} arrow>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {icon}
            {showLabels && (
              <Typography
                variant={dense ? 'caption' : 'body2'}
                sx={{ fontWeight: 500 }}
              >
                {tab.label}
              </Typography>
            )}
          </Box>
        </Tooltip>
      );
    }

    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        {icon}
        {showLabels && (
          <Typography
            variant={dense ? 'caption' : 'body2'}
            sx={{ fontWeight: 500 }}
          >
            {tab.label}
          </Typography>
        )}
      </Box>
    );
  };

  // Standard tabs variant
  const renderStandardTabs = () => (
    <Box
      sx={{
        borderBottom: 1,
        borderColor: 'divider',
        backgroundColor: 'background.paper',
      }}
    >
      <Tabs
        value={currentTab}
        onChange={handleTabChange}
        orientation={orientation}
        variant={
          variant === 'scrollable'
            ? 'scrollable'
            : variant === 'fullWidth'
              ? 'fullWidth'
              : 'standard'
        }
        scrollButtons='auto'
        allowScrollButtonsMobile
        centered={centered && variant !== 'scrollable'}
        indicatorColor={allowIndicator ? 'primary' : undefined}
        textColor='primary'
        sx={{
          minHeight: dense ? 40 : 48,
          '& .MuiTab-root': {
            minHeight: dense ? 40 : 48,
            fontSize: dense ? '0.75rem' : '0.875rem',
            fontWeight: 500,
            textTransform: 'none',
            '&.Mui-selected': {
              fontWeight: 600,
            },
            '&.Mui-disabled': {
              opacity: 0.5,
            },
          },
        }}
      >
        {visibleTabs.map(tab => (
          <Tab
            key={tab.id}
            label={renderTabContent(tab)}
            value={tab.id}
            disabled={tab.disabled}
            sx={{
              px: dense ? 1 : 2,
            }}
          />
        ))}
      </Tabs>
    </Box>
  );

  // Bottom navigation variant for mobile
  const renderBottomNavigation = () => (
    <Paper
      sx={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: theme.zIndex.appBar,
      }}
      elevation={8}
    >
      <BottomNavigation
        value={currentTab}
        onChange={handleBottomNavChange}
        showLabels={showLabels}
        sx={{
          height: 64,
          '& .MuiBottomNavigationAction-root': {
            minWidth: 'auto',
            '&.Mui-selected': {
              color: 'primary.main',
            },
          },
        }}
      >
        {visibleTabs.slice(0, 5).map(tab => (
          <BottomNavigationAction
            key={tab.id}
            label={showLabels ? tab.label : undefined}
            value={tab.id}
            icon={
              showBadges && tab.badge ? (
                <Badge badgeContent={tab.badge} color='error' max={99}>
                  {tab.icon}
                </Badge>
              ) : (
                tab.icon
              )
            }
            disabled={tab.disabled}
          />
        ))}
      </BottomNavigation>
    </Paper>
  );

  // Drawer variant for side navigation
  const renderDrawerNavigation = () => (
    <Drawer
      variant='temporary'
      anchor='left'
      open={drawerOpen}
      onClose={onDrawerClose}
      ModalProps={{
        keepMounted: true, // Better open performance on mobile
      }}
      sx={{
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
        },
      }}
    >
      <Box
        sx={{
          p: 2,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Typography variant='h6' sx={{ fontWeight: 600 }}>
          메뉴
        </Typography>
        <IconButton onClick={onDrawerClose} size='small'>
          <CloseIcon />
        </IconButton>
      </Box>

      <Divider />

      <List sx={{ pt: 0 }}>
        {visibleTabs.map(tab => (
          <ListItem key={tab.id} disablePadding>
            <ListItemButton
              selected={currentTab === tab.id}
              onClick={() => {
                onChange(tab.id);
                onDrawerClose?.();
              }}
              disabled={tab.disabled}
              sx={{
                py: 1.5,
                '&.Mui-selected': {
                  backgroundColor: 'primary.main',
                  color: 'primary.contrastText',
                  '&:hover': {
                    backgroundColor: 'primary.dark',
                  },
                  '& .MuiListItemIcon-root': {
                    color: 'inherit',
                  },
                },
              }}
            >
              <ListItemIcon sx={{ minWidth: 40 }}>
                {showBadges && tab.badge ? (
                  <Badge badgeContent={tab.badge} color='error' max={99}>
                    {tab.icon}
                  </Badge>
                ) : (
                  tab.icon
                )}
              </ListItemIcon>
              <ListItemText
                primary={tab.label}
                secondary={tab.description}
                primaryTypographyProps={{
                  fontWeight: currentTab === tab.id ? 600 : 500,
                  fontSize: '0.875rem',
                }}
                secondaryTypographyProps={{
                  fontSize: '0.75rem',
                }}
              />
              {tab.children && <ChevronRightIcon fontSize='small' />}
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Drawer>
  );

  // Vertical tabs variant
  const renderVerticalTabs = () => (
    <Box sx={{ display: 'flex', minHeight: 400 }}>
      <Tabs
        orientation='vertical'
        variant='scrollable'
        value={currentTab}
        onChange={handleTabChange}
        sx={{
          borderRight: 1,
          borderColor: 'divider',
          minWidth: 200,
          '& .MuiTab-root': {
            alignItems: 'flex-start',
            textAlign: 'left',
            minHeight: 48,
            py: 1.5,
            px: 2,
          },
        }}
      >
        {visibleTabs.map(tab => (
          <Tab
            key={tab.id}
            label={renderTabContent(tab)}
            value={tab.id}
            disabled={tab.disabled}
          />
        ))}
      </Tabs>
    </Box>
  );

  // Render based on variant
  switch (variant) {
    case 'bottom':
      return renderBottomNavigation();
    case 'drawer':
      return renderDrawerNavigation();
    default:
      return orientation === 'vertical'
        ? renderVerticalTabs()
        : renderStandardTabs();
  }
}

// Responsive navigation that adapts to screen size
export function ResponsiveNavigation({
  tabs = defaultTabs,
  currentTab,
  userRole,
  onChange,
  ...props
}: Omit<NavigationTabsProps, 'tabs' | 'variant'> & { tabs?: NavigationTab[] }) {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('md'));
  const isExtraSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));

  if (isExtraSmallScreen) {
    return (
      <NavigationTabs
        {...props}
        tabs={tabs}
        currentTab={currentTab}
        userRole={userRole}
        onChange={onChange}
        variant='bottom'
        showLabels={false}
      />
    );
  }

  if (isSmallScreen) {
    return (
      <NavigationTabs
        {...props}
        tabs={tabs}
        currentTab={currentTab}
        userRole={userRole}
        onChange={onChange}
        variant='scrollable'
        dense
      />
    );
  }

  return (
    <NavigationTabs
      {...props}
      tabs={tabs}
      currentTab={currentTab}
      userRole={userRole}
      onChange={onChange}
      variant='standard'
    />
  );
}

// Hook for navigation state management
export function useNavigationState(initialTab?: string) {
  const [currentTab, setCurrentTab] = useState(initialTab || 'dashboard');
  const [drawerOpen, setDrawerOpen] = useState(false);

  const changeTab = (tabId: string) => {
    setCurrentTab(tabId);
    // You can add navigation logic here, e.g., router.push()
  };

  const openDrawer = () => {
    setDrawerOpen(true);
  };

  const closeDrawer = () => {
    setDrawerOpen(false);
  };

  const toggleDrawer = () => {
    setDrawerOpen(prev => !prev);
  };

  return {
    currentTab,
    drawerOpen,
    changeTab,
    openDrawer,
    closeDrawer,
    toggleDrawer,
  };
}

// Navigation configuration utilities
export const navigationUtils = {
  // Get tab by ID
  getTab: (tabs: NavigationTab[], id: string): NavigationTab | undefined => {
    return tabs.find(tab => tab.id === id);
  },

  // Get tabs for user role
  getTabsForRole: (
    tabs: NavigationTab[],
    role: 'admin' | 'manager' | 'user'
  ): NavigationTab[] => {
    return tabs.filter(tab => {
      if (!tab.roles || tab.roles.length === 0) return true;
      return tab.roles.includes(role);
    });
  },

  // Check if user can access tab
  canAccessTab: (
    tab: NavigationTab,
    role: 'admin' | 'manager' | 'user'
  ): boolean => {
    if (!tab.roles || tab.roles.length === 0) return true;
    return tab.roles.includes(role);
  },

  // Get tab badges count
  getTotalBadgeCount: (tabs: NavigationTab[]): number => {
    return tabs.reduce((total, tab) => total + (tab.badge || 0), 0);
  },

  // Update tab badge
  updateTabBadge: (
    tabs: NavigationTab[],
    tabId: string,
    badge: number
  ): NavigationTab[] => {
    return tabs.map(tab => (tab.id === tabId ? { ...tab, badge } : tab));
  },

  // Disable/enable tab
  setTabDisabled: (
    tabs: NavigationTab[],
    tabId: string,
    disabled: boolean
  ): NavigationTab[] => {
    return tabs.map(tab => (tab.id === tabId ? { ...tab, disabled } : tab));
  },
};
