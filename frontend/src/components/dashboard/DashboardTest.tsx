import { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Grid,
  Typography,
  Paper,
  Stack,
  Card,
  CardContent,
  CardHeader,
  Button,
  Switch,
  FormControlLabel,
  Alert,
  Chip,
  LinearProgress,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Computer,
  Software,
  People,
  Assignment,
  PlayArrow as PlayIcon,
  Pause as PauseIcon,
  Refresh as RefreshIcon,
  Speed as SpeedIcon,
  Timeline as TimelineIcon,
  Dashboard as DashboardIcon,
  Analytics as AnalyticsIcon,
  CheckCircle as CheckIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';

import { StatCard } from './StatCard';
import { RecentActivities } from './RecentActivities';
import { LicenseStatus } from './LicenseStatus';
import { AssetChart } from './AssetChart';

// Type definitions for testing
interface Activity {
  id: string;
  user: string;
  action: string;
  targetType: 'hardware' | 'software' | 'employee' | 'assignment' | 'user';
  targetName: string;
  timestamp: string;
  status: 'success' | 'warning' | 'error' | 'info';
  details?: string;
}

interface SoftwareLicense {
  id: string;
  name: string;
  manufacturer: string;
  version: string;
  licenseType: string;
  totalLicenses: number;
  usedLicenses: number;
  availableLicenses: number;
  expiryDate?: string;
  cost: number;
  status: 'active' | 'expiring' | 'expired' | 'exceeded';
}

interface AssetData {
  id: string;
  category: string;
  name: string;
  value: number;
  status: 'active' | 'inactive' | 'maintenance';
}

interface DashboardMetrics {
  renderTime: number;
  dataLoadTime: number;
  chartRenderTime: number;
  updateCount: number;
  errorCount: number;
}

// Data generators for realistic testing
const generateRealTimeActivity = (): Activity => {
  const users = ['김철수', '이영희', '박민수', '정수진', '최영호', '한미경'];
  const actions = [
    '자산 등록',
    '자산 수정',
    '자산 삭제',
    '할당 변경',
    '직원 추가',
    '라이센스 갱신',
  ];
  const types: Activity['targetType'][] = [
    'hardware',
    'software',
    'employee',
    'assignment',
  ];
  const statuses: Activity['status'][] = [
    'success',
    'warning',
    'error',
    'info',
  ];

  return {
    id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
    user: users[Math.floor(Math.random() * users.length)],
    action: actions[Math.floor(Math.random() * actions.length)],
    targetType: types[Math.floor(Math.random() * types.length)],
    targetName: `대상-${Math.floor(Math.random() * 1000)}`,
    timestamp: new Date().toISOString(),
    status: statuses[Math.floor(Math.random() * statuses.length)],
    details: `자동 생성된 테스트 활동입니다.`,
  };
};

const generateDynamicStats = () => {
  const baseStats = {
    employees: 125,
    hardware: 450,
    software: 87.5,
    assignments: 380,
  };

  return {
    employees: baseStats.employees + Math.floor(Math.random() * 10 - 5),
    hardware: baseStats.hardware + Math.floor(Math.random() * 20 - 10),
    software: Math.max(
      0,
      Math.min(100, baseStats.software + (Math.random() * 10 - 5))
    ),
    assignments: baseStats.assignments + Math.floor(Math.random() * 15 - 7),
  };
};

const generateAssetChartData = (): AssetData[] => {
  const hardware = [
    { name: '데스크톱 PC', baseValue: 120 },
    { name: '노트북', baseValue: 85 },
    { name: '모니터', baseValue: 180 },
    { name: '프린터', baseValue: 25 },
    { name: '서버', baseValue: 15 },
  ];

  const software = [
    { name: 'Office 제품군', baseValue: 200 },
    { name: '디자인 도구', baseValue: 50 },
    { name: '개발 도구', baseValue: 75 },
    { name: '보안 소프트웨어', baseValue: 180 },
  ];

  return [
    ...hardware.map((item, index) => ({
      id: `hw-${index}`,
      category: 'hardware',
      name: item.name,
      value: Math.max(0, item.baseValue + Math.floor(Math.random() * 20 - 10)),
      status: 'active' as const,
    })),
    ...software.map((item, index) => ({
      id: `sw-${index}`,
      category: 'software',
      name: item.name,
      value: Math.max(0, item.baseValue + Math.floor(Math.random() * 30 - 15)),
      status: 'active' as const,
    })),
  ];
};

export function DashboardTest() {
  // Test state management
  const [isRealTimeActive, setIsRealTimeActive] = useState(false);
  const [testMode, setTestMode] = useState<'static' | 'dynamic' | 'stress'>(
    'static'
  );
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    renderTime: 0,
    dataLoadTime: 0,
    chartRenderTime: 0,
    updateCount: 0,
    errorCount: 0,
  });

  // Dashboard data state
  const [currentStats, setCurrentStats] = useState(() =>
    generateDynamicStats()
  );
  const [activities, setActivities] = useState<Activity[]>([]);
  const [assetData, setAssetData] = useState<AssetData[]>(() =>
    generateAssetChartData()
  );
  const [licenses] = useState<SoftwareLicense[]>([
    {
      id: 'soft1',
      name: 'Microsoft Office 365',
      manufacturer: 'Microsoft',
      version: '2024',
      licenseType: 'Subscription',
      totalLicenses: 100,
      usedLicenses: 85,
      availableLicenses: 15,
      expiryDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 45).toISOString(),
      cost: 12000000,
      status: 'active',
    },
    {
      id: 'soft2',
      name: 'Adobe Creative Suite',
      manufacturer: 'Adobe',
      version: 'CC 2024',
      licenseType: 'Perpetual',
      totalLicenses: 25,
      usedLicenses: 23,
      availableLicenses: 2,
      expiryDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 15).toISOString(),
      cost: 50000000,
      status: 'expiring',
    },
    {
      id: 'soft3',
      name: 'Windows 11 Pro',
      manufacturer: 'Microsoft',
      version: '11',
      licenseType: 'OEM',
      totalLicenses: 150,
      usedLicenses: 120,
      availableLicenses: 30,
      cost: 24000000,
      status: 'active',
    },
    {
      id: 'soft4',
      name: 'AutoCAD',
      manufacturer: 'Autodesk',
      version: '2024',
      licenseType: 'Subscription',
      totalLicenses: 10,
      usedLicenses: 12,
      availableLicenses: -2,
      expiryDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 90).toISOString(),
      cost: 25000000,
      status: 'exceeded',
    },
  ]);

  // Performance measurement utility
  const measurePerformance = useCallback(
    (operation: string, fn: () => void) => {
      const startTime = performance.now();
      try {
        fn();
        const endTime = performance.now();
        const duration = endTime - startTime;

        setMetrics(prev => ({
          ...prev,
          [operation + 'Time']: Math.round(duration * 100) / 100,
          updateCount: prev.updateCount + 1,
        }));

        return duration;
      } catch (error) {
        setMetrics(prev => ({
          ...prev,
          errorCount: prev.errorCount + 1,
        }));
        throw error;
      }
    },
    []
  );

  // Real-time data updates
  useEffect(() => {
    if (!isRealTimeActive) return;

    const updateInterval =
      testMode === 'stress' ? 500 : testMode === 'dynamic' ? 2000 : 5000;

    const interval = setInterval(() => {
      measurePerformance('dataLoad', () => {
        // Update stats
        setCurrentStats(generateDynamicStats());

        // Add new activity
        const newActivity = generateRealTimeActivity();
        setActivities(prev => [newActivity, ...prev.slice(0, 19)]); // Keep latest 20

        // Update chart data occasionally
        if (Math.random() > 0.7) {
          setAssetData(generateAssetChartData());
        }
      });
    }, updateInterval);

    return () => clearInterval(interval);
  }, [isRealTimeActive, testMode, measurePerformance]);

  // Performance monitoring
  useEffect(() => {
    const measureRenderTime = () => {
      measurePerformance('render', () => {
        // Simulate render measurement
      });
    };

    const timeoutId = setTimeout(measureRenderTime, 100);
    return () => clearTimeout(timeoutId);
  }, [currentStats, activities, assetData, measurePerformance]);

  // Event handlers
  const handleRefresh = useCallback(() => {
    measurePerformance('dataLoad', () => {
      setCurrentStats(generateDynamicStats());
      setAssetData(generateAssetChartData());
      setActivities(prev => [generateRealTimeActivity(), ...prev.slice(0, 9)]);
    });
  }, [measurePerformance]);

  const handleTestModeChange = (mode: typeof testMode) => {
    setTestMode(mode);
    if (mode === 'stress') {
      // Generate initial stress data
      const stressActivities = Array.from({ length: 50 }, () =>
        generateRealTimeActivity()
      );
      setActivities(stressActivities);
    }
  };

  const resetMetrics = () => {
    setMetrics({
      renderTime: 0,
      dataLoadTime: 0,
      chartRenderTime: 0,
      updateCount: 0,
      errorCount: 0,
    });
  };

  return (
    <Box>
      <Typography variant='h5' gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
        대시보드 실시간 데이터 테스트
      </Typography>

      {/* Test Control Panel */}
      <Card sx={{ mb: 3 }}>
        <CardHeader
          title='테스트 제어판'
          action={
            <Stack direction='row' spacing={2} alignItems='center'>
              <FormControlLabel
                control={
                  <Switch
                    checked={isRealTimeActive}
                    onChange={e => setIsRealTimeActive(e.target.checked)}
                  />
                }
                label='실시간 업데이트'
              />
              <Button
                variant='outlined'
                startIcon={<RefreshIcon />}
                onClick={handleRefresh}
                size='small'
              >
                새로고침
              </Button>
            </Stack>
          }
        />
        <CardContent>
          <Grid container spacing={3} alignItems='center'>
            <Grid item xs={12} md={6}>
              <Typography variant='body2' sx={{ mb: 1 }}>
                테스트 모드:
              </Typography>
              <Stack direction='row' spacing={1}>
                {(['static', 'dynamic', 'stress'] as const).map(mode => (
                  <Button
                    key={mode}
                    variant={testMode === mode ? 'contained' : 'outlined'}
                    size='small'
                    onClick={() => handleTestModeChange(mode)}
                  >
                    {mode === 'static'
                      ? '정적'
                      : mode === 'dynamic'
                        ? '동적'
                        : '스트레스'}
                  </Button>
                ))}
              </Stack>
            </Grid>

            <Grid item xs={12} md={6}>
              <Stack direction='row' spacing={2} alignItems='center'>
                <Box>
                  <Typography variant='caption' color='text.secondary'>
                    업데이트 횟수
                  </Typography>
                  <Typography variant='h6'>{metrics.updateCount}</Typography>
                </Box>
                <Box>
                  <Typography variant='caption' color='text.secondary'>
                    평균 렌더링 시간
                  </Typography>
                  <Typography
                    variant='h6'
                    color={metrics.renderTime > 100 ? 'error' : 'success'}
                  >
                    {metrics.renderTime}ms
                  </Typography>
                </Box>
                <Box>
                  <Typography variant='caption' color='text.secondary'>
                    오류 수
                  </Typography>
                  <Typography
                    variant='h6'
                    color={metrics.errorCount > 0 ? 'error' : 'text.primary'}
                  >
                    {metrics.errorCount}
                  </Typography>
                </Box>
                <Button size='small' onClick={resetMetrics}>
                  초기화
                </Button>
              </Stack>
            </Grid>
          </Grid>

          {isRealTimeActive && (
            <Box sx={{ mt: 2 }}>
              <LinearProgress />
              <Typography
                variant='caption'
                color='text.secondary'
                sx={{ mt: 1, display: 'block' }}
              >
                실시간 데이터 업데이트 중... ({testMode} 모드)
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Dashboard Statistics */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title='총 직원수'
            value={currentStats.employees.toString()}
            subtitle='활성 직원'
            icon={<People />}
            color='primary'
            trend={
              isRealTimeActive
                ? {
                    value: Math.floor(Math.random() * 10 - 5),
                    label: '명',
                    period: '실시간',
                  }
                : undefined
            }
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title='하드웨어 자산'
            value={currentStats.hardware.toString()}
            subtitle='관리 중인 자산'
            icon={<Computer />}
            color='secondary'
            trend={
              isRealTimeActive
                ? {
                    value: Math.floor(Math.random() * 20 - 10),
                    label: '대',
                    period: '실시간',
                  }
                : undefined
            }
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title='소프트웨어 활용률'
            value={`${currentStats.software.toFixed(1)}%`}
            subtitle='라이센스 사용률'
            icon={<Software />}
            color='info'
            trend={
              isRealTimeActive
                ? {
                    value: Math.round((Math.random() * 10 - 5) * 10) / 10,
                    label: '%',
                    period: '실시간',
                  }
                : undefined
            }
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title='할당 현황'
            value={currentStats.assignments.toString()}
            subtitle='활성 할당'
            icon={<Assignment />}
            color='success'
            trend={
              isRealTimeActive
                ? {
                    value: Math.floor(Math.random() * 15 - 7),
                    label: '건',
                    period: '실시간',
                  }
                : undefined
            }
          />
        </Grid>
      </Grid>

      {/* Dashboard Content */}
      <Grid container spacing={3}>
        {/* Recent Activities */}
        <Grid item xs={12} md={6}>
          <RecentActivities
            activities={activities}
            title={`최근 활동 (${activities.length})`}
            maxItems={10}
            onRefresh={handleRefresh}
            showTimestamp
            showUserAvatar
            loading={isRealTimeActive && testMode === 'stress'}
          />
        </Grid>

        {/* License Status */}
        <Grid item xs={12} md={6}>
          <LicenseStatus
            licenses={licenses}
            title='소프트웨어 라이센스 상태'
            maxItems={5}
            onRefresh={handleRefresh}
            showAlerts
            alertThreshold={0.85}
            expiryWarningDays={30}
          />
        </Grid>

        {/* Asset Charts */}
        <Grid item xs={12} md={6}>
          <AssetChart
            data={assetData.filter(item => item.category === 'hardware')}
            title='하드웨어 자산 분포'
            type='pie'
            height={350}
            onRefresh={handleRefresh}
            showLegend
            showValues
            showPercentages
            loading={isRealTimeActive && testMode === 'stress'}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <AssetChart
            data={assetData.filter(item => item.category === 'software')}
            title='소프트웨어 자산 분포'
            type='bar'
            height={350}
            onRefresh={handleRefresh}
            showValues
            loading={isRealTimeActive && testMode === 'stress'}
          />
        </Grid>

        {/* Performance Monitoring */}
        <Grid item xs={12}>
          <Card>
            <CardHeader
              title='성능 모니터링'
              action={<SpeedIcon color='primary' />}
            />
            <CardContent>
              <Grid container spacing={3}>
                <Grid item xs={12} md={3}>
                  <Box textAlign='center'>
                    <Typography
                      variant='h4'
                      color={metrics.renderTime > 100 ? 'error' : 'success'}
                    >
                      {metrics.renderTime}ms
                    </Typography>
                    <Typography variant='body2' color='text.secondary'>
                      렌더링 시간
                    </Typography>
                  </Box>
                </Grid>

                <Grid item xs={12} md={3}>
                  <Box textAlign='center'>
                    <Typography variant='h4' color='primary'>
                      {metrics.dataLoadTime}ms
                    </Typography>
                    <Typography variant='body2' color='text.secondary'>
                      데이터 로딩 시간
                    </Typography>
                  </Box>
                </Grid>

                <Grid item xs={12} md={3}>
                  <Box textAlign='center'>
                    <Typography variant='h4' color='info.main'>
                      {metrics.updateCount}
                    </Typography>
                    <Typography variant='body2' color='text.secondary'>
                      총 업데이트 횟수
                    </Typography>
                  </Box>
                </Grid>

                <Grid item xs={12} md={3}>
                  <Box textAlign='center'>
                    <Typography
                      variant='h4'
                      color={metrics.errorCount > 0 ? 'error' : 'success'}
                    >
                      {metrics.errorCount}
                    </Typography>
                    <Typography variant='body2' color='text.secondary'>
                      오류 발생 횟수
                    </Typography>
                  </Box>
                </Grid>
              </Grid>

              <Box sx={{ mt: 3 }}>
                <Alert
                  severity={
                    metrics.errorCount > 0
                      ? 'error'
                      : metrics.renderTime > 100
                        ? 'warning'
                        : metrics.updateCount > 0
                          ? 'success'
                          : 'info'
                  }
                  icon={
                    metrics.errorCount > 0 ? (
                      <ErrorIcon />
                    ) : metrics.renderTime > 100 ? (
                      <WarningIcon />
                    ) : (
                      <CheckIcon />
                    )
                  }
                >
                  <Typography variant='body2'>
                    {metrics.errorCount > 0
                      ? `${metrics.errorCount}개의 오류가 발생했습니다. 컴포넌트를 확인해주세요.`
                      : metrics.renderTime > 100
                        ? '렌더링 성능이 저하되고 있습니다. 최적화를 고려해보세요.'
                        : metrics.updateCount > 0
                          ? `대시보드가 정상적으로 작동 중입니다. ${metrics.updateCount}번 업데이트됨.`
                          : '대시보드 테스트를 시작하세요.'}
                  </Typography>
                </Alert>
              </Box>

              <Box sx={{ mt: 2 }}>
                <Typography variant='body2' color='text.secondary'>
                  <strong>테스트 가이드:</strong>
                </Typography>
                <Typography
                  variant='caption'
                  color='text.secondary'
                  component='div'
                >
                  • <strong>정적 모드:</strong> 고정된 데이터로 기본 렌더링
                  테스트
                  <br />• <strong>동적 모드:</strong> 2초마다 데이터 업데이트로
                  실시간 성능 테스트
                  <br />• <strong>스트레스 모드:</strong> 0.5초마다 대량 데이터
                  업데이트로 극한 성능 테스트
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}

export default DashboardTest;
