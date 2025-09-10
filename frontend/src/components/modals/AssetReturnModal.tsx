/**
 * Asset Return Modal Component
 *
 * Comprehensive modal for processing asset returns with validation,
 * condition assessment, and automated status updates.
 */

'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Alert,
  Button,
  IconButton,
  Chip,
  Stack,
  TextField,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Switch,
  Divider,
  Rating,
  Avatar,
  Paper,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Autocomplete,
  useTheme,
  alpha,
} from '@mui/material';
import {
  Undo as ReturnIcon,
  Computer as ComputerIcon,
  Person as PersonIcon,
  Assignment as AssignmentIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  Assessment as AssessmentIcon,
  Notes as NotesIcon,
  Photo as PhotoIcon,
  CalendarToday as CalendarIcon,
  Schedule as ScheduleIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { DatePicker, TimePicker } from '@mui/x-date-pickers';

// Import base modal
import { FormModal } from './FormModal';

// Import types
import {
  Assignment,
  AssignmentWithDetails,
  ReturnAssignmentData,
} from '@/types/assignment';

// Import utilities
import {
  formatDate,
  calculateDaysBetween,
  getAssignmentStatusInfo,
} from '@/utils/assignment.utils';

// ============================================================================
// INTERFACES
// ============================================================================

export interface AssetCondition {
  overall: 'excellent' | 'good' | 'fair' | 'poor' | 'damaged';
  physical: {
    exterior: 'excellent' | 'good' | 'fair' | 'poor';
    screen?: 'excellent' | 'good' | 'fair' | 'poor';
    keyboard?: 'excellent' | 'good' | 'fair' | 'poor';
    ports?: 'excellent' | 'good' | 'fair' | 'poor';
  };
  functional: {
    performance: 'excellent' | 'good' | 'fair' | 'poor';
    software: 'excellent' | 'good' | 'fair' | 'poor';
    connectivity?: 'excellent' | 'good' | 'fair' | 'poor';
  };
  issues: AssetIssue[];
  rating: number; // 1-5 stars
  photos?: string[]; // Base64 or URLs
}

export interface AssetIssue {
  type:
    | 'cosmetic'
    | 'functional'
    | 'performance'
    | 'software'
    | 'missing_parts';
  severity: 'minor' | 'moderate' | 'major' | 'critical';
  description: string;
  location?: string;
  requiresRepair: boolean;
  estimatedCost?: number;
  photos?: string[];
}

export interface ReturnProcessStep {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  required: boolean;
  data?: any;
}

export interface ReturnValidationResult {
  canReturn: boolean;
  issues: ValidationIssue[];
  warnings: ValidationIssue[];
  nextSteps: string[];
  estimatedProcessingTime: number; // in minutes
  requiresManagerApproval: boolean;
  approvalReason?: string;
}

interface ValidationIssue {
  type: 'condition' | 'timing' | 'process' | 'documentation';
  severity: 'error' | 'warning' | 'info';
  message: string;
  solution?: string;
  blocking: boolean;
}

interface AssetReturnModalProps {
  open: boolean;
  assignment: AssignmentWithDetails | null;
  onClose: () => void;
  onReturn: (
    returnData: ReturnAssignmentData & { condition: AssetCondition }
  ) => Promise<void>;
  loading?: boolean;
  allowEarlyReturn?: boolean;
  requireConditionAssessment?: boolean;
  requireManagerApproval?: boolean;
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

const getConditionColor = (condition: string) => {
  switch (condition) {
    case 'excellent':
      return 'success';
    case 'good':
      return 'info';
    case 'fair':
      return 'warning';
    case 'poor':
    case 'damaged':
      return 'error';
    default:
      return 'default';
  }
};

const getSeverityColor = (severity: string) => {
  switch (severity) {
    case 'minor':
      return 'info';
    case 'moderate':
      return 'warning';
    case 'major':
      return 'error';
    case 'critical':
      return 'error';
    default:
      return 'default';
  }
};

const calculateReturnScore = (condition: AssetCondition): number => {
  const weights = {
    overall: 0.4,
    physical: 0.3,
    functional: 0.3,
  };

  const conditionScores = {
    excellent: 5,
    good: 4,
    fair: 3,
    poor: 2,
    damaged: 1,
  };

  const overallScore = conditionScores[condition.overall] || 0;
  const physicalAvg =
    Object.values(condition.physical).reduce(
      (sum, cond) =>
        sum + (conditionScores[cond as keyof typeof conditionScores] || 0),
      0
    ) / Object.values(condition.physical).length;

  const functionalAvg =
    Object.values(condition.functional).reduce(
      (sum, cond) =>
        sum + (conditionScores[cond as keyof typeof conditionScores] || 0),
      0
    ) / Object.values(condition.functional).length;

  return (
    overallScore * weights.overall +
    physicalAvg * weights.physical +
    functionalAvg * weights.functional
  );
};

const validateReturn = (
  assignment: AssignmentWithDetails,
  returnData: Partial<ReturnAssignmentData>,
  condition: AssetCondition
): ReturnValidationResult => {
  const issues: ValidationIssue[] = [];
  const warnings: ValidationIssue[] = [];
  const nextSteps: string[] = [];

  // Check return timing
  const assignedDate = new Date(assignment.assigned_date);
  const returnDate = returnData.return_date
    ? new Date(returnData.return_date)
    : new Date();
  const daysDiff = calculateDaysBetween(assignedDate, returnDate);

  if (daysDiff < 1) {
    warnings.push({
      type: 'timing',
      severity: 'warning',
      message: '할당 당일에 반납하는 것은 비정상적입니다.',
      solution: '반납 사유를 명확히 기재해주세요.',
      blocking: false,
    });
  }

  // Check condition issues
  const criticalIssues = condition.issues.filter(
    issue => issue.severity === 'critical'
  );
  const majorIssues = condition.issues.filter(
    issue => issue.severity === 'major'
  );

  if (criticalIssues.length > 0) {
    issues.push({
      type: 'condition',
      severity: 'error',
      message: `${criticalIssues.length}개의 심각한 문제가 발견되었습니다.`,
      solution: '수리가 필요하며 관리자 승인이 필요합니다.',
      blocking: true,
    });
    nextSteps.push('수리 접수', '관리자 승인');
  }

  if (majorIssues.length > 0) {
    warnings.push({
      type: 'condition',
      severity: 'warning',
      message: `${majorIssues.length}개의 주요 문제가 발견되었습니다.`,
      solution: '점검 후 수리 여부를 결정해야 합니다.',
      blocking: false,
    });
    nextSteps.push('기술팀 점검');
  }

  // Check documentation
  if (!returnData.return_notes || returnData.return_notes.trim().length < 10) {
    warnings.push({
      type: 'documentation',
      severity: 'warning',
      message: '반납 사유가 불충분합니다.',
      solution: '상세한 반납 사유를 작성해주세요.',
      blocking: false,
    });
  }

  const returnScore = calculateReturnScore(condition);
  const estimatedProcessingTime =
    criticalIssues.length > 0 ? 120 : majorIssues.length > 0 ? 60 : 30;
  const requiresManagerApproval =
    criticalIssues.length > 0 || returnScore < 2.5;

  return {
    canReturn: issues.length === 0,
    issues,
    warnings,
    nextSteps,
    estimatedProcessingTime,
    requiresManagerApproval,
    approvalReason: requiresManagerApproval
      ? criticalIssues.length > 0
        ? '심각한 자산 손상'
        : '낮은 자산 상태 점수'
      : undefined,
  };
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function AssetReturnModal({
  open,
  assignment,
  onClose,
  onReturn,
  loading = false,
  allowEarlyReturn = true,
  requireConditionAssessment = true,
  requireManagerApproval = false,
}: AssetReturnModalProps) {
  const theme = useTheme();

  const [activeStep, setActiveStep] = useState(0);
  const [returnData, setReturnData] = useState<Partial<ReturnAssignmentData>>({
    return_date: new Date().toISOString().split('T')[0],
    condition: 'good',
  });

  const [assetCondition, setAssetCondition] = useState<AssetCondition>({
    overall: 'good',
    physical: {
      exterior: 'good',
      screen: 'good',
      keyboard: 'good',
      ports: 'good',
    },
    functional: {
      performance: 'good',
      software: 'good',
      connectivity: 'good',
    },
    issues: [],
    rating: 4,
  });

  const [currentIssue, setCurrentIssue] = useState<Partial<AssetIssue>>({});
  const [showAddIssue, setShowAddIssue] = useState(false);
  const [validationResult, setValidationResult] =
    useState<ReturnValidationResult | null>(null);

  // Process steps
  const steps: ReturnProcessStep[] = [
    {
      id: 'basic_info',
      title: '기본 정보',
      description: '반납 날짜와 기본 정보를 확인합니다.',
      completed: false,
      required: true,
    },
    {
      id: 'condition_assessment',
      title: '상태 평가',
      description: '자산의 물리적, 기능적 상태를 평가합니다.',
      completed: false,
      required: requireConditionAssessment,
    },
    {
      id: 'notes_documentation',
      title: '문서화',
      description: '반납 사유와 특이사항을 기록합니다.',
      completed: false,
      required: true,
    },
    {
      id: 'validation_review',
      title: '검토 및 확인',
      description: '반납 정보를 최종 검토합니다.',
      completed: false,
      required: true,
    },
  ];

  // Validate return when data changes
  useEffect(() => {
    if (assignment && returnData.return_date) {
      const result = validateReturn(assignment, returnData, assetCondition);
      setValidationResult(result);
    }
  }, [assignment, returnData, assetCondition]);

  // Handle form submission
  const handleReturn = async () => {
    if (!assignment || !returnData.return_date) return;

    try {
      const completeReturnData: ReturnAssignmentData & {
        condition: AssetCondition;
      } = {
        return_date: returnData.return_date,
        return_notes: returnData.return_notes || '',
        condition: returnData.condition || 'good',
        condition: assetCondition,
      };

      await onReturn(completeReturnData);
      onClose();
    } catch (error) {
      console.error('Return processing error:', error);
    }
  };

  // Add issue to condition
  const handleAddIssue = () => {
    if (!currentIssue.type || !currentIssue.description) return;

    const newIssue: AssetIssue = {
      type: currentIssue.type as AssetIssue['type'],
      severity: currentIssue.severity || 'minor',
      description: currentIssue.description,
      location: currentIssue.location,
      requiresRepair: currentIssue.requiresRepair || false,
      estimatedCost: currentIssue.estimatedCost,
    };

    setAssetCondition(prev => ({
      ...prev,
      issues: [...prev.issues, newIssue],
    }));

    setCurrentIssue({});
    setShowAddIssue(false);
  };

  // Remove issue
  const handleRemoveIssue = (index: number) => {
    setAssetCondition(prev => ({
      ...prev,
      issues: prev.issues.filter((_, i) => i !== index),
    }));
  };

  if (!assignment) return null;

  const assignmentDuration = calculateDaysBetween(
    assignment.assigned_date,
    returnData.return_date
  );
  const canProceed =
    validationResult?.canReturn &&
    returnData.return_date &&
    (!validationResult.requiresManagerApproval || requireManagerApproval);

  return (
    <FormModal
      open={open}
      onClose={onClose}
      title='자산 반납 처리'
      subtitle={`${assignment.asset_description} (${assignment.id})`}
      onSubmit={handleReturn}
      submitLabel='반납 완료'
      loading={loading}
      disabled={!canProceed}
      maxWidth='lg'
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        {/* Assignment Overview */}
        <Card variant='outlined'>
          <CardContent>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar sx={{ bgcolor: 'primary.main' }}>
                    {assignment.employee_name.charAt(0)}
                  </Avatar>
                  <Box>
                    <Typography variant='h6'>
                      {assignment.employee_name}
                    </Typography>
                    <Typography variant='body2' color='text.secondary'>
                      {assignment.employee.department} •{' '}
                      {assignment.employee.position}
                    </Typography>
                  </Box>
                </Box>
              </Grid>
              <Grid item xs={12} md={6}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <ComputerIcon color='primary' />
                  <Box>
                    <Typography variant='h6'>
                      {assignment.asset_description}
                    </Typography>
                    <Typography variant='body2' color='text.secondary'>
                      할당일: {formatDate(assignment.assigned_date)} (
                      {assignmentDuration}일 사용)
                    </Typography>
                  </Box>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Process Stepper */}
        <Stepper activeStep={activeStep} orientation='vertical'>
          {steps.map((step, index) => (
            <Step key={step.id}>
              <StepLabel
                optional={
                  !step.required && (
                    <Typography variant='caption'>선택사항</Typography>
                  )
                }
              >
                {step.title}
              </StepLabel>
              <StepContent>
                <Typography
                  variant='body2'
                  color='text.secondary'
                  sx={{ mb: 2 }}
                >
                  {step.description}
                </Typography>

                {/* Step 0: Basic Info */}
                {index === 0 && (
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <DatePicker
                        label='반납일'
                        value={
                          returnData.return_date
                            ? new Date(returnData.return_date)
                            : null
                        }
                        onChange={date =>
                          setReturnData(prev => ({
                            ...prev,
                            return_date: date?.toISOString().split('T')[0],
                          }))
                        }
                        slotProps={{
                          textField: {
                            fullWidth: true,
                            required: true,
                          },
                        }}
                        maxDate={allowEarlyReturn ? undefined : new Date()}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <FormControl fullWidth>
                        <FormLabel>전체 상태</FormLabel>
                        <RadioGroup
                          value={returnData.condition}
                          onChange={e =>
                            setReturnData(prev => ({
                              ...prev,
                              condition: e.target.value as any,
                            }))
                          }
                        >
                          <FormControlLabel
                            value='good'
                            control={<Radio />}
                            label='양호'
                          />
                          <FormControlLabel
                            value='fair'
                            control={<Radio />}
                            label='보통'
                          />
                          <FormControlLabel
                            value='poor'
                            control={<Radio />}
                            label='불량'
                          />
                          <FormControlLabel
                            value='damaged'
                            control={<Radio />}
                            label='손상'
                          />
                        </RadioGroup>
                      </FormControl>
                    </Grid>
                  </Grid>
                )}

                {/* Step 1: Condition Assessment */}
                {index === 1 && requireConditionAssessment && (
                  <Box
                    sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}
                  >
                    {/* Overall Rating */}
                    <Card variant='outlined'>
                      <CardContent>
                        <Typography variant='subtitle1' gutterBottom>
                          전체 평가
                        </Typography>
                        <Box
                          sx={{ display: 'flex', alignItems: 'center', gap: 2 }}
                        >
                          <Rating
                            value={assetCondition.rating}
                            onChange={(_, value) =>
                              setAssetCondition(prev => ({
                                ...prev,
                                rating: value || 0,
                              }))
                            }
                            size='large'
                          />
                          <Typography variant='body2'>
                            {assetCondition.rating}/5 점
                          </Typography>
                        </Box>
                      </CardContent>
                    </Card>

                    {/* Physical Condition */}
                    <Card variant='outlined'>
                      <CardContent>
                        <Typography variant='subtitle1' gutterBottom>
                          물리적 상태
                        </Typography>
                        <Grid container spacing={2}>
                          {Object.entries(assetCondition.physical).map(
                            ([key, value]) => (
                              <Grid item xs={6} key={key}>
                                <FormControl fullWidth size='small'>
                                  <FormLabel>
                                    {key === 'exterior'
                                      ? '외관'
                                      : key === 'screen'
                                        ? '화면'
                                        : key === 'keyboard'
                                          ? '키보드'
                                          : '포트'}
                                  </FormLabel>
                                  <RadioGroup
                                    row
                                    value={value}
                                    onChange={e =>
                                      setAssetCondition(prev => ({
                                        ...prev,
                                        physical: {
                                          ...prev.physical,
                                          [key]: e.target.value,
                                        },
                                      }))
                                    }
                                  >
                                    <FormControlLabel
                                      value='excellent'
                                      control={<Radio size='small' />}
                                      label='우수'
                                    />
                                    <FormControlLabel
                                      value='good'
                                      control={<Radio size='small' />}
                                      label='양호'
                                    />
                                    <FormControlLabel
                                      value='fair'
                                      control={<Radio size='small' />}
                                      label='보통'
                                    />
                                    <FormControlLabel
                                      value='poor'
                                      control={<Radio size='small' />}
                                      label='불량'
                                    />
                                  </RadioGroup>
                                </FormControl>
                              </Grid>
                            )
                          )}
                        </Grid>
                      </CardContent>
                    </Card>

                    {/* Functional Condition */}
                    <Card variant='outlined'>
                      <CardContent>
                        <Typography variant='subtitle1' gutterBottom>
                          기능적 상태
                        </Typography>
                        <Grid container spacing={2}>
                          {Object.entries(assetCondition.functional).map(
                            ([key, value]) => (
                              <Grid item xs={6} key={key}>
                                <FormControl fullWidth size='small'>
                                  <FormLabel>
                                    {key === 'performance'
                                      ? '성능'
                                      : key === 'software'
                                        ? '소프트웨어'
                                        : '연결성'}
                                  </FormLabel>
                                  <RadioGroup
                                    row
                                    value={value}
                                    onChange={e =>
                                      setAssetCondition(prev => ({
                                        ...prev,
                                        functional: {
                                          ...prev.functional,
                                          [key]: e.target.value,
                                        },
                                      }))
                                    }
                                  >
                                    <FormControlLabel
                                      value='excellent'
                                      control={<Radio size='small' />}
                                      label='우수'
                                    />
                                    <FormControlLabel
                                      value='good'
                                      control={<Radio size='small' />}
                                      label='양호'
                                    />
                                    <FormControlLabel
                                      value='fair'
                                      control={<Radio size='small' />}
                                      label='보통'
                                    />
                                    <FormControlLabel
                                      value='poor'
                                      control={<Radio size='small' />}
                                      label='불량'
                                    />
                                  </RadioGroup>
                                </FormControl>
                              </Grid>
                            )
                          )}
                        </Grid>
                      </CardContent>
                    </Card>

                    {/* Issues */}
                    <Card variant='outlined'>
                      <CardContent>
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            mb: 2,
                          }}
                        >
                          <Typography variant='subtitle1'>
                            발견된 문제
                          </Typography>
                          <Button
                            variant='outlined'
                            size='small'
                            onClick={() => setShowAddIssue(true)}
                          >
                            문제 추가
                          </Button>
                        </Box>

                        {assetCondition.issues.length === 0 ? (
                          <Typography variant='body2' color='text.secondary'>
                            발견된 문제가 없습니다.
                          </Typography>
                        ) : (
                          <Stack spacing={1}>
                            {assetCondition.issues.map((issue, index) => (
                              <Paper key={index} sx={{ p: 2 }}>
                                <Box
                                  sx={{
                                    display: 'flex',
                                    alignItems: 'flex-start',
                                    justifyContent: 'space-between',
                                  }}
                                >
                                  <Box sx={{ flex: 1 }}>
                                    <Box
                                      sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 1,
                                        mb: 1,
                                      }}
                                    >
                                      <Chip
                                        label={issue.type}
                                        size='small'
                                        color={
                                          getSeverityColor(
                                            issue.severity
                                          ) as any
                                        }
                                      />
                                      <Chip
                                        label={issue.severity}
                                        size='small'
                                        variant='outlined'
                                      />
                                      {issue.requiresRepair && (
                                        <Chip
                                          label='수리 필요'
                                          size='small'
                                          color='warning'
                                        />
                                      )}
                                    </Box>
                                    <Typography variant='body2'>
                                      {issue.description}
                                    </Typography>
                                    {issue.location && (
                                      <Typography
                                        variant='caption'
                                        color='text.secondary'
                                      >
                                        위치: {issue.location}
                                      </Typography>
                                    )}
                                    {issue.estimatedCost && (
                                      <Typography
                                        variant='caption'
                                        color='text.secondary'
                                        display='block'
                                      >
                                        예상 수리비:{' '}
                                        {issue.estimatedCost.toLocaleString()}원
                                      </Typography>
                                    )}
                                  </Box>
                                  <IconButton
                                    size='small'
                                    onClick={() => handleRemoveIssue(index)}
                                    color='error'
                                  >
                                    <CloseIcon fontSize='small' />
                                  </IconButton>
                                </Box>
                              </Paper>
                            ))}
                          </Stack>
                        )}

                        {/* Add Issue Form */}
                        {showAddIssue && (
                          <Paper
                            sx={{ p: 2, mt: 2, bgcolor: 'background.default' }}
                          >
                            <Typography variant='subtitle2' gutterBottom>
                              새 문제 추가
                            </Typography>
                            <Grid container spacing={2}>
                              <Grid item xs={12} md={6}>
                                <Autocomplete
                                  options={[
                                    'cosmetic',
                                    'functional',
                                    'performance',
                                    'software',
                                    'missing_parts',
                                  ]}
                                  getOptionLabel={option =>
                                    ({
                                      cosmetic: '외관 손상',
                                      functional: '기능 문제',
                                      performance: '성능 저하',
                                      software: '소프트웨어 문제',
                                      missing_parts: '부품 누락',
                                    })[option]
                                  }
                                  value={currentIssue.type || null}
                                  onChange={(_, value) =>
                                    setCurrentIssue(prev => ({
                                      ...prev,
                                      type: value as any,
                                    }))
                                  }
                                  renderInput={params => (
                                    <TextField
                                      {...params}
                                      label='문제 유형'
                                      size='small'
                                    />
                                  )}
                                />
                              </Grid>
                              <Grid item xs={12} md={6}>
                                <Autocomplete
                                  options={[
                                    'minor',
                                    'moderate',
                                    'major',
                                    'critical',
                                  ]}
                                  getOptionLabel={option =>
                                    ({
                                      minor: '경미',
                                      moderate: '보통',
                                      major: '주요',
                                      critical: '심각',
                                    })[option]
                                  }
                                  value={currentIssue.severity || null}
                                  onChange={(_, value) =>
                                    setCurrentIssue(prev => ({
                                      ...prev,
                                      severity: value as any,
                                    }))
                                  }
                                  renderInput={params => (
                                    <TextField
                                      {...params}
                                      label='심각도'
                                      size='small'
                                    />
                                  )}
                                />
                              </Grid>
                              <Grid item xs={12}>
                                <TextField
                                  fullWidth
                                  size='small'
                                  label='문제 설명'
                                  value={currentIssue.description || ''}
                                  onChange={e =>
                                    setCurrentIssue(prev => ({
                                      ...prev,
                                      description: e.target.value,
                                    }))
                                  }
                                  multiline
                                  rows={2}
                                />
                              </Grid>
                              <Grid item xs={12} md={6}>
                                <TextField
                                  fullWidth
                                  size='small'
                                  label='발생 위치'
                                  value={currentIssue.location || ''}
                                  onChange={e =>
                                    setCurrentIssue(prev => ({
                                      ...prev,
                                      location: e.target.value,
                                    }))
                                  }
                                />
                              </Grid>
                              <Grid item xs={12} md={6}>
                                <TextField
                                  fullWidth
                                  size='small'
                                  type='number'
                                  label='예상 수리비 (원)'
                                  value={currentIssue.estimatedCost || ''}
                                  onChange={e =>
                                    setCurrentIssue(prev => ({
                                      ...prev,
                                      estimatedCost: e.target.value
                                        ? parseInt(e.target.value)
                                        : undefined,
                                    }))
                                  }
                                />
                              </Grid>
                              <Grid item xs={12}>
                                <Box
                                  sx={{
                                    display: 'flex',
                                    gap: 1,
                                    alignItems: 'center',
                                  }}
                                >
                                  <FormControlLabel
                                    control={
                                      <Switch
                                        checked={
                                          currentIssue.requiresRepair || false
                                        }
                                        onChange={e =>
                                          setCurrentIssue(prev => ({
                                            ...prev,
                                            requiresRepair: e.target.checked,
                                          }))
                                        }
                                      />
                                    }
                                    label='수리 필요'
                                  />
                                  <Box sx={{ flex: 1 }} />
                                  <Button
                                    variant='outlined'
                                    size='small'
                                    onClick={() => setShowAddIssue(false)}
                                  >
                                    취소
                                  </Button>
                                  <Button
                                    variant='contained'
                                    size='small'
                                    onClick={handleAddIssue}
                                    disabled={
                                      !currentIssue.type ||
                                      !currentIssue.description
                                    }
                                  >
                                    추가
                                  </Button>
                                </Box>
                              </Grid>
                            </Grid>
                          </Paper>
                        )}
                      </CardContent>
                    </Card>
                  </Box>
                )}

                {/* Step 2: Documentation */}
                {index === 2 && (
                  <Box
                    sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
                  >
                    <TextField
                      fullWidth
                      multiline
                      rows={4}
                      label='반납 사유 및 특이사항'
                      value={returnData.return_notes || ''}
                      onChange={e =>
                        setReturnData(prev => ({
                          ...prev,
                          return_notes: e.target.value,
                        }))
                      }
                      placeholder='반납 사유, 사용 중 발견한 문제점, 개선 사항 등을 자세히 기록해주세요...'
                      helperText='최소 10자 이상 작성해주세요.'
                    />
                  </Box>
                )}

                {/* Step 3: Validation Review */}
                {index === 3 && validationResult && (
                  <Box
                    sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
                  >
                    {/* Validation Results */}
                    <Alert
                      severity={
                        validationResult.canReturn ? 'success' : 'error'
                      }
                      icon={
                        validationResult.canReturn ? (
                          <CheckCircleIcon />
                        ) : (
                          <ErrorIcon />
                        )
                      }
                    >
                      <Typography variant='subtitle2'>
                        {validationResult.canReturn
                          ? '반납 처리 가능'
                          : '반납 처리 불가'}
                      </Typography>
                      <Typography variant='body2'>
                        예상 처리 시간:{' '}
                        {validationResult.estimatedProcessingTime}분
                      </Typography>
                    </Alert>

                    {/* Issues */}
                    {validationResult.issues.length > 0 && (
                      <Box>
                        <Typography
                          variant='subtitle2'
                          color='error'
                          gutterBottom
                        >
                          해결 필요 사항 ({validationResult.issues.length}개)
                        </Typography>
                        <Stack spacing={1}>
                          {validationResult.issues.map((issue, index) => (
                            <Alert key={index} severity='error' size='small'>
                              <Typography variant='body2'>
                                {issue.message}
                              </Typography>
                              {issue.solution && (
                                <Typography variant='caption' display='block'>
                                  해결방법: {issue.solution}
                                </Typography>
                              )}
                            </Alert>
                          ))}
                        </Stack>
                      </Box>
                    )}

                    {/* Warnings */}
                    {validationResult.warnings.length > 0 && (
                      <Box>
                        <Typography
                          variant='subtitle2'
                          color='warning.main'
                          gutterBottom
                        >
                          주의사항 ({validationResult.warnings.length}개)
                        </Typography>
                        <Stack spacing={1}>
                          {validationResult.warnings.map((warning, index) => (
                            <Alert key={index} severity='warning' size='small'>
                              <Typography variant='body2'>
                                {warning.message}
                              </Typography>
                              {warning.solution && (
                                <Typography variant='caption' display='block'>
                                  권장사항: {warning.solution}
                                </Typography>
                              )}
                            </Alert>
                          ))}
                        </Stack>
                      </Box>
                    )}

                    {/* Next Steps */}
                    {validationResult.nextSteps.length > 0 && (
                      <Box>
                        <Typography
                          variant='subtitle2'
                          color='info.main'
                          gutterBottom
                        >
                          후속 조치
                        </Typography>
                        <Stack spacing={0.5}>
                          {validationResult.nextSteps.map((step, index) => (
                            <Typography
                              key={index}
                              variant='body2'
                              sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1,
                              }}
                            >
                              <InfoIcon fontSize='small' color='info' />
                              {step}
                            </Typography>
                          ))}
                        </Stack>
                      </Box>
                    )}

                    {/* Manager Approval Required */}
                    {validationResult.requiresManagerApproval && (
                      <Alert severity='info'>
                        <Typography variant='body2'>
                          관리자 승인이 필요합니다:{' '}
                          {validationResult.approvalReason}
                        </Typography>
                      </Alert>
                    )}
                  </Box>
                )}

                {/* Step Navigation */}
                <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                  <Button
                    disabled={activeStep === 0}
                    onClick={() => setActiveStep(prev => prev - 1)}
                  >
                    이전
                  </Button>
                  <Button
                    variant='contained'
                    onClick={() => {
                      if (activeStep === steps.length - 1) {
                        // Final step - this will be handled by form submission
                      } else {
                        setActiveStep(prev => prev + 1);
                      }
                    }}
                    disabled={activeStep === steps.length - 1}
                  >
                    다음
                  </Button>
                </Box>
              </StepContent>
            </Step>
          ))}
        </Stepper>
      </Box>
    </FormModal>
  );
}

// ============================================================================
// EXPORTS
// ============================================================================

export default AssetReturnModal;
