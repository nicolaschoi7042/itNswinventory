'use client';

import React, { useState, useEffect } from 'react';
import { Alert, Box, Grid } from '@mui/material';
import { FormModal } from './FormModal';
import { FormInput } from '@/components/forms/FormInput';
import { FormSelect } from '@/components/forms/FormSelect';
import { 
  Hardware, 
  CreateHardwareData, 
  UpdateHardwareData, 
  HARDWARE_TYPES,
  HARDWARE_MANUFACTURERS,
  HARDWARE_STATUSES 
} from '@/types/hardware';

interface HardwareFormData {
  type: string;
  manufacturer: string;
  model: string;
  serial_number: string;
  purchase_date: string;
  price: string;
  status: string;
  notes: string;
}

interface HardwareFormModalProps {
  open: boolean;
  onClose: () => void;
  hardware?: Hardware | null;
  onSubmit: (data: CreateHardwareData | UpdateHardwareData) => Promise<void>;
  loading?: boolean;
}

export function HardwareFormModal({
  open,
  onClose,
  hardware,
  onSubmit,
  loading = false,
}: HardwareFormModalProps) {
  const isEditing = !!hardware;
  const [formData, setFormData] = useState<HardwareFormData>({
    type: '',
    manufacturer: '',
    model: '',
    serial_number: '',
    purchase_date: '',
    price: '',
    status: '대기중',
    notes: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Initialize form data when hardware changes or modal opens
  useEffect(() => {
    if (open) {
      if (hardware) {
        // Edit mode - populate with existing data
        setFormData({
          type: hardware.type || '',
          manufacturer: hardware.manufacturer || '',
          model: hardware.model || '',
          serial_number: hardware.serial_number || '',
          purchase_date: hardware.purchase_date || '',
          price: hardware.price ? hardware.price.toString() : '',
          status: hardware.status || '대기중',
          notes: hardware.notes || '',
        });
      } else {
        // Create mode - reset to defaults
        setFormData({
          type: '',
          manufacturer: '',
          model: '',
          serial_number: '',
          purchase_date: '',
          price: '',
          status: '대기중',
          notes: '',
        });
      }
      setErrors({});
    }
  }, [open, hardware]);

  // Form validation
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Required fields
    if (!formData.type.trim()) {
      newErrors.type = '하드웨어 유형은 필수 선택 항목입니다.';
    }

    if (!formData.manufacturer.trim()) {
      newErrors.manufacturer = '제조사는 필수 입력 항목입니다.';
    }

    if (!formData.model.trim()) {
      newErrors.model = '모델명은 필수 입력 항목입니다.';
    }

    if (!formData.serial_number.trim()) {
      newErrors.serial_number = '시리얼 번호는 필수 입력 항목입니다.';
    } else if (formData.serial_number.length < 3) {
      newErrors.serial_number = '시리얼 번호는 최소 3자 이상이어야 합니다.';
    } else if (formData.serial_number.length > 50) {
      newErrors.serial_number = '시리얼 번호는 50자를 초과할 수 없습니다.';
    }

    // Price validation (optional but if provided must be valid)
    if (formData.price) {
      const price = parseFloat(formData.price);
      if (isNaN(price)) {
        newErrors.price = '올바른 숫자를 입력해주세요.';
      } else if (price < 0) {
        newErrors.price = '가격은 0 이상이어야 합니다.';
      } else if (price > 999999999) {
        newErrors.price = '가격이 너무 큽니다.';
      }
    }

    // Date validation (optional but if provided must be valid)
    if (formData.purchase_date) {
      const purchaseDate = new Date(formData.purchase_date);
      const today = new Date();
      if (isNaN(purchaseDate.getTime())) {
        newErrors.purchase_date = '올바른 날짜를 입력해주세요.';
      } else if (purchaseDate > today) {
        newErrors.purchase_date = '구매일자는 오늘 날짜보다 이후일 수 없습니다.';
      }
    }

    // Status validation
    if (!formData.status) {
      newErrors.status = '상태를 선택해주세요.';
    } else if (!HARDWARE_STATUSES.includes(formData.status as any)) {
      newErrors.status = '올바른 상태를 선택해주세요.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      const submitData: CreateHardwareData | UpdateHardwareData = {
        type: formData.type,
        manufacturer: formData.manufacturer,
        model: formData.model,
        serial_number: formData.serial_number,
        purchase_date: formData.purchase_date || undefined,
        price: formData.price ? parseFloat(formData.price) : undefined,
        notes: formData.notes || undefined,
      };

      // For updates, include status
      if (isEditing) {
        (submitData as UpdateHardwareData).status = formData.status as any;
      }

      await onSubmit(submitData);
      onClose();
    } catch (error) {
      console.error('Form submission error:', error);
      // Error handling is done by the parent component
    }
  };

  // Handle input changes
  const handleInputChange = (field: keyof HardwareFormData) => (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const value = event.target.value;
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handleSelectChange = (field: keyof HardwareFormData) => (value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Clear error when user makes selection
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  return (
    <FormModal
      open={open}
      onClose={onClose}
      title={isEditing ? '하드웨어 정보 수정' : '새 하드웨어 등록'}
      onSubmit={handleSubmit}
      loading={loading}
      maxWidth="md"
      submitText={isEditing ? '수정' : '등록'}
    >
      <Box sx={{ mt: 2 }}>
        <Grid container spacing={3}>
          {/* Basic Information */}
          <Grid item xs={12}>
            <Alert severity="info" sx={{ mb: 2 }}>
              {isEditing 
                ? '하드웨어 정보를 수정합니다. 필수 항목은 반드시 입력해주세요.'
                : '새로운 하드웨어를 등록합니다. 필수 항목은 반드시 입력해주세요.'
              }
            </Alert>
          </Grid>

          {/* Hardware Type */}
          <Grid item xs={12} sm={6}>
            <FormSelect
              label="하드웨어 유형"
              value={formData.type}
              onChange={handleSelectChange('type')}
              options={[
                { value: '', label: '선택하세요' },
                ...HARDWARE_TYPES.map(type => ({ value: type, label: type }))
              ]}
              required
              error={!!errors.type}
              helperText={errors.type}
              fullWidth
            />
          </Grid>

          {/* Manufacturer */}
          <Grid item xs={12} sm={6}>
            <FormInput
              label="제조사"
              value={formData.manufacturer}
              onChange={handleInputChange('manufacturer')}
              required
              error={!!errors.manufacturer}
              helperText={errors.manufacturer}
              fullWidth
              placeholder="예: Dell, HP, Lenovo"
            />
          </Grid>

          {/* Model */}
          <Grid item xs={12} sm={6}>
            <FormInput
              label="모델명"
              value={formData.model}
              onChange={handleInputChange('model')}
              required
              error={!!errors.model}
              helperText={errors.model}
              fullWidth
              placeholder="예: OptiPlex 7090, ThinkPad X1"
            />
          </Grid>

          {/* Serial Number */}
          <Grid item xs={12} sm={6}>
            <FormInput
              label="시리얼 번호"
              value={formData.serial_number}
              onChange={handleInputChange('serial_number')}
              required
              error={!!errors.serial_number}
              helperText={errors.serial_number}
              fullWidth
              placeholder="제품의 고유 시리얼 번호"
            />
          </Grid>

          {/* Status (Edit mode only) */}
          {isEditing && (
            <Grid item xs={12} sm={6}>
              <FormSelect
                label="상태"
                value={formData.status}
                onChange={handleSelectChange('status')}
                options={HARDWARE_STATUSES.map(status => ({ value: status, label: status }))}
                required
                error={!!errors.status}
                helperText={errors.status}
                fullWidth
              />
            </Grid>
          )}

          {/* Purchase Date */}
          <Grid item xs={12} sm={6}>
            <FormInput
              label="구매일자"
              type="date"
              value={formData.purchase_date}
              onChange={handleInputChange('purchase_date')}
              error={!!errors.purchase_date}
              helperText={errors.purchase_date}
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
          </Grid>

          {/* Price */}
          <Grid item xs={12} sm={6}>
            <FormInput
              label="구매가격"
              type="number"
              value={formData.price}
              onChange={handleInputChange('price')}
              error={!!errors.price}
              helperText={errors.price}
              fullWidth
              placeholder="0"
              InputProps={{
                startAdornment: <span style={{ marginRight: '8px' }}>₩</span>,
              }}
            />
          </Grid>

          {/* Notes */}
          <Grid item xs={12}>
            <FormInput
              label="메모"
              value={formData.notes}
              onChange={handleInputChange('notes')}
              multiline
              rows={3}
              fullWidth
              placeholder="추가 정보나 특이사항을 입력하세요"
            />
          </Grid>
        </Grid>
      </Box>
    </FormModal>
  );
}

// Custom hook for managing hardware form modal state
export function useHardwareFormModal() {
  const [open, setOpen] = useState(false);
  const [hardware, setHardware] = useState<Hardware | null>(null);

  const openCreateModal = () => {
    setHardware(null);
    setOpen(true);
  };

  const openEditModal = (hardwareToEdit: Hardware) => {
    setHardware(hardwareToEdit);
    setOpen(true);
  };

  const closeModal = () => {
    setOpen(false);
    setHardware(null);
  };

  return {
    open,
    hardware,
    openCreateModal,
    openEditModal,
    closeModal,
  };
}