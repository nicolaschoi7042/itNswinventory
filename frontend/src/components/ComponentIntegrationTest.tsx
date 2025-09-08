import {
  Box,
  Typography,
  Paper,
  Stack,
  Grid,
  Card,
  CardContent,
  CardHeader,
  Divider,
  Switch,
  FormControlLabel,
  Button,
  TextField,
  MenuItem,
  Chip,
  Alert,
  LinearProgress,
  Tabs,
  Tab,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  PlayArrow as PlayIcon,
  Pause as PauseIcon,
  Refresh as RefreshIcon,
  Assessment as AssessmentIcon,
  BugReport as BugReportIcon,
  Speed as SpeedIcon,
} from '@mui/icons-material';
import { useState, useEffect, ReactNode } from 'react';

// Import all component test categories
import FormTest from './forms/FormTest';
import TableTest from './tables/TableTest';
import ModalTest from './modals/ModalTest';
import DashboardTest from './dashboard/DashboardTest';
import NavigationTest from './navigation/NavigationTest';

// Import individual components for integration testing
import { FormInput } from './forms/FormInput';
import { FormSelect } from './forms/FormSelect';
import { FormButton } from './forms/FormButton';
import { DataTable } from './tables/DataTable';
import { SearchFilter } from './tables/SearchFilter';
import { FormModal } from './modals/FormModal';
import { ConfirmDialog } from './modals/ConfirmDialog';
import { StatCard } from './dashboard/StatCard';
import { RecentActivities } from './dashboard/RecentActivities';
import { Header } from './navigation/Header';
import { NavigationTabs } from './navigation/NavigationTabs';
import { UserMenu } from './navigation/UserMenu';

// Sample data generators
const generateEmployeeData = (count: number = 100) => {
  const departments = ['IT팀', '개발팀', '디자인팀', '마케팅팀', '영업팀', '재무팀'];
  const statuses = ['재직', '휴직', '퇴직'];
  
  return Array.from({ length: count }, (_, index) => ({
    id: `EMP${String(index + 1).padStart(4, '0')}`,
    name: `직원${index + 1}`,
    email: `employee${index + 1}@company.com`,
    department: departments[Math.floor(Math.random() * departments.length)],
    position: `${['주임', '대리', '과장', '차장', '부장'][Math.floor(Math.random() * 5)]}`,
    phone: `010-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`,
    hireDate: new Date(2020 + Math.floor(Math.random() * 4), Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1).toISOString(),
    status: statuses[Math.floor(Math.random() * statuses.length)],
    salary: 3000 + Math.floor(Math.random() * 5000),
  }));
};

const generateHardwareData = (count: number = 150) => {
  const types = ['데스크톱', '노트북', '모니터', '프린터', '서버'];
  const manufacturers = ['Dell', 'HP', 'Lenovo', 'Samsung', 'LG'];
  const statuses = ['사용중', '대기', '수리중', '폐기'];
  
  return Array.from({ length: count }, (_, index) => ({
    id: `HW${String(index + 1).padStart(4, '0')}`,
    assetTag: `AS${String(index + 1000).padStart(4, '0')}`,
    type: types[Math.floor(Math.random() * types.length)],
    manufacturer: manufacturers[Math.floor(Math.random() * manufacturers.length)],
    model: `Model-${index + 1}`,
    serialNumber: `SN${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
    purchaseDate: new Date(2019 + Math.floor(Math.random() * 5), Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1).toISOString(),
    status: statuses[Math.floor(Math.random() * statuses.length)],
    location: `${Math.floor(Math.random() * 10) + 1}층`,
    assignedTo: Math.random() > 0.3 ? `직원${Math.floor(Math.random() * 100) + 1}` : null,
    cost: 500 + Math.floor(Math.random() * 3000),
  }));
};

const generateActivityData = (count: number = 50) => {
  const actions = ['생성', '수정', '삭제', '할당', '반납', '로그인', '로그아웃'];
  const targetTypes = ['employee', 'hardware', 'software', 'assignment', 'user'];
  const users = ['김관리자', '이매니저', '박사용자', '정개발자', '최디자이너'];
  const statuses = ['success', 'warning', 'error', 'info'];
  
  return Array.from({ length: count }, (_, index) => ({
    id: String(index + 1),
    user: users[Math.floor(Math.random() * users.length)],
    action: actions[Math.floor(Math.random() * actions.length)],
    targetType: targetTypes[Math.floor(Math.random() * targetTypes.length)] as 'employee' | 'hardware' | 'software' | 'assignment' | 'user',
    targetName: `대상${index + 1}`,
    timestamp: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
    status: statuses[Math.floor(Math.random() * statuses.length)] as 'success' | 'warning' | 'error' | 'info',
    details: `${actions[Math.floor(Math.random() * actions.length)]} 작업이 수행되었습니다.`,
  }));
};

interface TestScenario {
  id: string;
  name: string;
  description: string;
  component: ReactNode;
  category: 'forms' | 'tables' | 'modals' | 'dashboard' | 'navigation' | 'integration';
  complexity: 'low' | 'medium' | 'high';
  performance: boolean;
  accessibility: boolean;
}

interface ComponentIntegrationTestProps {
  showPerformanceMetrics?: boolean;
  enableRealTimeUpdates?: boolean;
  simulateSlowNetwork?: boolean;
}

export function ComponentIntegrationTest({
  showPerformanceMetrics = true,
  enableRealTimeUpdates = false,
  simulateSlowNetwork = false,
}: ComponentIntegrationTestProps) {
  const [currentTab, setCurrentTab] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [employeeData] = useState(() => generateEmployeeData(200));
  const [hardwareData] = useState(() => generateHardwareData(300));
  const [activityData, setActivityData] = useState(() => generateActivityData(100));
  const [performanceMetrics, setPerformanceMetrics] = useState({
    renderTime: 0,
    memoryUsage: 0,
    componentCount: 0,
  });

  // Simulate real-time data updates
  useEffect(() => {
    if (!enableRealTimeUpdates || !isRunning) return;

    const interval = setInterval(() => {
      // Add new activity
      const newActivity = {
        id: String(Date.now()),
        user: '시스템',
        action: '자동 업데이트',
        targetType: 'system' as const,
        targetName: '실시간 데이터',
        timestamp: new Date().toISOString(),
        status: 'info' as const,
        details: '실시간 데이터가 업데이트되었습니다.',
      };
      
      setActivityData(prev => [newActivity, ...prev.slice(0, 99)]);
    }, 3000);

    return () => clearInterval(interval);
  }, [enableRealTimeUpdates, isRunning]);

  // Performance monitoring
  useEffect(() => {
    if (!showPerformanceMetrics) return;

    const startTime = performance.now();
    
    // Simulate performance measurement
    const measurePerformance = () => {
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      
      setPerformanceMetrics({
        renderTime: Math.round(renderTime),
        memoryUsage: Math.round(Math.random() * 100), // Simulated
        componentCount: document.querySelectorAll('[data-testid]').length,
      });
    };

    const timeoutId = setTimeout(measurePerformance, 100);
    return () => clearTimeout(timeoutId);
  }, [currentTab, showPerformanceMetrics]);

  const testScenarios: TestScenario[] = [
    {
      id: 'integration-overview',
      name: '통합 테스트 개요',
      description: '모든 UI 컴포넌트의 통합 상황을 보여주는 대시보드',
      component: <IntegrationOverview 
        employeeData={employeeData}
        hardwareData={hardwareData}
        activityData={activityData}
        performanceMetrics={performanceMetrics}
      />,
      category: 'integration',
      complexity: 'high',
      performance: true,
      accessibility: true,
    },
    {
      id: 'forms-comprehensive',
      name: '폼 컴포넌트 종합 테스트',
      description: '모든 폼 컴포넌트의 검증과 제출 테스트',
      component: <FormTest />,
      category: 'forms',
      complexity: 'medium',
      performance: false,
      accessibility: true,
    },
    {
      id: 'tables-performance',
      name: '테이블 컴포넌트 성능 테스트',
      description: '대용량 데이터와 복잡한 상호작용 테스트',
      component: <TableTest />,
      category: 'tables',
      complexity: 'high',
      performance: true,
      accessibility: true,
    },
    {
      id: 'modals-workflow',
      name: '모달 컴포넌트 워크플로우 테스트',
      description: '복잡한 모달 체인과 데이터 처리 테스트',
      component: <ModalTest />,
      category: 'modals',
      complexity: 'medium',
      performance: false,
      accessibility: true,
    },
    {
      id: 'dashboard-realtime',
      name: '대시보드 실시간 데이터 테스트',
      description: '실시간 업데이트와 차트 렌더링 성능 테스트',
      component: <DashboardTest />,
      category: 'dashboard',
      complexity: 'high',
      performance: true,
      accessibility: false,
    },
    {
      id: 'navigation-auth',
      name: '네비게이션 인증 플로우 테스트',
      description: '역할 기반 접근 제어와 네비게이션 상태 관리 테스트',
      component: <NavigationTest />,
      category: 'navigation',
      complexity: 'medium',
      performance: false,
      accessibility: true,
    },
  ];

  const handleStartTest = () => {
    setIsRunning(true);
  };

  const handleStopTest = () => {
    setIsRunning(false);
  };

  const handleRefresh = () => {
    window.location.reload();
  };

  const getTabLabel = (index: number) => {
    const scenario = testScenarios[index];
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Typography variant="body2">{scenario.name}</Typography>
        <Stack direction="row" spacing={0.5}>
          {scenario.performance && (
            <Chip label="성능" size="small" color="info" variant="outlined" sx={{ height: 16, fontSize: '0.6rem' }} />
          )}
          {scenario.accessibility && (
            <Chip label="접근성" size="small" color="success" variant="outlined" sx={{ height: 16, fontSize: '0.6rem' }} />
          )}
          <Chip 
            label={scenario.complexity} 
            size="small" 
            color={scenario.complexity === 'high' ? 'error' : scenario.complexity === 'medium' ? 'warning' : 'default'}
            variant="outlined" 
            sx={{ height: 16, fontSize: '0.6rem' }} 
          />
        </Stack>
      </Box>
    );
  };

  return (
    <Box sx={{ backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
      {/* Header */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h4" sx={{ fontWeight: 600 }}>
            UI Components Integration Test Suite
          </Typography>
          
          <Stack direction="row" spacing={2} alignItems="center">
            {showPerformanceMetrics && (
              <Card sx={{ px: 2, py: 1 }}>
                <Stack direction="row" spacing={2} alignItems="center">
                  <Tooltip title="렌더링 시간">
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="caption" color="text.secondary">렌더링</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {performanceMetrics.renderTime}ms
                      </Typography>
                    </Box>
                  </Tooltip>
                  <Tooltip title="메모리 사용량">
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="caption" color="text.secondary">메모리</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {performanceMetrics.memoryUsage}MB
                      </Typography>
                    </Box>
                  </Tooltip>
                  <Tooltip title="컴포넌트 개수">
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="caption" color="text.secondary">컴포넌트</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {performanceMetrics.componentCount}
                      </Typography>
                    </Box>
                  </Tooltip>
                </Stack>
              </Card>
            )}

            <Button
              variant={isRunning ? "outlined" : "contained"}
              startIcon={isRunning ? <PauseIcon /> : <PlayIcon />}
              onClick={isRunning ? handleStopTest : handleStartTest}
              color={isRunning ? "warning" : "primary"}
            >
              {isRunning ? '테스트 중지' : '테스트 시작'}
            </Button>
            
            <IconButton onClick={handleRefresh}>
              <RefreshIcon />
            </IconButton>
          </Stack>
        </Box>

        <Stack direction="row" spacing={2}>
          <FormControlLabel
            control={<Switch checked={enableRealTimeUpdates} onChange={(e) => setIsRunning(e.target.checked)} />}
            label="실시간 업데이트"
          />
          <FormControlLabel
            control={<Switch checked={simulateSlowNetwork} disabled />}
            label="느린 네트워크 시뮬레이션"
          />
          <FormControlLabel
            control={<Switch checked={showPerformanceMetrics} disabled />}
            label="성능 메트릭 표시"
          />
        </Stack>

        {isRunning && (
          <Box sx={{ mt: 2 }}>
            <LinearProgress />
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
              통합 테스트가 실행 중입니다. 실시간 데이터 업데이트와 성능 모니터링이 활성화되어 있습니다.
            </Typography>
          </Box>
        )}
      </Paper>

      {/* Test Tabs */}
      <Paper sx={{ mx: 3 }}>
        <Tabs
          value={currentTab}
          onChange={(_, newValue) => setCurrentTab(newValue)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{ borderBottom: 1, borderColor: 'divider', px: 2 }}
        >
          {testScenarios.map((scenario, index) => (
            <Tab
              key={scenario.id}
              label={getTabLabel(index)}
              sx={{ textTransform: 'none', minHeight: 64 }}
            />
          ))}
        </Tabs>

        {/* Test Content */}
        <Box sx={{ p: 3, minHeight: 600 }}>
          {testScenarios.map((scenario, index) => (
            <Box key={scenario.id} hidden={currentTab !== index}>
              {currentTab === index && (
                <>
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                      {scenario.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {scenario.description}
                    </Typography>
                    
                    <Stack direction="row" spacing={1}>
                      <Chip label={`카테고리: ${scenario.category}`} size="small" />
                      <Chip 
                        label={`복잡도: ${scenario.complexity}`} 
                        size="small"
                        color={scenario.complexity === 'high' ? 'error' : scenario.complexity === 'medium' ? 'warning' : 'default'}
                      />
                      {scenario.performance && <Chip label="성능 테스트" size="small" color="info" />}
                      {scenario.accessibility && <Chip label="접근성 테스트" size="small" color="success" />}
                    </Stack>
                  </Box>
                  
                  <Divider sx={{ my: 2 }} />
                  
                  {scenario.component}
                </>
              )}
            </Box>
          ))}
        </Box>
      </Paper>
    </Box>
  );
}

// Integration overview component
interface IntegrationOverviewProps {
  employeeData: any[];
  hardwareData: any[];
  activityData: any[];
  performanceMetrics: any;
}

function IntegrationOverview({ 
  employeeData, 
  hardwareData, 
  activityData, 
  performanceMetrics 
}: IntegrationOverviewProps) {
  const [selectedEmployee, setSelectedEmployee] = useState<any>(null);
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <Grid container spacing={3}>
      {/* Stats Overview */}
      <Grid item xs={12}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="총 직원수"
              value={employeeData.length}
              subtitle="등록된 임직원"
              color="primary"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="하드웨어 자산"
              value={hardwareData.length}
              subtitle="관리중인 자산"
              color="secondary"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="최근 활동"
              value={activityData.length}
              subtitle="시스템 활동"
              color="info"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="성능 점수"
              value={`${Math.max(0, 100 - Math.floor(performanceMetrics.renderTime / 10))}점`}
              subtitle="렌더링 성능"
              color="success"
            />
          </Grid>
        </Grid>
      </Grid>

      {/* Data Table Integration */}
      <Grid item xs={12} md={8}>
        <Card>
          <CardHeader title="직원 데이터 테이블 (통합 테스트)" />
          <CardContent>
            <DataTable
              columns={[
                { id: 'id', label: '사번', sortable: true },
                { id: 'name', label: '이름', sortable: true },
                { id: 'department', label: '부서', sortable: true },
                { id: 'position', label: '직급', sortable: true },
                { id: 'status', label: '상태', sortable: true },
              ]}
              data={employeeData.slice(0, 10)}
              onRowClick={(row) => {
                setSelectedEmployee(row);
                setModalOpen(true);
              }}
              loading={false}
              pagination
              pageSize={10}
              totalCount={employeeData.length}
            />
          </CardContent>
        </Card>
      </Grid>

      {/* Activity Feed */}
      <Grid item xs={12} md={4}>
        <RecentActivities
          activities={activityData.slice(0, 10)}
          title="실시간 활동 피드"
          maxItems={10}
          showTimestamp
        />
      </Grid>

      {/* Form Integration */}
      <Grid item xs={12} md={6}>
        <Card>
          <CardHeader title="폼 컴포넌트 통합" />
          <CardContent>
            <Stack spacing={2}>
              <FormInput
                label="검색어 입력"
                placeholder="직원명 또는 사번을 입력하세요"
                fullWidth
              />
              <FormSelect
                label="부서 선택"
                value=""
                options={[
                  { value: 'it', label: 'IT팀' },
                  { value: 'dev', label: '개발팀' },
                  { value: 'design', label: '디자인팀' },
                ]}
                fullWidth
              />
              <FormButton
                variant="contained"
                color="primary"
                onClick={() => console.log('통합 검색 실행')}
                fullWidth
              >
                통합 검색 실행
              </FormButton>
            </Stack>
          </CardContent>
        </Card>
      </Grid>

      {/* Performance Monitoring */}
      <Grid item xs={12} md={6}>
        <Card>
          <CardHeader 
            title="성능 모니터링" 
            action={
              <IconButton size="small">
                <SpeedIcon />
              </IconButton>
            }
          />
          <CardContent>
            <Stack spacing={2}>
              <Box>
                <Typography variant="body2" gutterBottom>
                  렌더링 시간: {performanceMetrics.renderTime}ms
                </Typography>
                <LinearProgress 
                  variant="determinate" 
                  value={Math.min(100, performanceMetrics.renderTime / 2)} 
                  color={performanceMetrics.renderTime > 100 ? 'error' : 'success'}
                />
              </Box>
              
              <Box>
                <Typography variant="body2" gutterBottom>
                  메모리 사용량: {performanceMetrics.memoryUsage}MB
                </Typography>
                <LinearProgress 
                  variant="determinate" 
                  value={performanceMetrics.memoryUsage} 
                  color={performanceMetrics.memoryUsage > 80 ? 'warning' : 'info'}
                />
              </Box>
              
              <Alert severity="info" sx={{ mt: 2 }}>
                총 {performanceMetrics.componentCount}개의 컴포넌트가 렌더링되었습니다.
              </Alert>
            </Stack>
          </CardContent>
        </Card>
      </Grid>

      {/* Modal Integration */}
      {modalOpen && selectedEmployee && (
        <FormModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          title="직원 상세 정보"
          maxWidth="md"
          onSubmit={(data) => {
            console.log('직원 정보 수정:', data);
            setModalOpen(false);
          }}
        >
          <Stack spacing={2}>
            <FormInput
              label="이름"
              value={selectedEmployee.name}
              disabled
            />
            <FormInput
              label="이메일"
              value={selectedEmployee.email}
              disabled
            />
            <FormInput
              label="부서"
              value={selectedEmployee.department}
              disabled
            />
            <FormInput
              label="직급"
              value={selectedEmployee.position}
              disabled
            />
            <Alert severity="info">
              이것은 모달 컴포넌트와 폼 컴포넌트의 통합 테스트입니다.
            </Alert>
          </Stack>
        </FormModal>
      )}
    </Grid>
  );
}

export default ComponentIntegrationTest;