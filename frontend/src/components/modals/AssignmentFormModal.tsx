/**
 * Assignment Form Modal Component
 *
 * Modal for creating and editing asset assignments
 */

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
} from '@mui/material';

// ============================================================================
// TYPES AND INTERFACES
// ============================================================================

export interface AssignmentFormModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: AssignmentFormData) => Promise<void>;
  initialData?: Partial<AssignmentFormData>;
  loading?: boolean;
}

export interface AssignmentFormData {
  employeeId: string;
  assetId: string;
  assetType: 'hardware' | 'software';
  assignedDate: string;
  expectedReturnDate?: string;
  notes?: string;
  priority: 'low' | 'medium' | 'high';
  status: 'active' | 'pending' | 'returned';
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export const AssignmentFormModal: React.FC<AssignmentFormModalProps> = ({
  open,
  onClose,
  onSubmit,
  initialData,
  loading = false,
}) => {
  // ============================================================================
  // STATE MANAGEMENT
  // ============================================================================

  const [formData, setFormData] = useState<AssignmentFormData>({
    employeeId: '',
    assetId: '',
    assetType: 'hardware',
    assignedDate: new Date().toISOString().split('T')[0],
    expectedReturnDate: '',
    notes: '',
    priority: 'medium',
    status: 'active',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ============================================================================
  // LIFECYCLE HOOKS
  // ============================================================================

  useEffect(() => {
    if (initialData) {
      setFormData(prev => ({ ...prev, ...initialData }));
    } else {
      setFormData({
        employeeId: '',
        assetId: '',
        assetType: 'hardware',
        assignedDate: new Date().toISOString().split('T')[0],
        expectedReturnDate: '',
        notes: '',
        priority: 'medium',
        status: 'active',
      });
    }
    setErrors({});
  }, [initialData, open]);

  // ============================================================================
  // VALIDATION
  // ============================================================================

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.employeeId.trim()) {
      newErrors.employeeId = 'Employee is required';
    }

    if (!formData.assetId.trim()) {
      newErrors.assetId = 'Asset is required';
    }

    if (!formData.assignedDate) {
      newErrors.assignedDate = 'Assigned date is required';
    }

    if (
      formData.expectedReturnDate &&
      formData.expectedReturnDate <= formData.assignedDate
    ) {
      newErrors.expectedReturnDate =
        'Expected return date must be after assigned date';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================

  const handleInputChange = (field: keyof AssignmentFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setIsSubmitting(true);
      await onSubmit(formData);
      onClose();
    } catch (error) {
      console.error('Error submitting assignment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth='md'
      fullWidth
      PaperProps={{
        sx: { minHeight: '400px' },
      }}
    >
      <DialogTitle>
        <Typography variant='h6'>
          {initialData ? 'Edit Assignment' : 'Create New Assignment'}
        </Typography>
      </DialogTitle>

      <DialogContent dividers>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {/* Employee Selection */}
          <TextField
            fullWidth
            label='Employee ID'
            value={formData.employeeId}
            onChange={e => handleInputChange('employeeId', e.target.value)}
            error={!!errors.employeeId}
            helperText={errors.employeeId}
            disabled={loading || isSubmitting}
          />

          {/* Asset Type Selection */}
          <FormControl fullWidth error={!!errors.assetType}>
            <InputLabel>Asset Type</InputLabel>
            <Select
              value={formData.assetType}
              label='Asset Type'
              onChange={e => handleInputChange('assetType', e.target.value)}
              disabled={loading || isSubmitting}
            >
              <MenuItem value='hardware'>Hardware</MenuItem>
              <MenuItem value='software'>Software</MenuItem>
            </Select>
          </FormControl>

          {/* Asset Selection */}
          <TextField
            fullWidth
            label='Asset ID'
            value={formData.assetId}
            onChange={e => handleInputChange('assetId', e.target.value)}
            error={!!errors.assetId}
            helperText={errors.assetId}
            disabled={loading || isSubmitting}
          />

          {/* Date Fields */}
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              fullWidth
              type='date'
              label='Assigned Date'
              value={formData.assignedDate}
              onChange={e => handleInputChange('assignedDate', e.target.value)}
              error={!!errors.assignedDate}
              helperText={errors.assignedDate}
              InputLabelProps={{ shrink: true }}
              disabled={loading || isSubmitting}
            />

            <TextField
              fullWidth
              type='date'
              label='Expected Return Date'
              value={formData.expectedReturnDate}
              onChange={e =>
                handleInputChange('expectedReturnDate', e.target.value)
              }
              error={!!errors.expectedReturnDate}
              helperText={errors.expectedReturnDate}
              InputLabelProps={{ shrink: true }}
              disabled={loading || isSubmitting}
            />
          </Box>

          {/* Priority and Status */}
          <Box sx={{ display: 'flex', gap: 2 }}>
            <FormControl fullWidth>
              <InputLabel>Priority</InputLabel>
              <Select
                value={formData.priority}
                label='Priority'
                onChange={e => handleInputChange('priority', e.target.value)}
                disabled={loading || isSubmitting}
              >
                <MenuItem value='low'>Low</MenuItem>
                <MenuItem value='medium'>Medium</MenuItem>
                <MenuItem value='high'>High</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={formData.status}
                label='Status'
                onChange={e => handleInputChange('status', e.target.value)}
                disabled={loading || isSubmitting}
              >
                <MenuItem value='active'>Active</MenuItem>
                <MenuItem value='pending'>Pending</MenuItem>
                <MenuItem value='returned'>Returned</MenuItem>
              </Select>
            </FormControl>
          </Box>

          {/* Notes */}
          <TextField
            fullWidth
            multiline
            rows={3}
            label='Notes'
            value={formData.notes}
            onChange={e => handleInputChange('notes', e.target.value)}
            disabled={loading || isSubmitting}
            placeholder='Additional notes or comments...'
          />

          {/* Error Display */}
          {Object.keys(errors).length > 0 && (
            <Alert severity='error'>
              <Typography variant='body2'>
                Please correct the errors above. {Object.keys(errors).length}{' '}
                error(s) found.
              </Typography>
            </Alert>
          )}
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button
          variant='contained'
          onClick={handleSubmit}
          disabled={loading || isSubmitting || Object.keys(errors).length > 0}
          startIcon={isSubmitting ? <CircularProgress size={16} /> : null}
        >
          {isSubmitting
            ? 'Submitting...'
            : initialData
              ? 'Update Assignment'
              : 'Create Assignment'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AssignmentFormModal;
