/**
 * Assignment Form Modal Component
 * 
 * Comprehensive modal for creating and editing asset assignments
 * with advanced employee and asset selection capabilities.
 */

'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Box,
  Alert,
  AlertTitle,
  Typography,
  Grid,
  Card,
  CardContent,
  Chip,
  Avatar,
  Stack,
  Autocomplete,
  TextField,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Switch,
  Divider,
  CircularProgress,
  Tabs,
  Tab,
  IconButton,
  useTheme,
  alpha
} from '@mui/material';
import {
  Person as PersonIcon,
  Computer as ComputerIcon,
  Software as SoftwareIcon,
  CalendarToday as CalendarIcon,
  Assignment as AssignmentIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  Error as ErrorIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

// Import base modal and form components
import { FormModal } from './FormModal';
import { FormInput } from '@/components/forms/FormInput';
import { FormTextArea } from '@/components/forms/FormTextArea';

// Import notes and scheduling components
import { AssignmentNotesEditor, AssignmentNote } from '@/components/notes/AssignmentNotesEditor';
import { AssignmentScheduler, ScheduledAssignment } from '@/components/scheduling/AssignmentScheduler';

// Import types
import {
  Assignment,
  AssignmentWithDetails,
  CreateAssignmentData,
  UpdateAssignmentData,
  AssetType
} from '@/types/assignment';
import { Employee } from '@/types/employee';
import { Hardware } from '@/types/hardware';
import { Software } from '@/types/software';

// Import utilities
import {
  validateCreateAssignmentData,
  validateAssetAvailability,
  validateEmployeeAssignmentLimits,
  validateSoftwareLicenseAvailability,
  validateAssignmentEligibility,
  formatDate,
  getAssignmentStatusInfo
} from '@/utils/assignment.utils';

// Import asset availability validation
import {
  getAssetAvailabilityInfo,
  validateAssetAssignment,
  checkRealTimeAvailability,
  getAssetConflicts,
  AssetAvailabilityInfo,
  AvailabilityValidationResult,
  ValidationIssue
} from '@/utils/assetAvailability.utils';

// Import validation status component
import { AssignmentValidationStatus } from '@/components/validation/AssignmentValidationStatus';

// ============================================================================
// INTERFACES
// ============================================================================

interface Asset {
  id: string;
  name: string;
  type: string;
  manufacturer?: string;
  model?: string;
  serial_number?: string;
  status?: string;
  available?: boolean;
  current_user?: string;
}

interface AssignmentFormData {
  employee_id: string;
  asset_id: string;
  asset_type: AssetType;
  assigned_date: string;
  expected_return_date?: string;
  notes?: string;
  priority?: 'low' | 'medium' | 'high';
  auto_notify?: boolean;
}

interface AssignmentFormModalProps {
  open: boolean;
  onClose: () => void;
  assignment?: AssignmentWithDetails | null;
  employees?: Employee[];
  hardware?: Hardware[];
  software?: Software[];
  assignments?: (Assignment | AssignmentWithDetails)[];
  onSubmit: (data: CreateAssignmentData | UpdateAssignmentData) => Promise<void>;
  loading?: boolean;
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

const transformToAsset = (item: Hardware | Software, type: AssetType): Asset => {
  const baseAsset: Asset = {
    id: item.id,
    name: item.name,
    type: item.type || 'Unknown',
    manufacturer: item.manufacturer,
    status: item.status || 'available',
    available: item.status === 'available'
  };

  if (type === 'hardware' && 'model' in item) {
    return {
      ...baseAsset,
      model: item.model,
      serial_number: item.serial_number
    };
  }

  if (type === 'software' && 'version' in item) {
    return {
      ...baseAsset,
      model: (item as Software).version
    };
  }

  return baseAsset;
};

const filterAvailableAssets = (assets: Asset[]): Asset[] => {
  return assets.filter(asset => 
    asset.available && 
    asset.status === 'available' && 
    !asset.current_user
  );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function AssignmentFormModal({
  open,
  onClose,
  assignment,
  employees = [],
  hardware = [],
  software = [],
  assignments = [],
  onSubmit,
  loading = false
}: AssignmentFormModalProps) {
  const theme = useTheme();
  const isEditing = !!assignment;

  const [formData, setFormData] = useState<AssignmentFormData>({
    employee_id: '',
    asset_id: '',
    asset_type: 'hardware',
    assigned_date: new Date().toISOString().split('T')[0],
    expected_return_date: '',
    notes: '',
    priority: 'medium',
    auto_notify: true
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [validationResult, setValidationResult] = useState<AvailabilityValidationResult | null>(null);
  const [realTimeChecking, setRealTimeChecking] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionError, setSubmissionError] = useState('');
  const [assetConflicts, setAssetConflicts] = useState<Assignment[]>([]);
  const [activeTab, setActiveTab] = useState(0);
  const [assignmentNotes, setAssignmentNotes] = useState<AssignmentNote[]>([]);
  const [scheduledAssignment, setScheduledAssignment] = useState<ScheduledAssignment | null>(null);
  const [useScheduling, setUseScheduling] = useState(false);

  // Transform and filter assets based on type
  const availableAssets = useMemo(() => {
    const hardwareAssets = hardware.map(hw => transformToAsset(hw, 'hardware'));
    const softwareAssets = software.map(sw => transformToAsset(sw, 'software'));
    
    const allAssets = formData.asset_type === 'hardware' ? hardwareAssets : softwareAssets;
    return filterAvailableAssets(allAssets);
  }, [hardware, software, formData.asset_type]);

  // Active employees (assuming employees have status)
  const activeEmployees = useMemo(() => {
    return employees.filter(emp => 
      !('status' in emp) || (emp as any).status !== 'inactive'
    );
  }, [employees]);

  // Initialize form data
  useEffect(() => {
    if (open) {
      if (assignment) {
        // Edit mode - populate with existing data
        setFormData({
          employee_id: assignment.employee_id,
          asset_id: assignment.asset_id,
          asset_type: assignment.asset_type,
          assigned_date: assignment.assigned_date.split('T')[0],
          expected_return_date: assignment.return_date?.split('T')[0] || '',
          notes: assignment.notes || '',
          priority: 'medium', // Default since not in current schema
          auto_notify: true
        });

        // Set selected objects
        const employee = employees.find(emp => emp.id === assignment.employee_id);
        setSelectedEmployee(employee || null);

        // Find asset from hardware or software
        let asset: Asset | null = null;
        if (assignment.asset_type === 'hardware') {
          const hw = hardware.find(hw => hw.id === assignment.asset_id);
          if (hw) asset = transformToAsset(hw, 'hardware');
        } else {
          const sw = software.find(sw => sw.id === assignment.asset_id);
          if (sw) asset = transformToAsset(sw, 'software');
        }
        setSelectedAsset(asset);
      } else {
        // Create mode - reset to defaults
        setFormData({
          employee_id: '',
          asset_id: '',
          asset_type: 'hardware',
          assigned_date: new Date().toISOString().split('T')[0],
          expected_return_date: '',
          notes: '',
          priority: 'medium',
          auto_notify: true
        });
        setSelectedEmployee(null);
        setSelectedAsset(null);
      }
      setErrors({});
    }
  }, [open, assignment, employees, hardware, software]);

  // Form validation
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Required fields
    if (!formData.employee_id) {
      newErrors.employee_id = '직원을 선택해주세요.';
    }

    if (!formData.asset_id) {
      newErrors.asset_id = '자산을 선택해주세요.';
    }

    if (!formData.assigned_date) {
      newErrors.assigned_date = '할당일을 입력해주세요.';
    }

    // Date validation
    if (formData.assigned_date) {
      const assignedDate = new Date(formData.assigned_date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (assignedDate > today) {
        newErrors.assigned_date = '할당일은 오늘 이후일 수 없습니다.';
      }
    }

    // Expected return date validation
    if (formData.expected_return_date && formData.assigned_date) {
      const assignedDate = new Date(formData.assigned_date);
      const returnDate = new Date(formData.expected_return_date);
      
      if (returnDate <= assignedDate) {
        newErrors.expected_return_date = '예상 반납일은 할당일 이후여야 합니다.';
      }
    }

    // Asset availability check
    if (selectedAsset && !selectedAsset.available && !isEditing) {
      newErrors.asset_id = '선택한 자산은 현재 사용할 수 없습니다.';
    }

    // Employee validation
    if (selectedEmployee) {
      // Check maximum assignments per employee (example: 5 active assignments max)
      const activeAssignments = assignments.filter(a => 
        a.employee_id === selectedEmployee.id && 
        a.status === '사용중' &&
        (!isEditing || a.id !== assignment?.id) // Exclude current assignment if editing
      );
      
      if (activeAssignments.length >= 5) {
        newErrors.employee_id = `${selectedEmployee.name}님은 이미 최대 할당 수(5개)에 도달했습니다.`;
      }

      // Check if employee already has this specific asset type (if business rule requires)
      if (formData.asset_type && !isEditing) {
        const existingAssetAssignment = assignments.find(a => 
          a.employee_id === selectedEmployee.id && 
          a.asset_type === formData.asset_type &&
          a.asset_id === formData.asset_id &&
          a.status === '사용중'
        );
        
        if (existingAssetAssignment) {
          newErrors.asset_id = `${selectedEmployee.name}님이 이미 동일한 자산을 사용 중입니다.`;
        }
      }
    }

    // Software license validation
    if (formData.asset_type === 'software' && selectedAsset) {
      const softwareAsset = software.find(s => s.id === formData.asset_id);
      if (softwareAsset) {
        // Check license availability
        const activeLicenses = assignments.filter(a => 
          a.asset_id === formData.asset_id && 
          a.status === '사용중' &&
          (!isEditing || a.id !== assignment?.id) // Exclude current assignment if editing
        );
        
        const maxLicenses = softwareAsset.max_licenses || softwareAsset.total_licenses || 1;
        if (activeLicenses.length >= maxLicenses) {
          newErrors.asset_id = `${softwareAsset.name} 라이선스가 모두 사용 중입니다. (${activeLicenses.length}/${maxLicenses})`;
        }

        // Check license expiry
        if (softwareAsset.expiry_date) {
          const expiryDate = new Date(softwareAsset.expiry_date);
          const assignedDate = new Date(formData.assigned_date);
          
          if (assignedDate >= expiryDate) {
            newErrors.asset_id = `${softwareAsset.name} 라이선스가 만료되었습니다. (만료일: ${formatDate(softwareAsset.expiry_date)})`;
          }
        }
      }
    }

    // Hardware specific validation
    if (formData.asset_type === 'hardware' && selectedAsset) {
      const hardwareAsset = hardware.find(h => h.id === formData.asset_id);
      if (hardwareAsset) {
        // Check maintenance status
        if (hardwareAsset.status === 'maintenance') {
          newErrors.asset_id = `${hardwareAsset.name}은(는) 현재 정비 중입니다.`;
        }
        
        // Check if hardware is already assigned
        const existingAssignment = assignments.find(a => 
          a.asset_id === formData.asset_id && 
          a.status === '사용중' &&
          (!isEditing || a.id !== assignment?.id)
        );
        
        if (existingAssignment) {
          newErrors.asset_id = `${hardwareAsset.name}은(는) 이미 ${existingAssignment.employee_name}님에게 할당되어 있습니다.`;
        }
      }
    }

    // Business rules validation
    if (formData.notes && formData.notes.length > 500) {
      newErrors.notes = '메모는 500자를 초과할 수 없습니다.';
    }

    // Enhanced comprehensive validation using new validation functions
    if (selectedEmployee && selectedAsset && formData.asset_type) {
      const softwareData = formData.asset_type === 'software' 
        ? software.find(s => s.id === formData.asset_id)
        : undefined;

      const eligibilityCheck = validateAssignmentEligibility(
        selectedEmployee.id,
        selectedAsset.id,
        formData.asset_type,
        assignments,
        {
          maxEmployeeAssignments: 5,
          softwareData: softwareData ? {
            total_licenses: softwareData.total_licenses,
            max_licenses: softwareData.max_licenses,
            concurrent_users: softwareData.concurrent_users
          } : undefined,
          excludeAssignmentId: isEditing ? assignment?.id : undefined
        }
      );

      // Add all error issues to form errors (but don't overwrite existing errors)
      eligibilityCheck.issues
        .filter(issue => issue.severity === 'error')
        .forEach(issue => {
          switch (issue.type) {
            case 'asset_availability':
              if (!newErrors.asset_id) newErrors.asset_id = issue.message;
              break;
            case 'employee_limit':
              if (!newErrors.employee_id) newErrors.employee_id = issue.message;
              break;
            case 'software_license':
              if (!newErrors.asset_id) newErrors.asset_id = issue.message;
              break;
            case 'conflict':
              if (!newErrors.asset_id) newErrors.asset_id = issue.message;
              break;
            default:
              if (!newErrors.general) newErrors.general = issue.message;
          }
        });

      // Store warnings for potential UI display
      if (eligibilityCheck.warnings.length > 0 && process.env.NODE_ENV === 'development') {
        console.log('Assignment validation warnings:', eligibilityCheck.warnings);
      }
    }

    // Asset type consistency validation
    if (formData.asset_type && formData.asset_id) {
      const assetExists = formData.asset_type === 'hardware' 
        ? hardware.some(h => h.id === formData.asset_id)
        : software.some(s => s.id === formData.asset_id);
      
      if (!assetExists) {
        newErrors.asset_id = '선택한 자산이 존재하지 않습니다.';
      }
    }

    // Include validation result issues
    if (validationResult && !validationResult.canProceed) {
      const criticalIssues = validationResult.issues.filter(issue => issue.severity === 'error');
      if (criticalIssues.length > 0) {
        newErrors.availability = `할당 불가: ${criticalIssues[0].message}`;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    setSubmissionError('');

    try {
      const submissionData = {
        employee_id: formData.employee_id,
        asset_id: formData.asset_id,
        asset_type: formData.asset_type,
        assigned_date: formData.assigned_date,
        notes: formData.notes || undefined,
        expected_return_date: formData.expected_return_date || undefined
      };

      if (isEditing) {
        await onSubmit(submissionData as UpdateAssignmentData);
      } else {
        await onSubmit(submissionData as CreateAssignmentData);
      }
      
      onClose();
    } catch (error: any) {
      console.error('Assignment submission error:', error);
      
      // Handle different types of API errors
      let errorMessage = '할당 처리 중 오류가 발생했습니다.';
      
      if (error?.response?.data?.message) {
        // Server provided specific error message
        errorMessage = error.response.data.message;
      } else if (error?.response?.status) {
        // Handle specific HTTP status codes
        switch (error.response.status) {
          case 400:
            errorMessage = '입력 데이터가 올바르지 않습니다. 모든 필드를 확인해주세요.';
            break;
          case 401:
            errorMessage = '인증이 필요합니다. 다시 로그인해주세요.';
            break;
          case 403:
            errorMessage = '이 작업을 수행할 권한이 없습니다.';
            break;
          case 404:
            errorMessage = '요청한 자원을 찾을 수 없습니다.';
            break;
          case 409:
            errorMessage = '이미 할당된 자산이거나 충돌하는 할당이 있습니다.';
            break;
          case 422:
            errorMessage = '데이터 유효성 검사에 실패했습니다.';
            break;
          case 500:
            errorMessage = '서버 내부 오류가 발생했습니다. 잠시 후 다시 시도해주세요.';
            break;
          default:
            errorMessage = `서버 오류 (${error.response.status}): 관리자에게 문의하세요.`;
        }
      } else if (error?.code === 'NETWORK_ERROR' || error?.message?.includes('Network')) {
        errorMessage = '네트워크 연결을 확인하고 다시 시도해주세요.';
      } else if (error?.code === 'TIMEOUT') {
        errorMessage = '요청 시간이 초과되었습니다. 다시 시도해주세요.';
      }

      setSubmissionError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle input changes
  const handleInputChange = (field: keyof AssignmentFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear related errors
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  // Handle employee selection
  const handleEmployeeChange = (employee: Employee | null) => {
    setSelectedEmployee(employee);
    handleInputChange('employee_id', employee?.id || '');
  };

  // Handle asset selection
  const handleAssetChange = (asset: Asset | null) => {
    setSelectedAsset(asset);
    handleInputChange('asset_id', asset?.id || '');
  };

  // Handle asset type change
  const handleAssetTypeChange = (type: AssetType) => {
    handleInputChange('asset_type', type);
    // Clear selected asset when changing type
    setSelectedAsset(null);
    handleInputChange('asset_id', '');
    setValidationResult(null);
    setAssetConflicts([]);
  };

  // Perform real-time availability validation
  const performAvailabilityValidation = useCallback(async () => {
    if (!selectedEmployee || !selectedAsset || !formData.assigned_date) {
      setValidationResult(null);
      return;
    }

    setRealTimeChecking(true);

    try {
      // Check for scheduling conflicts
      const conflicts = getAssetConflicts(
        selectedAsset.id,
        formData.assigned_date,
        assignments
      );
      setAssetConflicts(conflicts);

      // Perform comprehensive validation
      const validation = validateAssetAssignment(
        selectedEmployee,
        selectedAsset.id,
        formData.asset_type,
        hardware,
        software,
        assignments
      );

      // Real-time availability check
      const realTimeCheck = await checkRealTimeAvailability(
        selectedAsset.id,
        formData.asset_type
      );

      // Combine validation results
      if (!realTimeCheck.available) {
        validation.issues.push({
          type: 'availability',
          severity: 'error',
          message: realTimeCheck.reason || '실시간 확인에서 자산을 사용할 수 없음',
          solution: '잠시 후 다시 시도하거나 다른 자산을 선택하세요.'
        });
        validation.isValid = false;
        validation.canProceed = false;
      }

      setValidationResult(validation);
    } catch (error: any) {
      console.error('Availability validation error:', error);
      
      // Determine specific error message based on error type
      let errorMessage = '가용성 확인 중 오류가 발생했습니다.';
      let solution = '다시 시도하거나 관리자에게 문의하세요.';
      
      if (error?.response?.status) {
        switch (error.response.status) {
          case 404:
            errorMessage = '선택한 자산이나 직원 정보를 찾을 수 없습니다.';
            solution = '자산과 직원을 다시 선택해주세요.';
            break;
          case 503:
            errorMessage = '가용성 확인 서비스를 일시적으로 사용할 수 없습니다.';
            solution = '잠시 후 다시 시도해주세요.';
            break;
          case 429:
            errorMessage = '너무 많은 요청이 발생했습니다.';
            solution = '잠시 기다린 후 다시 시도해주세요.';
            break;
        }
      } else if (error?.code === 'NETWORK_ERROR' || error?.message?.includes('Network')) {
        errorMessage = '네트워크 연결 문제로 가용성을 확인할 수 없습니다.';
        solution = '인터넷 연결을 확인하고 다시 시도해주세요.';
      } else if (error?.code === 'TIMEOUT') {
        errorMessage = '가용성 확인 요청이 시간 초과되었습니다.';
        solution = '잠시 후 다시 시도해주세요.';
      }
      
      setValidationResult({
        isValid: false,
        asset: getAssetAvailabilityInfo(selectedAsset.id, formData.asset_type, hardware, software, assignments),
        employee: selectedEmployee,
        issues: [{
          type: 'availability',
          severity: 'error',
          message: errorMessage,
          solution: solution
        }],
        warnings: [],
        recommendations: [],
        canProceed: false
      });
    } finally {
      setRealTimeChecking(false);
    }
  }, [selectedEmployee, selectedAsset, formData.assigned_date, formData.asset_type, hardware, software, assignments]);

  // Run validation when key dependencies change
  useEffect(() => {
    if (selectedEmployee && selectedAsset && formData.assigned_date) {
      const timeoutId = setTimeout(() => {
        performAvailabilityValidation();
      }, 500); // Debounce validation calls

      return () => clearTimeout(timeoutId);
    } else {
      setValidationResult(null);
      setAssetConflicts([]);
    }
  }, [performAvailabilityValidation]);

  return (
    <FormModal
      open={open}
      onClose={onClose}
      title={isEditing ? '자산 할당 수정' : '새 자산 할당'}
      subtitle={isEditing ? '할당 정보를 수정합니다.' : '직원에게 자산을 할당합니다.'}
      onSubmit={handleSubmit}
      loading={isSubmitting || loading}
      disabled={isSubmitting || Object.keys(errors).length > 0}
      submitLabel={isEditing ? '수정' : '할당'}
      maxWidth="lg"
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        {/* Assignment Overview */}
        {isEditing && assignment && (
          <Alert severity="info" icon={<AssignmentIcon />}>
            <Typography variant="body2">
              할당 ID: <strong>{assignment.id}</strong> | 
              현재 상태: <Chip 
                label={getAssignmentStatusInfo(assignment.status).label} 
                color={getAssignmentStatusInfo(assignment.status).color as any}
                size="small" 
                sx={{ ml: 1 }}
              />
            </Typography>
          </Alert>
        )}

        {/* Tabs Navigation */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={activeTab} onChange={(_, value) => setActiveTab(value)}>
            <Tab label="기본 정보" icon={<AssignmentIcon />} />
            <Tab label="노트" icon={<NotesIcon />} />
            <Tab label="일정 관리" icon={<CalendarIcon />} />
          </Tabs>
        </Box>

        {/* Tab Content */}
        {activeTab === 0 && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {/* Scheduling Option */}
            <Card variant="outlined" sx={{ bgcolor: alpha(theme.palette.info.main, 0.05) }}>
              <CardContent>
                <FormControlLabel
                  control={
                    <Switch
                      checked={useScheduling}
                      onChange={(e) => setUseScheduling(e.target.checked)}
                    />
                  }
                  label={
                    <Box>
                      <Typography variant="body2">일정 예약 모드</Typography>
                      <Typography variant="caption" color="text.secondary">
                        즉시 할당하지 않고 미래 시점으로 예약합니다.
                      </Typography>
                    </Box>
                  }
                />
              </CardContent>
            </Card>

        <Grid container spacing={3}>
          {/* Employee Selection */}
          <Grid item xs={12} md={6}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <PersonIcon color="primary" />
                  직원 선택
                </Typography>
                
                <Autocomplete
                  value={selectedEmployee}
                  onChange={(_, value) => handleEmployeeChange(value)}
                  options={activeEmployees}
                  getOptionLabel={(option) => option.name}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="직원 검색"
                      placeholder="직원명을 입력하세요"
                      error={!!errors.employee_id}
                      helperText={errors.employee_id}
                      fullWidth
                    />
                  )}
                  renderOption={(props, option) => (
                    <Box component="li" {...props}>
                      <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                        {option.name.charAt(0)}
                      </Avatar>
                      <Box>
                        <Typography variant="body1">{option.name}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {option.department} • {option.position}
                        </Typography>
                      </Box>
                    </Box>
                  )}
                  disabled={isEditing}
                  noOptionsText="검색 결과가 없습니다"
                />

                {selectedEmployee && (
                  <Box sx={{ mt: 2, p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
                    <Typography variant="subtitle2" gutterBottom>선택된 직원</Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Avatar sx={{ bgcolor: 'primary.main' }}>
                        {selectedEmployee.name.charAt(0)}
                      </Avatar>
                      <Box>
                        <Typography variant="body2">{selectedEmployee.name}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {selectedEmployee.department} • {selectedEmployee.position}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Asset Selection */}
          <Grid item xs={12} md={6}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <ComputerIcon color="primary" />
                  자산 선택
                </Typography>

                {/* Asset Type Selection */}
                <FormControl component="fieldset" sx={{ mb: 2 }}>
                  <FormLabel component="legend">자산 유형</FormLabel>
                  <RadioGroup
                    row
                    value={formData.asset_type}
                    onChange={(e) => handleAssetTypeChange(e.target.value as AssetType)}
                  >
                    <FormControlLabel 
                      value="hardware" 
                      control={<Radio />} 
                      label={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <ComputerIcon fontSize="small" />
                          하드웨어
                        </Box>
                      }
                      disabled={isEditing}
                    />
                    <FormControlLabel 
                      value="software" 
                      control={<Radio />} 
                      label={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <SoftwareIcon fontSize="small" />
                          소프트웨어
                        </Box>
                      }
                      disabled={isEditing}
                    />
                  </RadioGroup>
                </FormControl>

                <Autocomplete
                  value={selectedAsset}
                  onChange={(_, value) => handleAssetChange(value)}
                  options={availableAssets}
                  getOptionLabel={(option) => `${option.name} (${option.id})`}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label={`${formData.asset_type === 'hardware' ? '하드웨어' : '소프트웨어'} 검색`}
                      placeholder="자산명 또는 ID를 입력하세요"
                      error={!!errors.asset_id}
                      helperText={errors.asset_id}
                      fullWidth
                    />
                  )}
                  renderOption={(props, option) => (
                    <Box component="li" {...props}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1 }}>
                        {formData.asset_type === 'hardware' ? 
                          <ComputerIcon color="action" /> : 
                          <SoftwareIcon color="action" />
                        }
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="body2">{option.name}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            {option.manufacturer} • {option.model || option.type} • {option.id}
                          </Typography>
                        </Box>
                        {option.available ? (
                          <Chip label="사용가능" color="success" size="small" />
                        ) : (
                          <Chip label="사용중" color="warning" size="small" />
                        )}
                      </Box>
                    </Box>
                  )}
                  disabled={isEditing}
                  noOptionsText="사용 가능한 자산이 없습니다"
                />

                {selectedAsset && (
                  <Box sx={{ mt: 2, p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
                    <Typography variant="subtitle2" gutterBottom>선택된 자산</Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {formData.asset_type === 'hardware' ? 
                        <ComputerIcon color="primary" /> : 
                        <SoftwareIcon color="primary" />
                      }
                      <Box>
                        <Typography variant="body2">{selectedAsset.name}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {selectedAsset.manufacturer} • {selectedAsset.model || selectedAsset.type}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Assignment Details */}
          <Grid item xs={12}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CalendarIcon color="primary" />
                  할당 세부사항
                </Typography>

                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <DatePicker
                      label="할당일"
                      value={formData.assigned_date ? new Date(formData.assigned_date) : null}
                      onChange={(date) => handleInputChange(
                        'assigned_date', 
                        date?.toISOString().split('T')[0] || ''
                      )}
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          error: !!errors.assigned_date,
                          helperText: errors.assigned_date
                        }
                      }}
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <DatePicker
                      label="예상 반납일 (선택사항)"
                      value={formData.expected_return_date ? new Date(formData.expected_return_date) : null}
                      onChange={(date) => handleInputChange(
                        'expected_return_date', 
                        date?.toISOString().split('T')[0] || ''
                      )}
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          error: !!errors.expected_return_date,
                          helperText: errors.expected_return_date
                        }
                      }}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <FormTextArea
                      label="할당 메모 (선택사항)"
                      value={formData.notes || ''}
                      onChange={(value) => handleInputChange('notes', value)}
                      placeholder="할당에 대한 추가 정보를 입력하세요..."
                      rows={3}
                      maxLength={500}
                      showCharCount
                    />
                  </Grid>

                  {/* Additional Options */}
                  <Grid item xs={12}>
                    <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={formData.auto_notify}
                            onChange={(e) => handleInputChange('auto_notify', e.target.checked)}
                          />
                        }
                        label="할당 완료 시 직원에게 알림"
                      />
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Asset Availability Validation Results */}
        {(validationResult || realTimeChecking) && (
          <Card variant="outlined" sx={{ border: `1px solid ${
            validationResult?.canProceed ? theme.palette.success.main : 
            validationResult?.issues.length ? theme.palette.error.main : 
            theme.palette.warning.main
          }` }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {realTimeChecking ? (
                  <>
                    <CircularProgress size={20} />
                    자산 가용성 확인 중...
                  </>
                ) : validationResult?.canProceed ? (
                  <>
                    <CheckCircleIcon color="success" />
                    할당 가능
                  </>
                ) : (
                  <>
                    <WarningIcon color="error" />
                    할당 불가능
                  </>
                )}
              </Typography>

              {validationResult && (
                <Box sx={{ mt: 2 }}>
                  {/* Critical Issues */}
                  {validationResult.issues.length > 0 && (
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="subtitle2" color="error" gutterBottom>
                        문제사항 ({validationResult.issues.length}개)
                      </Typography>
                      <Stack spacing={1}>
                        {validationResult.issues.map((issue, index) => (
                          <Alert key={index} severity="error" size="small">
                            <Typography variant="body2">{issue.message}</Typography>
                            {issue.solution && (
                              <Typography variant="caption" display="block" sx={{ mt: 0.5 }}>
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
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="subtitle2" color="warning.main" gutterBottom>
                        주의사항 ({validationResult.warnings.length}개)
                      </Typography>
                      <Stack spacing={1}>
                        {validationResult.warnings.map((warning, index) => (
                          <Alert key={index} severity="warning" size="small">
                            <Typography variant="body2">{warning.message}</Typography>
                            {warning.solution && (
                              <Typography variant="caption" display="block" sx={{ mt: 0.5 }}>
                                권장사항: {warning.solution}
                              </Typography>
                            )}
                          </Alert>
                        ))}
                      </Stack>
                    </Box>
                  )}

                  {/* Asset Conflicts */}
                  {assetConflicts.length > 0 && (
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="subtitle2" color="warning.main" gutterBottom>
                        할당 충돌 ({assetConflicts.length}개)
                      </Typography>
                      <Stack spacing={1}>
                        {assetConflicts.map((conflict, index) => (
                          <Alert key={index} severity="warning" size="small">
                            <Typography variant="body2">
                              {conflict.employee_name}에게 {formatDate(conflict.assigned_date)}부터 할당됨
                            </Typography>
                            {conflict.return_date && (
                              <Typography variant="caption" display="block">
                                예상 반납일: {formatDate(conflict.return_date)}
                              </Typography>
                            )}
                          </Alert>
                        ))}
                      </Stack>
                    </Box>
                  )}

                  {/* Asset Information */}
                  {validationResult.asset && (
                    <Box sx={{ mb: 2, p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
                      <Typography variant="subtitle2" gutterBottom>자산 상태 정보</Typography>
                      <Grid container spacing={2}>
                        <Grid item xs={6}>
                          <Typography variant="caption" color="text.secondary">가용성</Typography>
                          <Typography variant="body2">
                            {validationResult.asset.isAvailable ? '사용 가능' : '사용 불가'}
                          </Typography>
                        </Grid>
                        {validationResult.asset.currentUsers !== undefined && (
                          <Grid item xs={6}>
                            <Typography variant="caption" color="text.secondary">라이선스 사용률</Typography>
                            <Typography variant="body2">
                              {validationResult.asset.currentUsers}/{validationResult.asset.maxConcurrentUsers} 
                              ({Math.round(validationResult.asset.utilizationLevel || 0)}%)
                            </Typography>
                          </Grid>
                        )}
                        {validationResult.asset.nextAvailable && (
                          <Grid item xs={12}>
                            <Typography variant="caption" color="text.secondary">다음 가용일</Typography>
                            <Typography variant="body2">
                              {formatDate(validationResult.asset.nextAvailable)}
                            </Typography>
                          </Grid>
                        )}
                      </Grid>
                    </Box>
                  )}

                  {/* Recommendations */}
                  {validationResult.recommendations.length > 0 && (
                    <Box>
                      <Typography variant="subtitle2" color="info.main" gutterBottom>
                        권장사항
                      </Typography>
                      <Stack spacing={0.5}>
                        {validationResult.recommendations.map((rec, index) => (
                          <Typography key={index} variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <InfoIcon fontSize="small" color="info" />
                            {rec}
                          </Typography>
                        ))}
                      </Stack>
                    </Box>
                  )}

                  {/* Approval Required */}
                  {validationResult.requiresApproval && (
                    <Alert severity="info" sx={{ mt: 2 }}>
                      <Typography variant="body2">
                        관리자 승인이 필요합니다: {validationResult.approvalReason}
                      </Typography>
                    </Alert>
                  )}
                </Box>
              )}
            </CardContent>
          </Card>
        )}

        {/* Notes Tab */}
        {activeTab === 1 && (
          <Box>
            <AssignmentNotesEditor
              assignmentId={assignment?.id}
              initialNotes={assignmentNotes}
              onNotesChange={setAssignmentNotes}
              readOnly={false}
              compact={false}
              showTemplates={true}
              allowScheduling={true}
              maxNotes={20}
            />
          </Box>
        )}

        {/* Scheduling Tab */}
        {activeTab === 2 && (
          <Box>
            <AssignmentScheduler
              assignments={assignments}
              employees={employees}
              assets={[...hardware, ...software]}
              onScheduleAssignment={(scheduled) => {
                setScheduledAssignment(scheduled);
                // Pre-fill basic form with scheduled data
                setSelectedEmployee(employees.find(e => e.id === scheduled.employeeId) || null);
                setSelectedAsset({
                  id: scheduled.assetId,
                  name: scheduled.assetName,
                  type: scheduled.assetType,
                  available: true
                } as Asset);
                handleInputChange('employee_id', scheduled.employeeId);
                handleInputChange('asset_id', scheduled.assetId);
                handleInputChange('asset_type', scheduled.assetType);
                handleInputChange('assigned_date', scheduled.scheduledDate);
                if (scheduled.returnDate) {
                  handleInputChange('expected_return_date', scheduled.returnDate);
                }
                if (scheduled.notes) {
                  handleInputChange('notes', scheduled.notes);
                }
                // Switch back to basic info tab
                setActiveTab(0);
                setUseScheduling(true);
              }}
              showCalendarView={true}
              allowRecurring={true}
              maxFutureMonths={6}
            />
          </Box>
        )}

        {/* API Error Display */}
        {submissionError && (
          <Alert 
            severity="error" 
            icon={<ErrorIcon />}
            action={
              <IconButton
                aria-label="close"
                color="inherit"
                size="small"
                onClick={() => setSubmissionError('')}
              >
                <CloseIcon fontSize="inherit" />
              </IconButton>
            }
            sx={{ mb: 2 }}
          >
            <AlertTitle>할당 처리 오류</AlertTitle>
            <Typography variant="body2">
              {submissionError}
            </Typography>
          </Alert>
        )}

        {/* Form Validation Summary */}
        {Object.keys(errors).length > 0 && (
          <Alert severity="error" icon={<WarningIcon />}>
            <Typography variant="body2">
              입력 정보를 확인해주세요. {Object.keys(errors).length}개의 오류가 있습니다.
            </Typography>
          </Alert>
        )}
      </Box>
    </FormModal>
  );
}

// ============================================================================
// EXPORTS
// ============================================================================

export default AssignmentFormModal;