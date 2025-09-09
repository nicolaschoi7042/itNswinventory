import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Typography,
  Alert,
  CircularProgress,
  Autocomplete,
  Chip,
  LinearProgress
} from '@mui/material';
import { Assignment as AssignmentIcon } from '@mui/icons-material';

// Import types and services
import {
  SoftwareWithAssignments,
  SoftwareAssignmentData,
  calculateLicenseUtilization
} from '@/types/software';
import type { Employee } from '@/types/employee';
import { SoftwareService } from '@/services/software.service';
import { EmployeeService } from '@/services/employee.service';

interface SoftwareAssignmentModalProps {
  open: boolean;
  onClose: () => void;
  software: SoftwareWithAssignments | null;
  onSuccess?: () => void;
}

interface ModalState {
  employees: Employee[];
  selectedEmployee: Employee | null;
  notes: string;
  loading: boolean;
  submitting: boolean;
  error: string | null;
}

export function SoftwareAssignmentModal({
  open,
  onClose,
  software,
  onSuccess
}: SoftwareAssignmentModalProps) {
  const [state, setState] = useState<ModalState>({
    employees: [],
    selectedEmployee: null,
    notes: '',
    loading: true,
    submitting: false,
    error: null
  });

  // Load employees when modal opens
  useEffect(() => {
    if (open) {
      loadEmployees();
      resetForm();
    }
  }, [open]);

  const loadEmployees = async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      const employeesData = await EmployeeService.getEmployees();
      setState(prev => ({
        ...prev,
        employees: employeesData,
        loading: false
      }));
    } catch (error) {
      console.error('Failed to load employees:', error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : '직원 목록을 불러오는데 실패했습니다.'
      }));
    }
  };

  const resetForm = () => {
    setState(prev => ({
      ...prev,
      selectedEmployee: null,
      notes: '',
      error: null
    }));
  };

  const handleEmployeeChange = (event: any, value: Employee | null) => {
    setState(prev => ({
      ...prev,
      selectedEmployee: value,
      error: null
    }));
  };

  const handleNotesChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setState(prev => ({
      ...prev,
      notes: event.target.value,
      error: null
    }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    if (!software || !state.selectedEmployee) {
      setState(prev => ({
        ...prev,
        error: '소프트웨어와 직원을 모두 선택해주세요.'
      }));
      return;
    }

    // Check license availability
    const utilization = calculateLicenseUtilization(software);
    if (utilization.available <= 0) {
      setState(prev => ({
        ...prev,
        error: '사용 가능한 라이선스가 없습니다.'
      }));
      return;
    }

    try {
      setState(prev => ({ ...prev, submitting: true, error: null }));

      const assignmentData: SoftwareAssignmentData = {
        software_id: software.id,
        employee_id: state.selectedEmployee.id,
        notes: state.notes.trim() || undefined
      };

      await SoftwareService.assignSoftware(assignmentData);

      // Success - close modal and notify parent
      onClose();
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Failed to assign software:', error);
      setState(prev => ({
        ...prev,
        submitting: false,
        error: error instanceof Error ? error.message : '소프트웨어 할당에 실패했습니다.'
      }));
    }
  };

  const handleClose = () => {
    if (!state.submitting) {
      resetForm();
      onClose();
    }
  };

  if (!software) return null;

  const utilization = calculateLicenseUtilization(software);

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        component: 'form',
        onSubmit: handleSubmit
      }}
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <AssignmentIcon color="primary" />
          <Box>
            <Typography variant="h6">
              소프트웨어 할당
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {software.name} {software.version && `v${software.version}`}
            </Typography>
          </Box>
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        {state.error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {state.error}
          </Alert>
        )}

        {/* License Availability Info */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" gutterBottom>
            라이선스 현황
          </Typography>
          <Box sx={{ mb: 1 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
              <Typography variant="body2">
                사용률: {utilization.used}/{utilization.total}
              </Typography>
              <Typography variant="body2">
                {utilization.percentage}%
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={utilization.percentage}
              color={utilization.color}
              sx={{ height: 6, borderRadius: 3 }}
            />
          </Box>
          <Typography variant="body2" color="text.secondary">
            사용 가능: {utilization.available}개
          </Typography>
          
          {utilization.available <= 0 && (
            <Alert severity="warning" sx={{ mt: 1 }}>
              사용 가능한 라이선스가 없습니다.
            </Alert>
          )}
        </Box>

        {/* Employee Selection */}
        <FormControl fullWidth sx={{ mb: 2 }}>
          <Autocomplete
            options={state.employees}
            getOptionLabel={(employee) => `${employee.name} (${employee.employee_id})`}
            renderOption={(props, employee) => (
              <Box component="li" {...props}>
                <Box>
                  <Typography variant="body1">
                    {employee.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {employee.employee_id} • {employee.department} • {employee.position}
                  </Typography>
                </Box>
              </Box>
            )}
            value={state.selectedEmployee}
            onChange={handleEmployeeChange}
            loading={state.loading}
            disabled={state.submitting || utilization.available <= 0}
            renderInput={(params) => (
              <TextField
                {...params}
                label="할당할 직원 선택"
                required
                InputProps={{
                  ...params.InputProps,
                  endAdornment: (
                    <>
                      {state.loading && <CircularProgress color="inherit" size={20} />}
                      {params.InputProps.endAdornment}
                    </>
                  ),
                }}
              />
            )}
          />
        </FormControl>

        {/* Notes */}
        <TextField
          fullWidth
          label="할당 메모 (선택사항)"
          multiline
          rows={3}
          value={state.notes}
          onChange={handleNotesChange}
          disabled={state.submitting}
          placeholder="할당 사유나 추가 정보를 입력하세요..."
          sx={{ mb: 2 }}
        />

        {/* Assignment Summary */}
        {state.selectedEmployee && (
          <Box sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
            <Typography variant="subtitle2" gutterBottom>
              할당 정보 확인
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
              <Typography variant="body2">
                <strong>소프트웨어:</strong> {software.name} {software.version && `v${software.version}`}
              </Typography>
              <Typography variant="body2">
                <strong>할당 대상:</strong> {state.selectedEmployee.name} ({state.selectedEmployee.employee_id})
              </Typography>
              <Typography variant="body2">
                <strong>부서:</strong> {state.selectedEmployee.department}
              </Typography>
              {state.notes && (
                <Typography variant="body2">
                  <strong>메모:</strong> {state.notes}
                </Typography>
              )}
            </Box>
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button 
          onClick={handleClose}
          disabled={state.submitting}
        >
          취소
        </Button>
        <Button
          type="submit"
          variant="contained"
          disabled={!state.selectedEmployee || state.submitting || utilization.available <= 0}
          startIcon={state.submitting ? <CircularProgress size={16} /> : <AssignmentIcon />}
        >
          {state.submitting ? '할당 중...' : '할당하기'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export function useSoftwareAssignmentModal() {
  const [open, setOpen] = useState(false);
  const [software, setSoftware] = useState<SoftwareWithAssignments | null>(null);

  const openModal = (softwareData: SoftwareWithAssignments) => {
    setSoftware(softwareData);
    setOpen(true);
  };

  const closeModal = () => {
    setOpen(false);
    setSoftware(null);
  };

  return {
    open,
    software,
    openModal,
    closeModal,
    SoftwareAssignmentModalComponent: (props: Omit<SoftwareAssignmentModalProps, 'open' | 'onClose' | 'software'>) => (
      <SoftwareAssignmentModal
        open={open}
        onClose={closeModal}
        software={software}
        {...props}
      />
    )
  };
}