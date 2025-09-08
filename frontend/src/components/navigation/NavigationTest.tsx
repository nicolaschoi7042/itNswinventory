import { 
  Box, 
  Typography, 
  Paper, 
  Stack, 
  Switch, 
  FormControlLabel, 
  Button, 
  Card, 
  CardContent, 
  Alert,
  Chip,
  Grid,
  CardHeader,
  LinearProgress,
  IconButton,
  Tooltip,
} from '@mui/material';
import { useState, useCallback, useEffect } from 'react';
import {
  PlayArrow as PlayIcon,
  Pause as PauseIcon,
  Refresh as RefreshIcon,
  Speed as SpeedIcon,
  CheckCircle as CheckIcon,
  Error as ErrorIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  PersonAdd,
  Settings,
  Dashboard,
  People,
  Computer,
  Assignment,
  AccountCircle,
  Notifications,
} from '@mui/icons-material';

import { Header } from './Header';
import { NavigationTabs } from './NavigationTabs';
import { UserMenu } from './UserMenu';
import { Breadcrumb } from './Breadcrumb';

// Type definitions for testing
interface User {
  id: string;
  username: string;
  fullName: string;
  email: string;
  role: 'admin' | 'manager' | 'user';
  department: string;
  lastLogin: string;
  avatar?: string;
}

interface HeaderStats {
  totalEmployees: number;
  totalHardware: number;
  totalSoftware: number;
  totalAssignments: number;
}

interface BreadcrumbItem {
  id: string;
  label: string;
  path?: string;
  badge?: string;
}

interface NavigationTestMetrics {
  userInteractions: number;
  tabChanges: number;
  menuActions: number;
  responseTime: number;
  errors: number;
}

// Sample test data
const sampleUsers: Record<string, User> = {
  admin: {
    id: '1',
    username: 'admin',
    fullName: '김관리자',
    email: 'admin@company.com',
    role: 'admin',
    department: 'IT팀',
    lastLogin: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    avatar: 'https://i.pravatar.cc/40?img=1',
  },
  manager: {
    id: '2',
    username: 'manager',
    fullName: '이매니저',
    email: 'manager@company.com',
    role: 'manager',
    department: '운영팀',
    lastLogin: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    avatar: 'https://i.pravatar.cc/40?img=2',
  },
  user: {
    id: '3',
    username: 'user',
    fullName: '박사용자',
    email: 'user@company.com',
    role: 'user',
    department: '개발팀',
    lastLogin: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    avatar: 'https://i.pravatar.cc/40?img=3',
  },
};

const sampleStats: HeaderStats = {
  totalEmployees: 125,
  totalHardware: 450,
  totalSoftware: 89,
  totalAssignments: 380,
};

const navigationTabs = [
  {
    id: 'dashboard',
    label: '대시보드',
    path: '/dashboard',
    icon: <Dashboard />,
    requiredRole: 'user' as const,
    badge: undefined,
  },
  {
    id: 'employees',
    label: '직원 관리',
    path: '/employees',
    icon: <People />,
    requiredRole: 'manager' as const,
    badge: '125',
  },
  {
    id: 'hardware',
    label: '하드웨어',
    path: '/hardware',
    icon: <Computer />,
    requiredRole: 'manager' as const,
    badge: 'NEW',
  },
  {
    id: 'assignments',
    label: '할당 관리',
    path: '/assignments',
    icon: <Assignment />,
    requiredRole: 'user' as const,
    badge: undefined,
  },
  {
    id: 'users',
    label: '사용자 관리',
    path: '/users',
    icon: <AccountCircle />,
    requiredRole: 'admin' as const,
    badge: undefined,
  },
];

const sampleBreadcrumbs: BreadcrumbItem[] = [
  {
    id: 'employees',
    label: '직원 관리',
    path: '/employees',
  },
  {
    id: 'employee-detail',
    label: '김철수',
    path: '/employees/1',
    badge: 'NEW',
  },
  {
    id: 'employee-edit',
    label: '정보 수정',
  },
];

export function NavigationTest() {
  // Test state
  const [currentUser, setCurrentUser] = useState<User>(sampleUsers.admin);
  const [currentTab, setCurrentTab] = useState('dashboard');
  const [isAutoTestRunning, setIsAutoTestRunning] = useState(false);
  const [testMetrics, setTestMetrics] = useState<NavigationTestMetrics>({
    userInteractions: 0,
    tabChanges: 0,
    menuActions: 0,
    responseTime: 0,
    errors: 0,
  });

  // UI state
  const [showStats, setShowStats] = useState(true);
  const [showBreadcrumb, setShowBreadcrumb] = useState(true);
  const [showUserAvatar, setShowUserAvatar] = useState(true);
  const [notificationCount, setNotificationCount] = useState(3);
  const [currentStats, setCurrentStats] = useState(sampleStats);

  // Performance measurement
  const measureResponseTime = useCallback((operation: string, fn: () => void) => {
    const startTime = performance.now();
    try {
      fn();
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      setTestMetrics(prev => ({
        ...prev,
        responseTime: Math.round((prev.responseTime + duration) / 2 * 100) / 100,
        userInteractions: prev.userInteractions + 1,
      }));
      
      return duration;
    } catch (error) {
      setTestMetrics(prev => ({
        ...prev,
        errors: prev.errors + 1,
      }));
      console.error(`Error in ${operation}:`, error);
    }
  }, []);

  // Event handlers
  const handleUserRoleChange = useCallback((role: 'admin' | 'manager' | 'user') => {
    measureResponseTime('userRoleChange', () => {
      setCurrentUser(sampleUsers[role]);
      // Reset tab if current tab is not available for new role
      if (role === 'user' && (currentTab === 'employees' || currentTab === 'hardware' || currentTab === 'users')) {
        setCurrentTab('dashboard');
      } else if (role === 'manager' && currentTab === 'users') {
        setCurrentTab('dashboard');
      }
    });
  }, [measureResponseTime, currentTab]);

  const handleTabChange = useCallback((tabId: string) => {
    measureResponseTime('tabChange', () => {
      setCurrentTab(tabId);
      setTestMetrics(prev => ({
        ...prev,
        tabChanges: prev.tabChanges + 1,
      }));
    });
  }, [measureResponseTime]);

  const handleMenuAction = useCallback((action: string) => {
    measureResponseTime('menuAction', () => {
      console.log(`Menu action: ${action}`, { user: currentUser.username, time: new Date().toISOString() });
      setTestMetrics(prev => ({
        ...prev,
        menuActions: prev.menuActions + 1,
      }));
    });
  }, [measureResponseTime, currentUser.username]);

  const handleRefresh = useCallback(() => {
    measureResponseTime('refresh', () => {
      setNotificationCount(prev => prev + Math.floor(Math.random() * 3));
      setCurrentStats({
        totalEmployees: sampleStats.totalEmployees + Math.floor(Math.random() * 20 - 10),
        totalHardware: sampleStats.totalHardware + Math.floor(Math.random() * 50 - 25),
        totalSoftware: sampleStats.totalSoftware + Math.floor(Math.random() * 10 - 5),
        totalAssignments: sampleStats.totalAssignments + Math.floor(Math.random() * 30 - 15),
      });
    });
  }, [measureResponseTime]);

  const handleBreadcrumbClick = useCallback((item: BreadcrumbItem) => {
    measureResponseTime('breadcrumbClick', () => {
      console.log('Breadcrumb clicked:', item.label);
    });
  }, [measureResponseTime]);

  // Auto test functionality
  const runAutoTest = useCallback(async () => {
    setIsAutoTestRunning(true);
    
    const testSequence = [
      () => handleUserRoleChange('admin'),
      () => handleTabChange('employees'),
      () => handleTabChange('hardware'),
      () => handleUserRoleChange('manager'),
      () => handleTabChange('assignments'),
      () => handleUserRoleChange('user'),
      () => handleTabChange('dashboard'),
      () => handleRefresh(),
      () => handleMenuAction('settings'),
      () => handleMenuAction('profile'),
    ];

    for (let i = 0; i < testSequence.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      testSequence[i]();
    }
    
    setIsAutoTestRunning(false);
  }, [handleUserRoleChange, handleTabChange, handleRefresh, handleMenuAction]);

  const resetMetrics = () => {
    setTestMetrics({
      userInteractions: 0,
      tabChanges: 0,
      menuActions: 0,
      responseTime: 0,
      errors: 0,
    });
  };

  // Real-time stats simulation
  useEffect(() => {
    if (!isAutoTestRunning) return;

    const interval = setInterval(() => {
      handleRefresh();
    }, 3000);

    return () => clearInterval(interval);
  }, [isAutoTestRunning, handleRefresh]);

  // Filter tabs based on user role
  const availableTabs = navigationTabs.filter(tab => {
    switch (currentUser.role) {
      case 'admin':
        return true;
      case 'manager':
        return tab.requiredRole !== 'admin';
      case 'user':
        return tab.requiredRole === 'user';
      default:
        return false;
    }
  });

  return (
    <Box>
      <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
        네비게이션 인증 플로우 테스트
      </Typography>

      {/* Test Control Panel */}
      <Card sx={{ mb: 3 }}>
        <CardHeader 
          title="테스트 제어판"
          action={
            <Stack direction="row" spacing={2} alignItems="center">
              <Button
                variant={isAutoTestRunning ? "outlined" : "contained"}
                startIcon={isAutoTestRunning ? <PauseIcon /> : <PlayIcon />}
                onClick={isAutoTestRunning ? () => setIsAutoTestRunning(false) : runAutoTest}
                color={isAutoTestRunning ? "warning" : "primary"}
              >
                {isAutoTestRunning ? '테스트 중지' : '자동 테스트 실행'}
              </Button>
              <Button
                variant="outlined"
                startIcon={<RefreshIcon />}
                onClick={handleRefresh}
                size="small"
              >
                새로고침
              </Button>
            </Stack>
          }
        />
        <CardContent>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Typography variant="body2" sx={{ mb: 2 }}>사용자 역할:</Typography>
              <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
                {(['admin', 'manager', 'user'] as const).map((role) => (
                  <Button
                    key={role}
                    variant={currentUser.role === role ? 'contained' : 'outlined'}
                    onClick={() => handleUserRoleChange(role)}
                    size="small"
                    disabled={isAutoTestRunning}
                  >
                    {role === 'admin' ? '관리자' : role === 'manager' ? '매니저' : '사용자'}
                  </Button>
                ))}
              </Stack>

              <Typography variant="body2" sx={{ mb: 1 }}>표시 옵션:</Typography>
              <Stack direction="row" spacing={2} flexWrap="wrap">
                <FormControlLabel
                  control={<Switch checked={showStats} onChange={(e) => setShowStats(e.target.checked)} />}
                  label="통계"
                />
                <FormControlLabel
                  control={<Switch checked={showBreadcrumb} onChange={(e) => setShowBreadcrumb(e.target.checked)} />}
                  label="브레드크럼"
                />
                <FormControlLabel
                  control={<Switch checked={showUserAvatar} onChange={(e) => setShowUserAvatar(e.target.checked)} />}
                  label="아바타"
                />
              </Stack>
            </Grid>

            <Grid item xs={12} md={6}>
              <Typography variant="body2" sx={{ mb: 1 }}>테스트 메트릭:</Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">총 상호작용</Typography>
                  <Typography variant="h6">{testMetrics.userInteractions}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">탭 변경</Typography>
                  <Typography variant="h6">{testMetrics.tabChanges}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">메뉴 액션</Typography>
                  <Typography variant="h6">{testMetrics.menuActions}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">평균 응답시간</Typography>
                  <Typography variant="h6" color={testMetrics.responseTime > 50 ? 'error' : 'success'}>
                    {testMetrics.responseTime}ms
                  </Typography>
                </Grid>
              </Grid>
              <Button size="small" onClick={resetMetrics} sx={{ mt: 1 }}>메트릭 초기화</Button>
            </Grid>
          </Grid>

          {isAutoTestRunning && (
            <Box sx={{ mt: 2 }}>
              <LinearProgress />
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                자동 테스트 실행 중... 역할 기반 접근 제어와 네비게이션 테스트
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Header Component */}
      <Card sx={{ mb: 3 }}>
        <CardContent sx={{ p: 0 }}>
          <Header
            user={currentUser}
            stats={showStats ? currentStats : undefined}
            onLogout={() => handleMenuAction('logout')}
            onProfile={() => handleMenuAction('profile')}
            onSettings={() => handleMenuAction('settings')}
            onRefresh={handleRefresh}
            notificationCount={notificationCount}
            showStats={showStats}
            showUserAvatar={showUserAvatar}
          />
        </CardContent>
      </Card>

      {/* Navigation Tabs */}
      <Card sx={{ mb: 3 }}>
        <CardHeader title={`네비게이션 탭 (${currentUser.role} 권한)`} />
        <CardContent sx={{ pt: 0 }}>
          <NavigationTabs
            tabs={availableTabs}
            currentTab={currentTab}
            userRole={currentUser.role}
            onChange={handleTabChange}
            showBadges
            showTooltips
          />
          
          <Alert severity="info" sx={{ mt: 2 }}>
            <Typography variant="body2">
              <strong>현재 사용자:</strong> {currentUser.fullName} ({currentUser.role})<br/>
              <strong>접근 가능한 탭:</strong> {availableTabs.length}개 / {navigationTabs.length}개<br/>
              <strong>현재 탭:</strong> {availableTabs.find(tab => tab.id === currentTab)?.label || '접근 불가'}
            </Typography>
          </Alert>
        </CardContent>
      </Card>

      {/* User Menu */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader title="사용자 메뉴" />
            <CardContent>
              <UserMenu
                user={currentUser}
                onLogout={() => handleMenuAction('logout')}
                onProfile={() => handleMenuAction('profile')}
                onSettings={() => handleMenuAction('settings')}
                onSecurity={() => handleMenuAction('security')}
                onHelp={() => handleMenuAction('help')}
                onAbout={() => handleMenuAction('about')}
                onThemeToggle={() => handleMenuAction('themeToggle')}
                showUserAvatar={showUserAvatar}
              />
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader title="사용자 정보" />
            <CardContent>
              <Stack spacing={2}>
                <Box>
                  <Typography variant="body2" color="text.secondary">이름</Typography>
                  <Typography variant="body1">{currentUser.fullName}</Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">이메일</Typography>
                  <Typography variant="body1">{currentUser.email}</Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">부서</Typography>
                  <Typography variant="body1">{currentUser.department}</Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">역할</Typography>
                  <Chip 
                    label={currentUser.role} 
                    color={currentUser.role === 'admin' ? 'error' : currentUser.role === 'manager' ? 'warning' : 'default'}
                    size="small"
                  />
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">마지막 로그인</Typography>
                  <Typography variant="caption">
                    {new Date(currentUser.lastLogin).toLocaleString('ko-KR')}
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Breadcrumb Component */}
      {showBreadcrumb && (
        <Card sx={{ mb: 3 }}>
          <CardHeader title="브레드크럼 네비게이션" />
          <CardContent>
            <Breadcrumb
              items={sampleBreadcrumbs}
              onItemClick={handleBreadcrumbClick}
              showBack
              onBackClick={() => handleBreadcrumbClick({ id: 'back', label: '뒤로가기' })}
            />
          </CardContent>
        </Card>
      )}

      {/* Performance & Interaction Monitoring */}
      <Card>
        <CardHeader 
          title="성능 및 상호작용 모니터링"
          action={<SpeedIcon color="primary" />}
        />
        <CardContent>
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Card variant="outlined">
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" color="primary">
                    {testMetrics.userInteractions}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    총 사용자 상호작용
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={4}>
              <Card variant="outlined">
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" color={testMetrics.responseTime > 50 ? 'error' : 'success'}>
                    {testMetrics.responseTime}ms
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    평균 응답 시간
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={4}>
              <Card variant="outlined">
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" color={testMetrics.errors > 0 ? 'error' : 'success'}>
                    {testMetrics.errors}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    오류 발생 횟수
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          <Box sx={{ mt: 3 }}>
            <Alert 
              severity={
                testMetrics.errors > 0 ? 'error' :
                testMetrics.responseTime > 50 ? 'warning' :
                testMetrics.userInteractions > 0 ? 'success' : 'info'
              }
              icon={testMetrics.errors > 0 ? <ErrorIcon /> : <CheckIcon />}
            >
              <Typography variant="body2">
                {testMetrics.errors > 0 ? 
                  `${testMetrics.errors}개의 오류가 발생했습니다. 네비게이션 컴포넌트를 확인해주세요.` :
                 testMetrics.responseTime > 50 ? 
                  '응답 시간이 평균보다 높습니다. 성능 최적화를 고려해보세요.' :
                 testMetrics.userInteractions > 0 ?
                  `네비게이션이 정상적으로 작동 중입니다. ${testMetrics.userInteractions}번의 상호작용이 기록되었습니다.` :
                  '네비게이션 테스트를 시작하세요. 위의 역할 변경 버튼이나 탭을 클릭해보세요.'}
              </Typography>
            </Alert>
          </Box>

          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" color="text.secondary">
              <strong>테스트 가이드:</strong>
            </Typography>
            <Typography variant="caption" color="text.secondary" component="div">
              • <strong>역할 기반 접근:</strong> 각 역할별로 접근 가능한 탭이 다름<br/>
              • <strong>실시간 업데이트:</strong> 통계 정보가 실시간으로 변경됨<br/>
              • <strong>상호작용 추적:</strong> 모든 클릭과 액션이 메트릭에 기록됨<br/>
              • <strong>자동 테스트:</strong> 모든 기능을 자동으로 테스트하여 성능 측정
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}

export default NavigationTest;