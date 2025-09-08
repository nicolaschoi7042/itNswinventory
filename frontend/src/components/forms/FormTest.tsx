import { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  CardHeader,
  Divider,
  Alert,
  Stack,
  Button,
  Chip,
} from '@mui/material';
import {
  CheckCircle as CheckIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
} from '@mui/icons-material';

import { FormInput } from './FormInput';
import { FormSelect } from './FormSelect';
import { FormButton } from './FormButton';
import { FormGroup } from './FormGroup';
import { FormTextArea } from './FormTextArea';

interface ValidationResult {
  field: string;
  isValid: boolean;
  message: string;
}

interface FormData {
  employee: {
    name: string;
    email: string;
    department: string;
    position: string;
    phone: string;
    notes: string;
  };
  hardware: {
    type: string;
    manufacturer: string;
    model: string;
    serialNumber: string;
    status: string;
    location: string;
  };
  assignment: {
    employeeId: string;
    assetId: string;
    assignDate: string;
    notes: string;
  };
}

export function FormTest() {
  const [formData, setFormData] = useState<FormData>({
    employee: {
      name: '',
      email: '',
      department: '',
      position: '',
      phone: '',
      notes: '',
    },
    hardware: {
      type: '',
      manufacturer: '',
      model: '',
      serialNumber: '',
      status: '',
      location: '',
    },
    assignment: {
      employeeId: '',
      assetId: '',
      assignDate: '',
      notes: '',
    },
  });

  const [validationResults, setValidationResults] = useState<ValidationResult[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentForm, setCurrentForm] = useState<'employee' | 'hardware' | 'assignment'>('employee');

  const departmentOptions = [
    { value: 'it', label: 'IT팀' },
    { value: 'dev', label: '개발팀' },
    { value: 'design', label: '디자인팀' },
    { value: 'marketing', label: '마케팅팀' },
    { value: 'sales', label: '영업팀' },
  ];

  const positionOptions = [
    { value: 'intern', label: '인턴' },
    { value: 'junior', label: '주임' },
    { value: 'associate', label: '대리' },
    { value: 'manager', label: '과장' },
    { value: 'director', label: '차장' },
    { value: 'vp', label: '부장' },
  ];

  const hardwareTypeOptions = [
    { value: 'desktop', label: '데스크톱' },
    { value: 'laptop', label: '노트북' },
    { value: 'monitor', label: '모니터' },
    { value: 'printer', label: '프린터' },
    { value: 'server', label: '서버' },
    { value: 'other', label: '기타' },
  ];

  const statusOptions = [
    { value: 'available', label: '사용 가능' },
    { value: 'in-use', label: '사용 중' },
    { value: 'maintenance', label: '수리 중' },
    { value: 'retired', label: '폐기' },
  ];

  const validateForm = (formType: keyof FormData): ValidationResult[] => {
    const results: ValidationResult[] = [];
    const data = formData[formType];

    switch (formType) {
      case 'employee':
        // Name validation
        results.push({
          field: 'name',
          isValid: data.name.length >= 2 && data.name.length <= 50,
          message: data.name.length < 2 ? '이름은 2글자 이상이어야 합니다.' : 
                   data.name.length > 50 ? '이름은 50글자 이하여야 합니다.' : '유효한 이름입니다.',
        });

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        results.push({
          field: 'email',
          isValid: emailRegex.test(data.email),
          message: emailRegex.test(data.email) ? '유효한 이메일 주소입니다.' : '올바른 이메일 형식이 아닙니다.',
        });

        // Department validation
        results.push({
          field: 'department',
          isValid: data.department !== '',
          message: data.department !== '' ? '부서가 선택되었습니다.' : '부서를 선택해주세요.',
        });

        // Position validation
        results.push({
          field: 'position',
          isValid: data.position !== '',
          message: data.position !== '' ? '직급이 선택되었습니다.' : '직급을 선택해주세요.',
        });

        // Phone validation
        const phoneRegex = /^01[0-9]-\d{4}-\d{4}$/;
        results.push({
          field: 'phone',
          isValid: phoneRegex.test(data.phone) || data.phone === '',
          message: data.phone === '' ? '전화번호는 선택사항입니다.' :
                   phoneRegex.test(data.phone) ? '올바른 전화번호 형식입니다.' : '전화번호 형식이 올바르지 않습니다. (예: 010-1234-5678)',
        });
        break;

      case 'hardware':
        // Type validation
        results.push({
          field: 'type',
          isValid: data.type !== '',
          message: data.type !== '' ? '자산 유형이 선택되었습니다.' : '자산 유형을 선택해주세요.',
        });

        // Manufacturer validation
        results.push({
          field: 'manufacturer',
          isValid: data.manufacturer.length >= 2,
          message: data.manufacturer.length >= 2 ? '유효한 제조사명입니다.' : '제조사명을 입력해주세요.',
        });

        // Model validation
        results.push({
          field: 'model',
          isValid: data.model.length >= 2,
          message: data.model.length >= 2 ? '유효한 모델명입니다.' : '모델명을 입력해주세요.',
        });

        // Serial Number validation
        results.push({
          field: 'serialNumber',
          isValid: data.serialNumber.length >= 5,
          message: data.serialNumber.length >= 5 ? '유효한 시리얼 번호입니다.' : '시리얼 번호는 5글자 이상이어야 합니다.',
        });

        // Status validation
        results.push({
          field: 'status',
          isValid: data.status !== '',
          message: data.status !== '' ? '상태가 선택되었습니다.' : '상태를 선택해주세요.',
        });
        break;

      case 'assignment':
        // Employee ID validation
        results.push({
          field: 'employeeId',
          isValid: data.employeeId !== '',
          message: data.employeeId !== '' ? '직원이 선택되었습니다.' : '직원을 선택해주세요.',
        });

        // Asset ID validation
        results.push({
          field: 'assetId',
          isValid: data.assetId !== '',
          message: data.assetId !== '' ? '자산이 선택되었습니다.' : '자산을 선택해주세요.',
        });

        // Assign Date validation
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        results.push({
          field: 'assignDate',
          isValid: dateRegex.test(data.assignDate),
          message: dateRegex.test(data.assignDate) ? '유효한 날짜입니다.' : '올바른 날짜 형식이 아닙니다. (YYYY-MM-DD)',
        });
        break;
    }

    return results;
  };

  const handleInputChange = (field: string, value: string) => {
    const [formType, fieldName] = field.split('.') as [keyof FormData, string];
    setFormData(prev => ({
      ...prev,
      [formType]: {
        ...prev[formType],
        [fieldName]: value,
      },
    }));
  };

  const handleValidate = () => {
    const results = validateForm(currentForm);
    setValidationResults(results);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    const results = validateForm(currentForm);
    setValidationResults(results);

    const isValid = results.every(r => r.isValid);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    if (isValid) {
      console.log('Form submitted successfully:', formData[currentForm]);
      // Reset form after successful submission
      setFormData(prev => ({
        ...prev,
        [currentForm]: Object.keys(prev[currentForm]).reduce((acc, key) => ({
          ...acc,
          [key]: '',
        }), {} as any),
      }));
      setValidationResults([]);
    }
    
    setIsSubmitting(false);
  };

  const getValidationIcon = (isValid: boolean) => {
    return isValid ? <CheckIcon color="success" /> : <ErrorIcon color="error" />;
  };

  const getValidationSeverity = (isValid: boolean) => {
    return isValid ? 'success' : 'error';
  };

  const renderEmployeeForm = () => (
    <Stack spacing={3}>
      <FormGroup title="기본 정보">
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <FormInput
              label="직원명*"
              value={formData.employee.name}
              onChange={(value) => handleInputChange('employee.name', value)}
              placeholder="홍길동"
              required
              error={validationResults.find(r => r.field === 'name')?.isValid === false}
              helperText={validationResults.find(r => r.field === 'name')?.message}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <FormInput
              label="이메일*"
              type="email"
              value={formData.employee.email}
              onChange={(value) => handleInputChange('employee.email', value)}
              placeholder="hong@company.com"
              required
              error={validationResults.find(r => r.field === 'email')?.isValid === false}
              helperText={validationResults.find(r => r.field === 'email')?.message}
            />
          </Grid>
        </Grid>
      </FormGroup>

      <FormGroup title="조직 정보">
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <FormSelect
              label="부서*"
              value={formData.employee.department}
              onChange={(value) => handleInputChange('employee.department', value)}
              options={departmentOptions}
              required
              error={validationResults.find(r => r.field === 'department')?.isValid === false}
              helperText={validationResults.find(r => r.field === 'department')?.message}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <FormSelect
              label="직급*"
              value={formData.employee.position}
              onChange={(value) => handleInputChange('employee.position', value)}
              options={positionOptions}
              required
              error={validationResults.find(r => r.field === 'position')?.isValid === false}
              helperText={validationResults.find(r => r.field === 'position')?.message}
            />
          </Grid>
        </Grid>
      </FormGroup>

      <FormGroup title="연락처 정보">
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <FormInput
              label="전화번호"
              value={formData.employee.phone}
              onChange={(value) => handleInputChange('employee.phone', value)}
              placeholder="010-1234-5678"
              error={validationResults.find(r => r.field === 'phone')?.isValid === false}
              helperText={validationResults.find(r => r.field === 'phone')?.message}
            />
          </Grid>
        </Grid>
        <FormTextArea
          label="메모"
          value={formData.employee.notes}
          onChange={(value) => handleInputChange('employee.notes', value)}
          placeholder="추가 정보나 특이사항을 입력하세요"
          rows={3}
        />
      </FormGroup>
    </Stack>
  );

  const renderHardwareForm = () => (
    <Stack spacing={3}>
      <FormGroup title="자산 기본 정보">
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <FormSelect
              label="자산 유형*"
              value={formData.hardware.type}
              onChange={(value) => handleInputChange('hardware.type', value)}
              options={hardwareTypeOptions}
              required
              error={validationResults.find(r => r.field === 'type')?.isValid === false}
              helperText={validationResults.find(r => r.field === 'type')?.message}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <FormSelect
              label="상태*"
              value={formData.hardware.status}
              onChange={(value) => handleInputChange('hardware.status', value)}
              options={statusOptions}
              required
              error={validationResults.find(r => r.field === 'status')?.isValid === false}
              helperText={validationResults.find(r => r.field === 'status')?.message}
            />
          </Grid>
        </Grid>
      </FormGroup>

      <FormGroup title="제품 정보">
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <FormInput
              label="제조사*"
              value={formData.hardware.manufacturer}
              onChange={(value) => handleInputChange('hardware.manufacturer', value)}
              placeholder="Dell, HP, Lenovo 등"
              required
              error={validationResults.find(r => r.field === 'manufacturer')?.isValid === false}
              helperText={validationResults.find(r => r.field === 'manufacturer')?.message}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <FormInput
              label="모델명*"
              value={formData.hardware.model}
              onChange={(value) => handleInputChange('hardware.model', value)}
              placeholder="OptiPlex 7090"
              required
              error={validationResults.find(r => r.field === 'model')?.isValid === false}
              helperText={validationResults.find(r => r.field === 'model')?.message}
            />
          </Grid>
        </Grid>
        <FormInput
          label="시리얼 번호*"
          value={formData.hardware.serialNumber}
          onChange={(value) => handleInputChange('hardware.serialNumber', value)}
          placeholder="ABC12345678"
          required
          error={validationResults.find(r => r.field === 'serialNumber')?.isValid === false}
          helperText={validationResults.find(r => r.field === 'serialNumber')?.message}
        />
      </FormGroup>

      <FormGroup title="위치 정보">
        <FormInput
          label="위치"
          value={formData.hardware.location}
          onChange={(value) => handleInputChange('hardware.location', value)}
          placeholder="3층 개발팀"
        />
      </FormGroup>
    </Stack>
  );

  const renderAssignmentForm = () => (
    <Stack spacing={3}>
      <FormGroup title="할당 정보">
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <FormSelect
              label="직원*"
              value={formData.assignment.employeeId}
              onChange={(value) => handleInputChange('assignment.employeeId', value)}
              options={[
                { value: 'EMP001', label: '김개발 (개발팀)' },
                { value: 'EMP002', label: '이디자인 (디자인팀)' },
                { value: 'EMP003', label: '박기획 (기획팀)' },
              ]}
              required
              error={validationResults.find(r => r.field === 'employeeId')?.isValid === false}
              helperText={validationResults.find(r => r.field === 'employeeId')?.message}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <FormSelect
              label="자산*"
              value={formData.assignment.assetId}
              onChange={(value) => handleInputChange('assignment.assetId', value)}
              options={[
                { value: 'HW001', label: 'Dell OptiPlex (데스크톱)' },
                { value: 'HW002', label: 'MacBook Pro (노트북)' },
                { value: 'HW003', label: 'HP Monitor (모니터)' },
              ]}
              required
              error={validationResults.find(r => r.field === 'assetId')?.isValid === false}
              helperText={validationResults.find(r => r.field === 'assetId')?.message}
            />
          </Grid>
        </Grid>
      </FormGroup>

      <FormGroup title="할당 세부사항">
        <FormInput
          label="할당 날짜*"
          type="date"
          value={formData.assignment.assignDate}
          onChange={(value) => handleInputChange('assignment.assignDate', value)}
          required
          error={validationResults.find(r => r.field === 'assignDate')?.isValid === false}
          helperText={validationResults.find(r => r.field === 'assignDate')?.message}
        />
        <FormTextArea
          label="할당 메모"
          value={formData.assignment.notes}
          onChange={(value) => handleInputChange('assignment.notes', value)}
          placeholder="할당 관련 특이사항이나 메모를 입력하세요"
          rows={3}
        />
      </FormGroup>
    </Stack>
  );

  return (
    <Box>
      <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
        폼 컴포넌트 종합 테스트
      </Typography>

      {/* Form Type Selector */}
      <Card sx={{ mb: 3 }}>
        <CardHeader title="테스트할 폼 선택" />
        <CardContent>
          <Stack direction="row" spacing={1}>
            {(['employee', 'hardware', 'assignment'] as const).map((type) => (
              <Chip
                key={type}
                label={type === 'employee' ? '직원 등록' : type === 'hardware' ? '하드웨어 등록' : '자산 할당'}
                onClick={() => setCurrentForm(type)}
                color={currentForm === type ? 'primary' : 'default'}
                variant={currentForm === type ? 'filled' : 'outlined'}
                clickable
              />
            ))}
          </Stack>
        </CardContent>
      </Card>

      {/* Form Content */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              {currentForm === 'employee' ? '직원 등록 폼' : 
               currentForm === 'hardware' ? '하드웨어 자산 등록 폼' : 
               '자산 할당 폼'}
            </Typography>
            <Divider sx={{ mb: 3 }} />
            
            {currentForm === 'employee' && renderEmployeeForm()}
            {currentForm === 'hardware' && renderHardwareForm()}
            {currentForm === 'assignment' && renderAssignmentForm()}

            <Divider sx={{ my: 3 }} />
            
            <Stack direction="row" spacing={2}>
              <FormButton
                variant="outlined"
                onClick={handleValidate}
                disabled={isSubmitting}
              >
                유효성 검사
              </FormButton>
              <FormButton
                variant="contained"
                color="primary"
                onClick={handleSubmit}
                loading={isSubmitting}
                disabled={isSubmitting}
              >
                {isSubmitting ? '저장 중...' : '저장'}
              </FormButton>
            </Stack>
          </Paper>
        </Grid>

        {/* Validation Results */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardHeader title="검증 결과" />
            <CardContent>
              {validationResults.length === 0 ? (
                <Alert severity="info">
                  <Typography variant="body2">
                    '유효성 검사' 버튼을 클릭하여 입력된 데이터를 검증하세요.
                  </Typography>
                </Alert>
              ) : (
                <Stack spacing={2}>
                  {validationResults.map((result, index) => (
                    <Alert
                      key={index}
                      severity={getValidationSeverity(result.isValid)}
                      icon={getValidationIcon(result.isValid)}
                    >
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {result.field}
                      </Typography>
                      <Typography variant="caption">
                        {result.message}
                      </Typography>
                    </Alert>
                  ))}
                  
                  <Divider />
                  
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                      전체 검증 결과
                    </Typography>
                    {validationResults.every(r => r.isValid) ? (
                      <Alert severity="success">
                        모든 필드가 올바르게 입력되었습니다.
                      </Alert>
                    ) : (
                      <Alert severity="warning">
                        {validationResults.filter(r => !r.isValid).length}개 필드에 오류가 있습니다.
                      </Alert>
                    )}
                  </Box>
                </Stack>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}

export default FormTest;