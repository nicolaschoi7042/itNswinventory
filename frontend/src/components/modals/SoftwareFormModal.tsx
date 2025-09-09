import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Typography,
  Alert,
  InputAdornment,
  Autocomplete
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { ko } from 'date-fns/locale';

// Import types and services
import {
  Software,
  SoftwareWithAssignments,
  CreateSoftwareData,
  UpdateSoftwareData,
  SOFTWARE_TYPES,
  SOFTWARE_LICENSE_TYPES,
  SOFTWARE_MANUFACTURERS,
  SOFTWARE_VALIDATION_RULES
} from '@/types/software';
import { SoftwareService } from '@/services/software.service';

interface SoftwareFormModalProps {
  open: boolean;
  onClose: () => void;
  onSave: () => void;
  software?: SoftwareWithAssignments | null;
  editMode?: boolean;
}

interface FormData {
  name: string;
  manufacturer: string;
  version: string;
  type: string;
  license_type: string;
  total_licenses: number;
  purchase_date: Date | null;
  expiry_date: Date | null;
  price: string;
}

interface FormErrors {
  name?: string;
  manufacturer?: string;
  type?: string;
  license_type?: string;
  total_licenses?: string;
  purchase_date?: string;
  expiry_date?: string;
  price?: string;
}

export function SoftwareFormModal({
  open,
  onClose,
  onSave,
  software,
  editMode = false
}: SoftwareFormModalProps) {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    manufacturer: '',
    version: '',
    type: '',
    license_type: '',
    total_licenses: 1,
    purchase_date: null,
    expiry_date: null,
    price: ''
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Initialize form data when software prop changes
  useEffect(() => {
    if (software && editMode) {
      setFormData({
        name: software.name || '',
        manufacturer: software.manufacturer || '',
        version: software.version || '',
        type: software.type || '',
        license_type: software.license_type || '',
        total_licenses: software.total_licenses || 1,
        purchase_date: software.purchase_date ? new Date(software.purchase_date) : null,
        expiry_date: software.expiry_date ? new Date(software.expiry_date) : null,
        price: software.price ? software.price.toString() : ''
      });
    } else {
      // Reset form for new software
      setFormData({
        name: '',
        manufacturer: '',
        version: '',
        type: '',
        license_type: '',
        total_licenses: 1,
        purchase_date: null,
        expiry_date: null,
        price: ''
      });
    }
    setErrors({});
    setSubmitError(null);
  }, [software, editMode, open]);

  // Validate form field
  const validateField = (name: keyof FormData, value: any): string | undefined => {
    switch (name) {
      case 'name':
        if (!value || value.trim().length < SOFTWARE_VALIDATION_RULES.name.minLength) {
          return `소프트웨어명은 최소 ${SOFTWARE_VALIDATION_RULES.name.minLength}자 이상이어야 합니다.`;
        }
        if (value.length > SOFTWARE_VALIDATION_RULES.name.maxLength) {
          return `소프트웨어명은 최대 ${SOFTWARE_VALIDATION_RULES.name.maxLength}자까지 입력 가능합니다.`;
        }
        break;
      case 'total_licenses':
        const licenseCount = typeof value === 'string' ? parseInt(value, 10) : value;
        if (isNaN(licenseCount) || licenseCount < SOFTWARE_VALIDATION_RULES.total_licenses.min) {
          return `라이선스 수는 최소 ${SOFTWARE_VALIDATION_RULES.total_licenses.min}개 이상이어야 합니다.`;
        }
        if (licenseCount > SOFTWARE_VALIDATION_RULES.total_licenses.max) {
          return `라이선스 수는 최대 ${SOFTWARE_VALIDATION_RULES.total_licenses.max}개까지 입력 가능합니다.`;
        }
        break;
      case 'price':
        if (value && value.trim()) {
          const price = parseFloat(value);
          if (isNaN(price) || price < SOFTWARE_VALIDATION_RULES.price.min) {
            return '올바른 가격을 입력해주세요.';
          }
          if (price > SOFTWARE_VALIDATION_RULES.price.max) {
            return '가격이 너무 큽니다.';
          }
        }
        break;
      case 'expiry_date':
        if (value && formData.purchase_date && value < formData.purchase_date) {
          return '만료일은 구매일보다 이후여야 합니다.';
        }
        break;
    }
    return undefined;
  };

  // Handle form field changes
  const handleFieldChange = (name: keyof FormData, value: any) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
    
    // Validate field
    const error = validateField(name, value);
    if (error) {
      setErrors(prev => ({ ...prev, [name]: error }));
    }
  };

  // Validate entire form
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    
    // Validate required fields
    Object.keys(formData).forEach(key => {
      const fieldName = key as keyof FormData;
      const value = formData[fieldName];
      const error = validateField(fieldName, value);
      if (error) {
        newErrors[fieldName] = error;
      }
    });

    // Check if name is provided (required)
    if (!formData.name.trim()) {
      newErrors.name = '소프트웨어명은 필수입니다.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setSubmitError(null);

    try {
      const submitData: CreateSoftwareData | UpdateSoftwareData = {
        name: formData.name.trim(),
        manufacturer: formData.manufacturer.trim() || undefined,
        version: formData.version.trim() || undefined,
        type: formData.type || undefined,
        license_type: formData.license_type || undefined,
        total_licenses: formData.total_licenses,
        purchase_date: formData.purchase_date ? formData.purchase_date.toISOString().split('T')[0] : undefined,
        expiry_date: formData.expiry_date ? formData.expiry_date.toISOString().split('T')[0] : undefined,
        price: formData.price ? parseFloat(formData.price) : undefined
      };

      // Additional validation using service
      const validation = SoftwareService.validateSoftwareData(submitData);
      if (!validation.isValid) {
        setSubmitError(validation.errors.join('\n'));
        return;
      }

      if (editMode && software) {
        await SoftwareService.updateSoftware(software.id, submitData as UpdateSoftwareData);
      } else {
        await SoftwareService.createSoftware(submitData as CreateSoftwareData);
      }

      onSave();
    } catch (error) {
      console.error('Failed to save software:', error);
      setSubmitError(error instanceof Error ? error.message : '저장에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ko}>
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: { minHeight: '70vh' }
        }}
      >
        <DialogTitle>
          {editMode ? '소프트웨어 수정' : '소프트웨어 등록'}
        </DialogTitle>

        <DialogContent dividers>
          <Box sx={{ mt: 2 }}>
            {submitError && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {submitError.split('\n').map((line, index) => (
                  <div key={index}>{line}</div>
                ))}
              </Alert>
            )}

            <Grid container spacing={3}>
              {/* Basic Information */}
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  기본 정보
                </Typography>
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="소프트웨어명"
                  value={formData.name}
                  onChange={(e) => handleFieldChange('name', e.target.value)}
                  error={!!errors.name}
                  helperText={errors.name}
                  required
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <Autocomplete
                  freeSolo
                  options={SOFTWARE_MANUFACTURERS}
                  value={formData.manufacturer}
                  onChange={(_, value) => handleFieldChange('manufacturer', value || '')}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="제조사"
                      error={!!errors.manufacturer}
                      helperText={errors.manufacturer}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="버전"
                  value={formData.version}
                  onChange={(e) => handleFieldChange('version', e.target.value)}
                  placeholder="예: 2024, v1.0, 23H2"
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>소프트웨어 종류</InputLabel>
                  <Select
                    value={formData.type}
                    onChange={(e) => handleFieldChange('type', e.target.value)}
                    label="소프트웨어 종류"
                  >
                    <MenuItem value="">선택하지 않음</MenuItem>
                    {SOFTWARE_TYPES.map((type) => (
                      <MenuItem key={type} value={type}>
                        {type}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {/* License Information */}
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                  라이선스 정보
                </Typography>
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>라이선스 유형</InputLabel>
                  <Select
                    value={formData.license_type}
                    onChange={(e) => handleFieldChange('license_type', e.target.value)}
                    label="라이선스 유형"
                  >
                    <MenuItem value="">선택하지 않음</MenuItem>
                    {SOFTWARE_LICENSE_TYPES.map((type) => (
                      <MenuItem key={type} value={type}>
                        {type}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="총 라이선스 수"
                  type="number"
                  value={formData.total_licenses}
                  onChange={(e) => handleFieldChange('total_licenses', parseInt(e.target.value, 10) || 1)}
                  error={!!errors.total_licenses}
                  helperText={errors.total_licenses}
                  required
                  inputProps={{
                    min: SOFTWARE_VALIDATION_RULES.total_licenses.min,
                    max: SOFTWARE_VALIDATION_RULES.total_licenses.max
                  }}
                />
              </Grid>

              {/* Purchase Information */}
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                  구매 정보
                </Typography>
              </Grid>

              <Grid item xs={12} md={6}>
                <DatePicker
                  label="구매일"
                  value={formData.purchase_date}
                  onChange={(date) => handleFieldChange('purchase_date', date)}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      error: !!errors.purchase_date,
                      helperText: errors.purchase_date
                    }
                  }}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <DatePicker
                  label="만료일"
                  value={formData.expiry_date}
                  onChange={(date) => handleFieldChange('expiry_date', date)}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      error: !!errors.expiry_date,
                      helperText: errors.expiry_date
                    }
                  }}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="구매 가격"
                  value={formData.price}
                  onChange={(e) => handleFieldChange('price', e.target.value)}
                  error={!!errors.price}
                  helperText={errors.price}
                  InputProps={{
                    startAdornment: <InputAdornment position="start">₩</InputAdornment>,
                  }}
                  placeholder="예: 1500000"
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>

        <DialogActions sx={{ p: 2 }}>
          <Button onClick={onClose} disabled={loading}>
            취소
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={loading}
          >
            {loading ? '저장 중...' : editMode ? '수정' : '등록'}
          </Button>
        </DialogActions>
      </Dialog>
    </LocalizationProvider>
  );
}