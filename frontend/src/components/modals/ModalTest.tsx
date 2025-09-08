import React, { useState, useCallback, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  Grid, 
  Card, 
  CardContent,
  CardActions,
  Paper,
  Stack,
  Alert,
  Chip,
  Divider,
  LinearProgress,
  TextField,
  Switch,
  FormControlLabel,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  CardHeader,
} from '@mui/material';
import {
  PlayArrow as PlayIcon,
  Pause as PauseIcon,
  Speed as SpeedIcon,
  CheckCircle as CheckIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  Warning as WarningIcon,
  Person as PersonIcon,
  Computer as ComputerIcon,
  Delete as DeleteIcon,
  Notifications as NotificationIcon,
} from '@mui/icons-material';

import { FormModal } from './FormModal';
import { ConfirmDialog } from './ConfirmDialog';
import { InfoDialog } from './InfoDialog';
import { AlertDialog } from './AlertDialog';
import { FormInput, FormSelect, FormGroup } from '../forms';

interface ModalTestScenario {
  id: string;
  name: string;
  description: string;
  category: 'form' | 'confirm' | 'info' | 'alert';
  complexity: 'low' | 'medium' | 'high';
  completed: boolean;
}

interface ModalTestMetrics {
  totalScenarios: number;
  completedScenarios: number;
  successRate: number;
  averageLoadTime: number;
}

export function ModalTest() {
  // State management for testing
  const [isRunning, setIsRunning] = useState(false);
  const [currentScenario, setCurrentScenario] = useState<number>(-1);
  const [completedScenarios, setCompletedScenarios] = useState<Set<string>>(new Set());
  const [testMetrics, setTestMetrics] = useState<ModalTestMetrics>({
    totalScenarios: 8,
    completedScenarios: 0,
    successRate: 0,
    averageLoadTime: 0,
  });

  // Modal states
  const [modals, setModals] = useState({
    employeeForm: { open: false, loading: false },
    hardwareForm: { open: false, loading: false },
    confirmDialog: { open: false, loading: false, config: null as any },
    infoDialog: { open: false, data: null as any },
    alertDialog: { open: false, message: '', severity: 'info' as any },
  });

  // Form data
  const [formData, setFormData] = useState({
    employee: {
      name: '김철수',
      email: 'kim.cs@company.com',
      department: 'IT팀',
      position: '시니어 개발자',
      phone: '010-1234-5678',
      hireDate: '2020-03-15',
    },
    hardware: {
      name: 'MacBook Pro 16인치',
      type: '노트북',
      manufacturer: 'Apple',
      model: 'MacBook Pro',
      serialNumber: 'FVFXM1MNFQ6L',
      purchaseDate: '2023-06-15',
      status: '사용중',
    },
  });

  // Test scenarios configuration
  const testScenarios: ModalTestScenario[] = [
    {
      id: 'employee-form-create',
      name: '직원 등록 폼',
      description: '새 직원 정보 입력 및 검증',
      category: 'form',
      complexity: 'medium',
      completed: false,
    },
    {
      id: 'hardware-form-create',
      name: '하드웨어 등록 폼',
      description: '새 하드웨어 자산 정보 입력',
      category: 'form',
      complexity: 'medium',
      completed: false,
    },
    {
      id: 'confirm-delete',
      name: '삭제 확인 다이얼로그',
      description: '위험한 작업에 대한 사용자 확인',
      category: 'confirm',
      complexity: 'low',
      completed: false,
    },
    {
      id: 'confirm-bulk-action',
      name: '대량 작업 확인',
      description: '다중 항목에 대한 작업 확인',
      category: 'confirm',
      complexity: 'medium',
      completed: false,
    },
    {
      id: 'info-employee-detail',
      name: '직원 상세 정보',
      description: '직원 정보 표시 및 편집',
      category: 'info',
      complexity: 'medium',
      completed: false,
    },
    {
      id: 'info-asset-detail',
      name: '자산 상세 정보',
      description: '하드웨어 자산 상세 보기',
      category: 'info',
      complexity: 'medium',
      completed: false,
    },
    {
      id: 'alert-success',
      name: '성공 알림',
      description: '작업 성공 시 알림 표시',
      category: 'alert',
      complexity: 'low',
      completed: false,
    },
    {
      id: 'alert-error',
      name: '오류 알림',
      description: '오류 발생 시 알림 표시',
      category: 'alert',
      complexity: 'low',
      completed: false,
    },
  ];

  // Sample test data
  const sampleEmployee = {
    id: 'EMP001',
    name: '김철수',
    department: 'IT팀',
    email: 'kim.cs@company.com',
    phone: '010-1234-5678',
    position: '시니어 개발자',
    hireDate: '2020-03-15',
    status: '재직',
    assignedAssets: ['MacBook Pro', 'Dell Monitor', 'Magic Keyboard'],
    photo: 'https://i.pravatar.cc/200?img=1',
  };

  const sampleHardware = {
    id: 'HW001',
    name: 'MacBook Pro 16인치',
    type: '노트북',
    manufacturer: 'Apple',
    model: 'MacBook Pro',
    serialNumber: 'FVFXM1MNFQ6L',
    assignedTo: '김철수',
    status: '사용중',
    purchaseDate: '2023-06-15',
    warrantyExpiry: '2026-06-15',
    cost: 3200000,
  };

  // Modal action handlers
  const handleModalAction = useCallback((modalType: string, action: string, data?: any) => {
    const startTime = performance.now();
    
    setModals(prev => ({
      ...prev,
      [modalType]: {
        ...prev[modalType as keyof typeof prev],
        [action === 'open' ? 'open' : 'open']: action === 'open',
        loading: action === 'loading',
        ...(data && { config: data, data: data }),
      },
    }));

    // Mark scenario as completed when modal is opened
    if (action === 'open') {
      const scenarioId = getCurrentScenarioId(modalType);
      if (scenarioId) {
        setCompletedScenarios(prev => new Set([...prev, scenarioId]));
        const endTime = performance.now();
        const loadTime = endTime - startTime;
        
        setTestMetrics(prev => ({
          ...prev,
          completedScenarios: prev.completedScenarios + 1,
          successRate: ((prev.completedScenarios + 1) / prev.totalScenarios) * 100,
          averageLoadTime: (prev.averageLoadTime + loadTime) / 2,
        }));
      }
    }
  }, []);

  const getCurrentScenarioId = (modalType: string): string | null => {
    const mapping: { [key: string]: string } = {
      'employeeForm': 'employee-form-create',
      'hardwareForm': 'hardware-form-create',
      'confirmDialog': 'confirm-delete',
      'infoDialog': 'info-employee-detail',
      'alertDialog': 'alert-success',
    };
    return mapping[modalType] || null;
  };

  // Form submission handlers
  const handleEmployeeSubmit = useCallback(async (event: React.FormEvent) => {
    event.preventDefault();
    handleModalAction('employeeForm', 'loading', true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    handleModalAction('employeeForm', 'close');
    handleModalAction('alertDialog', 'open', {
      message: '직원이 성공적으로 등록되었습니다.',
      severity: 'success'
    });
    
    setTimeout(() => handleModalAction('alertDialog', 'close'), 3000);
  }, [handleModalAction]);

  const handleHardwareSubmit = useCallback(async (event: React.FormEvent) => {
    event.preventDefault();
    handleModalAction('hardwareForm', 'loading', true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1200));
    
    handleModalAction('hardwareForm', 'close');
    handleModalAction('alertDialog', 'open', {
      message: '하드웨어 자산이 성공적으로 등록되었습니다.',
      severity: 'success'
    });
    
    setTimeout(() => handleModalAction('alertDialog', 'close'), 3000);
  }, [handleModalAction]);

  const handleConfirmAction = useCallback(async () => {
    handleModalAction('confirmDialog', 'loading', true);
    
    // Simulate delete operation
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    handleModalAction('confirmDialog', 'close');
    handleModalAction('alertDialog', 'open', {
      message: '항목이 성공적으로 삭제되었습니다.',
      severity: 'info'
    });
    
    setTimeout(() => handleModalAction('alertDialog', 'close'), 3000);
  }, [handleModalAction]);

  // Test scenario runners
  const runScenario = useCallback((scenarioId: string) => {
    switch (scenarioId) {
      case 'employee-form-create':
        handleModalAction('employeeForm', 'open');
        break;
      case 'hardware-form-create':
        handleModalAction('hardwareForm', 'open');
        break;
      case 'confirm-delete':
        handleModalAction('confirmDialog', 'open', {
          title: '삭제 확인',
          message: '정말로 이 항목을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.',
          confirmText: '삭제',
          cancelText: '취소',
          severity: 'error',
          onConfirm: handleConfirmAction,
        });
        break;
      case 'confirm-bulk-action':
        handleModalAction('confirmDialog', 'open', {
          title: '대량 작업 확인',
          message: '선택된 15개 항목에 대해 일괄 처리를 수행하시겠습니까?',
          confirmText: '실행',
          cancelText: '취소',
          severity: 'warning',
          onConfirm: handleConfirmAction,
        });
        break;
      case 'info-employee-detail':
        handleModalAction('infoDialog', 'open', { type: 'employee', data: sampleEmployee });
        break;
      case 'info-asset-detail':
        handleModalAction('infoDialog', 'open', { type: 'hardware', data: sampleHardware });
        break;
      case 'alert-success':
        handleModalAction('alertDialog', 'open', {
          message: '작업이 성공적으로 완료되었습니다!',
          severity: 'success'
        });
        setTimeout(() => handleModalAction('alertDialog', 'close'), 3000);
        break;
      case 'alert-error':
        handleModalAction('alertDialog', 'open', {
          message: '오류가 발생했습니다. 다시 시도해주세요.',
          severity: 'error'
        });
        setTimeout(() => handleModalAction('alertDialog', 'close'), 3000);
        break;
    }
  }, [handleModalAction, handleConfirmAction, sampleEmployee, sampleHardware]);

  // Auto-test runner
  const runAutoTest = useCallback(async () => {
    setIsRunning(true);
    
    for (let i = 0; i < testScenarios.length; i++) {
      setCurrentScenario(i);
      const scenario = testScenarios[i];
      
      runScenario(scenario.id);
      
      // Wait for scenario to complete
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
    
    setCurrentScenario(-1);
    setIsRunning(false);
  }, [testScenarios, runScenario]);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'form': return <PersonIcon />;
      case 'confirm': return <WarningIcon />;
      case 'info': return <InfoIcon />;
      case 'alert': return <NotificationIcon />;
      default: return <InfoIcon />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'form': return 'primary';
      case 'confirm': return 'warning';
      case 'info': return 'info';
      case 'alert': return 'success';
      default: return 'default';
    }
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
        모달 컴포넌트 워크플로우 테스트
      </Typography>

      {/* Test Control Panel */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={8}>
          <Card>
            <CardHeader 
              title="테스트 제어판" 
              action={
                <Button
                  variant={isRunning ? "outlined" : "contained"}
                  startIcon={isRunning ? <PauseIcon /> : <PlayIcon />}
                  onClick={isRunning ? () => setIsRunning(false) : runAutoTest}
                  color={isRunning ? "warning" : "primary"}
                >
                  {isRunning ? '테스트 중지' : '전체 테스트 실행'}
                </Button>
              }
            />
            <CardContent>
              <Grid container spacing={2}>
                {testScenarios.map((scenario, index) => (
                  <Grid item xs={12} sm={6} md={4} key={scenario.id}>
                    <Card 
                      variant="outlined" 
                      sx={{ 
                        cursor: 'pointer',
                        backgroundColor: completedScenarios.has(scenario.id) ? 'success.50' : 'background.paper',
                        borderColor: currentScenario === index ? 'primary.main' : 'divider',
                        borderWidth: currentScenario === index ? 2 : 1,
                      }}
                      onClick={() => runScenario(scenario.id)}
                    >
                      <CardContent sx={{ p: 2 }}>
                        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                          {getCategoryIcon(scenario.category)}
                          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                            {scenario.name}
                          </Typography>
                          {completedScenarios.has(scenario.id) && <CheckIcon color="success" fontSize="small" />}
                        </Stack>
                        
                        <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                          {scenario.description}
                        </Typography>
                        
                        <Stack direction="row" spacing={1}>
                          <Chip 
                            label={scenario.category} 
                            size="small" 
                            color={getCategoryColor(scenario.category) as any}
                            variant="outlined"
                          />
                          <Chip 
                            label={scenario.complexity} 
                            size="small" 
                            color={scenario.complexity === 'high' ? 'error' : scenario.complexity === 'medium' ? 'warning' : 'default'}
                            variant="outlined"
                          />
                        </Stack>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>

              {isRunning && (
                <Box sx={{ mt: 3 }}>
                  <LinearProgress />
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                    자동 테스트 실행 중... ({currentScenario + 1}/{testScenarios.length})
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Test Metrics */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardHeader 
              title="테스트 메트릭" 
              action={<SpeedIcon color="primary" />}
            />
            <CardContent>
              <Stack spacing={2}>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    완료된 시나리오
                  </Typography>
                  <Typography variant="h6">
                    {testMetrics.completedScenarios} / {testMetrics.totalScenarios}
                  </Typography>
                </Box>
                
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    성공률
                  </Typography>
                  <Typography variant="h6" color="success.main">
                    {Math.round(testMetrics.successRate)}%
                  </Typography>
                </Box>
                
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    평균 로딩 시간
                  </Typography>
                  <Typography variant="h6">
                    {Math.round(testMetrics.averageLoadTime * 100) / 100}ms
                  </Typography>
                </Box>

                <Alert 
                  severity={testMetrics.successRate === 100 ? 'success' : testMetrics.successRate > 75 ? 'info' : 'warning'}
                  icon={testMetrics.successRate === 100 ? <CheckIcon /> : <InfoIcon />}
                >
                  <Typography variant="caption">
                    {testMetrics.successRate === 100 ? '모든 테스트 완료!' : 
                     testMetrics.successRate > 75 ? '테스트 진행 중' : '테스트 시작하기'}
                  </Typography>
                </Alert>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Employee Form Modal */}
      <FormModal
        open={modals.employeeForm.open}
        onClose={() => handleModalAction('employeeForm', 'close')}
        title="직원 정보 등록"
        subtitle="새로운 직원의 정보를 입력해주세요"
        onSubmit={handleEmployeeSubmit}
        loading={modals.employeeForm.loading}
        maxWidth="md"
      >
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <FormInput
              name="name"
              label="성명"
              value={formData.employee.name}
              onChange={(value) => setFormData(prev => ({
                ...prev,
                employee: { ...prev.employee, name: value }
              }))}
              required
              placeholder="직원의 성명을 입력하세요"
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormInput
              name="email"
              label="이메일"
              type="email"
              value={formData.employee.email}
              onChange={(value) => setFormData(prev => ({
                ...prev,
                employee: { ...prev.employee, email: value }
              }))}
              required
              placeholder="이메일 주소를 입력하세요"
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormSelect
              name="department"
              label="부서"
              value={formData.employee.department}
              onChange={(value) => setFormData(prev => ({
                ...prev,
                employee: { ...prev.employee, department: value }
              }))}
              required
              options={[
                { value: 'IT팀', label: 'IT팀' },
                { value: '개발팀', label: '개발팀' },
                { value: '디자인팀', label: '디자인팀' },
                { value: '마케팅팀', label: '마케팅팀' },
              ]}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormInput
              name="position"
              label="직급"
              value={formData.employee.position}
              onChange={(value) => setFormData(prev => ({
                ...prev,
                employee: { ...prev.employee, position: value }
              }))}
              placeholder="직급을 입력하세요"
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormInput
              name="phone"
              label="연락처"
              value={formData.employee.phone}
              onChange={(value) => setFormData(prev => ({
                ...prev,
                employee: { ...prev.employee, phone: value }
              }))}
              placeholder="010-1234-5678"
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormInput
              name="hireDate"
              label="입사일"
              type="date"
              value={formData.employee.hireDate}
              onChange={(value) => setFormData(prev => ({
                ...prev,
                employee: { ...prev.employee, hireDate: value }
              }))}
            />
          </Grid>
        </Grid>
      </FormModal>

      {/* Hardware Form Modal */}
      <FormModal
        open={modals.hardwareForm.open}
        onClose={() => handleModalAction('hardwareForm', 'close')}
        title="하드웨어 자산 등록"
        subtitle="새로운 하드웨어 자산을 등록합니다"
        onSubmit={handleHardwareSubmit}
        loading={modals.hardwareForm.loading}
        maxWidth="lg"
      >
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <FormInput
              name="name"
              label="자산명"
              value={formData.hardware.name}
              onChange={(value) => setFormData(prev => ({
                ...prev,
                hardware: { ...prev.hardware, name: value }
              }))}
              required
              placeholder="자산명을 입력하세요"
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormSelect
              name="type"
              label="자산 유형"
              value={formData.hardware.type}
              onChange={(value) => setFormData(prev => ({
                ...prev,
                hardware: { ...prev.hardware, type: value }
              }))}
              required
              options={[
                { value: '노트북', label: '노트북' },
                { value: '데스크톱', label: '데스크톱' },
                { value: '모니터', label: '모니터' },
                { value: '프린터', label: '프린터' },
              ]}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormInput
              name="manufacturer"
              label="제조사"
              value={formData.hardware.manufacturer}
              onChange={(value) => setFormData(prev => ({
                ...prev,
                hardware: { ...prev.hardware, manufacturer: value }
              }))}
              placeholder="제조사를 입력하세요"
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormInput
              name="model"
              label="모델명"
              value={formData.hardware.model}
              onChange={(value) => setFormData(prev => ({
                ...prev,
                hardware: { ...prev.hardware, model: value }
              }))}
              placeholder="모델명을 입력하세요"
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormInput
              name="serialNumber"
              label="시리얼 번호"
              value={formData.hardware.serialNumber}
              onChange={(value) => setFormData(prev => ({
                ...prev,
                hardware: { ...prev.hardware, serialNumber: value }
              }))}
              placeholder="시리얼 번호를 입력하세요"
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormInput
              name="purchaseDate"
              label="구매일"
              type="date"
              value={formData.hardware.purchaseDate}
              onChange={(value) => setFormData(prev => ({
                ...prev,
                hardware: { ...prev.hardware, purchaseDate: value }
              }))}
            />
          </Grid>
        </Grid>
      </FormModal>

      {/* Confirm Dialog */}
      {modals.confirmDialog.open && (
        <ConfirmDialog
          open={modals.confirmDialog.open}
          onClose={() => handleModalAction('confirmDialog', 'close')}
          title={modals.confirmDialog.config?.title || '확인'}
          message={modals.confirmDialog.config?.message || '계속하시겠습니까?'}
          confirmText={modals.confirmDialog.config?.confirmText || '확인'}
          cancelText={modals.confirmDialog.config?.cancelText || '취소'}
          onConfirm={modals.confirmDialog.config?.onConfirm}
          loading={modals.confirmDialog.loading}
          severity={modals.confirmDialog.config?.severity}
        />
      )}

      {/* Info Dialog */}
      {modals.infoDialog.open && (
        <InfoDialog
          open={modals.infoDialog.open}
          onClose={() => handleModalAction('infoDialog', 'close')}
          title={modals.infoDialog.data?.type === 'employee' ? '직원 상세 정보' : '하드웨어 상세 정보'}
          maxWidth="md"
        >
          {modals.infoDialog.data?.type === 'employee' ? (
            <Stack spacing={2}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <Avatar src={modals.infoDialog.data.data.photo} sx={{ width: 64, height: 64 }}>
                  {modals.infoDialog.data.data.name.charAt(0)}
                </Avatar>
                <Box>
                  <Typography variant="h6">{modals.infoDialog.data.data.name}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {modals.infoDialog.data.data.position} • {modals.infoDialog.data.data.department}
                  </Typography>
                </Box>
              </Box>
              
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">이메일</Typography>
                  <Typography variant="body1">{modals.infoDialog.data.data.email}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">연락처</Typography>
                  <Typography variant="body1">{modals.infoDialog.data.data.phone}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">입사일</Typography>
                  <Typography variant="body1">{modals.infoDialog.data.data.hireDate}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">상태</Typography>
                  <Chip label={modals.infoDialog.data.data.status} size="small" color="success" />
                </Grid>
              </Grid>

              <Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>할당된 자산</Typography>
                <Stack direction="row" spacing={1} flexWrap="wrap">
                  {modals.infoDialog.data.data.assignedAssets.map((asset: string, index: number) => (
                    <Chip key={index} label={asset} size="small" variant="outlined" />
                  ))}
                </Stack>
              </Box>
            </Stack>
          ) : (
            <Stack spacing={2}>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">자산 ID</Typography>
                  <Typography variant="body1">{modals.infoDialog.data.data.id}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">유형</Typography>
                  <Typography variant="body1">{modals.infoDialog.data.data.type}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">제조사</Typography>
                  <Typography variant="body1">{modals.infoDialog.data.data.manufacturer}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">모델</Typography>
                  <Typography variant="body1">{modals.infoDialog.data.data.model}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">시리얼 번호</Typography>
                  <Typography variant="body1">{modals.infoDialog.data.data.serialNumber}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">상태</Typography>
                  <Chip label={modals.infoDialog.data.data.status} size="small" color="primary" />
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">할당자</Typography>
                  <Typography variant="body1">{modals.infoDialog.data.data.assignedTo}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">구매 가격</Typography>
                  <Typography variant="body1">₩{modals.infoDialog.data.data.cost.toLocaleString()}</Typography>
                </Grid>
              </Grid>
            </Stack>
          )}
        </InfoDialog>
      )}

      {/* Alert Dialog */}
      {modals.alertDialog.open && (
        <AlertDialog
          open={modals.alertDialog.open}
          onClose={() => handleModalAction('alertDialog', 'close')}
          severity={modals.alertDialog.severity}
          title={modals.alertDialog.severity === 'success' ? '성공' : 
                 modals.alertDialog.severity === 'error' ? '오류' : '알림'}
          message={modals.alertDialog.message}
        />
      )}
    </Box>
  );
}

export default ModalTest;