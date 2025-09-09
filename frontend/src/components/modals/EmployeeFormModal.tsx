'use client';

import React, { useState, useEffect } from 'react';
import { Alert, Box } from '@mui/material';
import { FormModal } from './FormModal';
import { FormInput } from '@/components/forms/FormInput';
import { FormSelect } from '@/components/forms/FormSelect';
import { Employee, CreateEmployeeData, UpdateEmployeeData, DEPARTMENTS } from '@/types/employee';

interface EmployeeFormData {
  name: string;
  department: string;
  position: string;
  hire_date: string;
  email: string;
  phone: string;
}

interface EmployeeFormModalProps {
  open: boolean;
  onClose: () => void;
  employee?: Employee | null;
  onSubmit: (data: CreateEmployeeData | UpdateEmployeeData) => Promise<void>;
  loading?: boolean;
}

export function EmployeeFormModal({
  open,
  onClose,
  employee,
  onSubmit,
  loading = false,
}: EmployeeFormModalProps) {
  const isEditing = !!employee;
  const [formData, setFormData] = useState<EmployeeFormData>({
    name: '',
    department: '',
    position: '',
    hire_date: '',
    email: '',
    phone: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Initialize form data when employee changes or modal opens
  useEffect(() => {
    if (open) {
      if (employee) {
        // Edit mode - populate with existing data
        setFormData({
          name: employee.name || '',
          department: employee.department || '',
          position: employee.position || '',
          hire_date: employee.hire_date ? employee.hire_date.split('T')[0] : '', // Format date for input
          email: employee.email || '',
          phone: employee.phone || '',
        });
      } else {
        // Create mode - reset to empty
        setFormData({
          name: '',
          department: '',
          position: '',
          hire_date: '',
          email: '',
          phone: '',
        });
      }
      setErrors({});
    }
  }, [open, employee]);

  // Form validation
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Required fields
    if (!formData.name.trim()) {
      newErrors.name = '이름은 필수 입력 항목입니다.';
    }

    if (!formData.department) {
      newErrors.department = '부서는 필수 선택 항목입니다.';
    }

    // Email validation (optional but if provided must be valid)
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = '올바른 이메일 형식을 입력해주세요.';
    }

    // Phone validation (optional but if provided must be valid)
    if (formData.phone && !/^[0-9\-\s\+\(\)]+$/.test(formData.phone)) {
      newErrors.phone = '올바른 전화번호 형식을 입력해주세요.';
    }

    // Date validation (optional but if provided must be valid)
    if (formData.hire_date) {
      const hireDate = new Date(formData.hire_date);
      const today = new Date();
      if (hireDate > today) {
        newErrors.hire_date = '입사일은 오늘 이후의 날짜일 수 없습니다.';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle input changes
  const handleInputChange = (field: keyof EmployeeFormData) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = event.target.value;
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  // Handle select changes
  const handleSelectChange = (field: keyof EmployeeFormData) => (
    event: any // SelectChangeEvent type is complex, using any for simplicity
  ) => {
    const value = event.target.value as string;
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user makes selection
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  // Handle form submission
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      const submitData = {
        name: formData.name.trim(),
        department: formData.department,
        position: formData.position.trim() || undefined,
        hire_date: formData.hire_date || undefined,
        email: formData.email.trim() || undefined,
        phone: formData.phone.trim() || undefined,
      };

      await onSubmit(submitData);
      onClose();
    } catch (error) {
      console.error('Failed to submit employee form:', error);
      // Error handling is managed by parent component
    }
  };

  // Department options
  const departmentOptions = [
    { value: '', label: '선택하세요' },
    ...DEPARTMENTS.map(dept => ({ value: dept, label: dept }))
  ];

  return (
    <FormModal
      open={open}
      onClose={onClose}
      title={isEditing ? '임직원 정보 수정' : '신규 임직원 등록'}
      subtitle={isEditing ? `${employee?.name}의 정보를 수정합니다.` : '새로운 임직원 정보를 입력해주세요.'}
      onSubmit={handleSubmit}
      submitLabel={isEditing ? '수정' : '등록'}
      cancelLabel="취소"
      loading={loading}
      maxWidth="sm"
      disableBackdropClick={loading}
      disableEscapeKeyDown={loading}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {/* Error display */}
        {Object.keys(errors).length > 0 && (
          <Alert severity="error" sx={{ mb: 2 }}>
            입력 정보를 확인해주세요.
          </Alert>
        )}

        {/* Name Field - Required */}
        <FormInput
          label="이름 *"
          name="name"
          value={formData.name}
          onChange={handleInputChange('name')}
          error={!!errors.name}
          helperText={errors.name}
          placeholder="홍길동"
          autoFocus
          disabled={loading}
          required
        />

        {/* Department Field - Required */}
        <FormSelect
          label="부서 *"
          name="department"
          value={formData.department}
          onChange={handleSelectChange('department')}
          options={departmentOptions}
          error={!!errors.department}
          helperText={errors.department}
          disabled={loading}
          required
        />

        {/* Position Field - Optional */}
        <FormInput
          label="직책"
          name="position"
          value={formData.position}
          onChange={handleInputChange('position')}
          error={!!errors.position}
          helperText={errors.position}
          placeholder="대리, 과장, 부장 등"
          disabled={loading}
        />

        {/* Hire Date Field - Optional */}
        <FormInput
          label="입사일"
          name="hire_date"
          type="date"
          value={formData.hire_date}
          onChange={handleInputChange('hire_date')}
          error={!!errors.hire_date}
          helperText={errors.hire_date}
          disabled={loading}
          InputLabelProps={{ shrink: true }}
        />

        {/* Email Field - Optional */}
        <FormInput
          label="이메일"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleInputChange('email')}
          error={!!errors.email}
          helperText={errors.email}
          placeholder="example@company.com"
          disabled={loading}
        />

        {/* Phone Field - Optional */}
        <FormInput
          label="연락처"
          name="phone"
          type="tel"
          value={formData.phone}
          onChange={handleInputChange('phone')}
          error={!!errors.phone}
          helperText={errors.phone}
          placeholder="010-1234-5678"
          disabled={loading}
        />

        {/* Information note */}
        <Alert severity="info" sx={{ mt: 2 }}>
          <strong>*</strong> 표시된 항목은 필수 입력 항목입니다.
        </Alert>
      </Box>
    </FormModal>
  );
}

// Hook for managing employee form modal state
export function useEmployeeFormModal() {
  const [open, setOpen] = useState(false);
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(false);

  const openCreateModal = () => {
    setEmployee(null);
    setOpen(true);
  };

  const openEditModal = (employeeToEdit: Employee) => {
    setEmployee(employeeToEdit);
    setOpen(true);
  };

  const closeModal = () => {
    if (!loading) {
      setOpen(false);
      setEmployee(null);
    }
  };

  const setModalLoading = (isLoading: boolean) => {
    setLoading(isLoading);
  };

  return {
    open,
    employee,
    loading,
    openCreateModal,
    openEditModal,
    closeModal,
    setModalLoading,
  };
}