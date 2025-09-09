import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  Divider
} from '@mui/material';
import {
  Undo as UndoIcon,
  Assignment as AssignmentIcon,
  Person as PersonIcon,
  DateRange as DateRangeIcon
} from '@mui/icons-material';

// Import types and services
import {
  SoftwareWithAssignments,
  SoftwareAssignment,
  SoftwareReturnData,
  formatSoftwareDisplayName
} from '@/types/software';
import { SoftwareService } from '@/services/software.service';

interface SoftwareReturnModalProps {
  open: boolean;
  onClose: () => void;
  assignment: SoftwareAssignment | null;
  software: SoftwareWithAssignments | null;
  onSuccess?: () => void;
}

interface ModalState {
  returnDate: string;
  returnNotes: string;
  submitting: boolean;
  error: string | null;
}

export function SoftwareReturnModal({
  open,
  onClose,
  assignment,
  software,
  onSuccess
}: SoftwareReturnModalProps) {
  const [state, setState] = useState<ModalState>({
    returnDate: new Date().toISOString().split('T')[0],
    returnNotes: '',
    submitting: false,
    error: null
  });

  // Reset form when modal opens
  useEffect(() => {
    if (open) {
      resetForm();
    }
  }, [open]);

  const resetForm = () => {
    setState(prev => ({
      ...prev,
      returnDate: new Date().toISOString().split('T')[0],
      returnNotes: '',
      error: null
    }));
  };

  const handleReturnDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setState(prev => ({
      ...prev,
      returnDate: event.target.value,
      error: null
    }));
  };

  const handleReturnNotesChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setState(prev => ({
      ...prev,
      returnNotes: event.target.value,
      error: null
    }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    if (!assignment || !software) {
      setState(prev => ({
        ...prev,
        error: '할당 정보를 찾을 수 없습니다.'
      }));
      return;
    }

    // Validate return date
    const returnDate = new Date(state.returnDate);
    const assignedDate = new Date(assignment.assigned_date);
    
    if (returnDate < assignedDate) {
      setState(prev => ({
        ...prev,
        error: '반납일은 할당일보다 이후여야 합니다.'
      }));
      return;
    }

    if (returnDate > new Date()) {
      setState(prev => ({
        ...prev,
        error: '반납일은 오늘 날짜를 초과할 수 없습니다.'
      }));
      return;
    }

    try {
      setState(prev => ({ ...prev, submitting: true, error: null }));

      const returnData: SoftwareReturnData = {
        assignment_id: assignment.id,
        return_date: state.returnDate,
        return_notes: state.returnNotes.trim() || undefined
      };

      await SoftwareService.returnSoftware(returnData);

      // Success - close modal and notify parent
      onClose();
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Failed to return software:', error);
      setState(prev => ({
        ...prev,
        submitting: false,
        error: error instanceof Error ? error.message : '소프트웨어 반납에 실패했습니다.'
      }));
    }
  };

  const handleClose = () => {
    if (!state.submitting) {
      resetForm();
      onClose();
    }
  };

  if (!assignment || !software) return null;

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
          <UndoIcon color="primary" />
          <Box>
            <Typography variant="h6">
              소프트웨어 반납
            </Typography>
            <Typography variant="body2" color="text.secondary">
              라이선스를 반납하고 사용 가능 수량을 늘립니다
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

        {/* Assignment Summary */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="subtitle1" gutterBottom>
              반납 정보 확인
            </Typography>
            
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <AssignmentIcon color="action" fontSize="small" />
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    소프트웨어
                  </Typography>
                  <Typography variant="body1" fontWeight="medium">
                    {formatSoftwareDisplayName(software)}
                  </Typography>
                </Box>
              </Box>

              <Divider />

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <PersonIcon color="action" fontSize="small" />
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    사용자
                  </Typography>
                  <Typography variant="body1" fontWeight="medium">
                    {assignment.employee_name}
                  </Typography>
                </Box>
              </Box>

              <Divider />

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <DateRangeIcon color="action" fontSize="small" />
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    할당일
                  </Typography>
                  <Typography variant="body1" fontWeight="medium">
                    {new Date(assignment.assigned_date).toLocaleDateString('ko-KR')}
                  </Typography>
                </Box>
              </Box>

              {assignment.notes && (
                <>
                  <Divider />
                  <Box>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      할당 메모
                    </Typography>
                    <Typography variant="body2">
                      {assignment.notes}
                    </Typography>
                  </Box>
                </>
              )}
            </Box>
          </CardContent>
        </Card>

        {/* Return Date */}
        <TextField
          fullWidth
          label="반납일"
          type="date"
          value={state.returnDate}
          onChange={handleReturnDateChange}
          disabled={state.submitting}
          required
          sx={{ mb: 2 }}
          InputProps={{
            inputProps: {
              min: assignment.assigned_date,
              max: new Date().toISOString().split('T')[0]
            }
          }}
          helperText="할당일 이후부터 오늘까지 선택 가능합니다"
        />

        {/* Return Notes */}
        <TextField
          fullWidth
          label="반납 메모 (선택사항)"
          multiline
          rows={4}
          value={state.returnNotes}
          onChange={handleReturnNotesChange}
          disabled={state.submitting}
          placeholder="반납 사유나 상태에 대한 메모를 입력하세요..."
          sx={{ mb: 2 }}
        />

        {/* Confirmation Notice */}
        <Alert severity="info" sx={{ mt: 2 }}>
          <Typography variant="body2">
            반납 완료 후 이 라이선스는 다른 직원에게 재할당할 수 있습니다.
            반납 처리는 취소할 수 없으니 신중히 확인해주세요.
          </Typography>
        </Alert>
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
          color="primary"
          disabled={state.submitting}
          startIcon={state.submitting ? <CircularProgress size={16} /> : <UndoIcon />}
        >
          {state.submitting ? '반납 처리 중...' : '반납 완료'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export function useSoftwareReturnModal() {
  const [open, setOpen] = useState(false);
  const [assignment, setAssignment] = useState<SoftwareAssignment | null>(null);
  const [software, setSoftware] = useState<SoftwareWithAssignments | null>(null);

  const openModal = (assignmentData: SoftwareAssignment, softwareData: SoftwareWithAssignments) => {
    setAssignment(assignmentData);
    setSoftware(softwareData);
    setOpen(true);
  };

  const closeModal = () => {
    setOpen(false);
    setAssignment(null);
    setSoftware(null);
  };

  return {
    open,
    assignment,
    software,
    openModal,
    closeModal,
    SoftwareReturnModalComponent: (props: Omit<SoftwareReturnModalProps, 'open' | 'onClose' | 'assignment' | 'software'>) => (
      <SoftwareReturnModal
        open={open}
        onClose={closeModal}
        assignment={assignment}
        software={software}
        {...props}
      />
    )
  };
}