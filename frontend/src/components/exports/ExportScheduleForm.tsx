/**
 * Export Schedule Form Component
 *
 * Modal form for creating and editing export schedules with advanced configuration options
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
  Stepper,
  Step,
  StepLabel,
  Typography,
  RadioGroup,
  FormControlLabel,
  Radio,
  Checkbox,
  FormGroup,
  Grid,
  Card,
  CardContent,
  Divider,
  Alert,
  Chip,
  IconButton,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Switch,
  FormLabel,
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  Schedule as ScheduleIcon,
  Settings as SettingsIcon,
  Notifications as NotificationsIcon,
  Close as CloseIcon,
  Info as InfoIcon,
} from '@mui/icons-material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import type {
  ScheduleConfig,
  ScheduledExport,
  ExportFormat,
  ExportDataType,
  ExportSchedule,
  NotificationConfig,
} from '@/types/export';

// ============================================================================
// TYPES AND INTERFACES
// ============================================================================

interface ExportScheduleFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (config: ScheduleConfig) => void;
  initialData?: ScheduledExport | null;
}

interface StepProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

// ============================================================================
// STEP COMPONENT
// ============================================================================

const StepContent: React.FC<StepProps> = ({ children, value, index }) => {
  return (
    <div hidden={value !== index}>
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export const ExportScheduleForm: React.FC<ExportScheduleFormProps> = ({
  open,
  onClose,
  onSubmit,
  initialData,
}) => {
  // ============================================================================
  // STATE MANAGEMENT
  // ============================================================================

  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState<ScheduleConfig>({
    name: '',
    description: '',
    dataType: 'hardware',
    exportFormat: 'excel',
    schedule: {
      type: 'daily',
      time: '09:00',
    },
    exportConfig: {
      includeHeaders: true,
      includeMetadata: true,
    },
    notificationConfig: {
      enabled: false,
      email: {
        enabled: false,
        recipients: [],
      },
      push: {
        enabled: false,
      },
      webhook: {
        enabled: false,
        url: '',
        headers: {},
      },
    },
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // ============================================================================
  // CONSTANTS
  // ============================================================================

  const steps = [
    'Basic Information',
    'Schedule Configuration',
    'Export Settings',
    'Notifications',
  ];

  const dataTypes: { value: ExportDataType; label: string }[] = [
    { value: 'hardware', label: 'Hardware Assets' },
    { value: 'software', label: 'Software Licenses' },
    { value: 'employees', label: 'Employees' },
    { value: 'assignments', label: 'Assignments' },
    { value: 'analytics', label: 'Analytics Report' },
  ];

  const exportFormats: {
    value: ExportFormat;
    label: string;
    description: string;
  }[] = [
    {
      value: 'excel',
      label: 'Excel (XLSX)',
      description: 'Full-featured spreadsheet with formatting',
    },
    {
      value: 'csv',
      label: 'CSV',
      description: 'Simple comma-separated values',
    },
    {
      value: 'pdf',
      label: 'PDF Report',
      description: 'Professional formatted report',
    },
    { value: 'json', label: 'JSON', description: 'Structured data format' },
  ];

  const scheduleTypes = [
    {
      value: 'once',
      label: 'One Time',
      description: 'Execute once at a specific date/time',
    },
    {
      value: 'daily',
      label: 'Daily',
      description: 'Execute every day at a specific time',
    },
    {
      value: 'weekly',
      label: 'Weekly',
      description: 'Execute weekly on a specific day',
    },
    {
      value: 'monthly',
      label: 'Monthly',
      description: 'Execute monthly on a specific date',
    },
    {
      value: 'cron',
      label: 'Custom (Cron)',
      description: 'Advanced scheduling with cron expression',
    },
  ];

  const weekDays = [
    { value: 0, label: 'Sunday' },
    { value: 1, label: 'Monday' },
    { value: 2, label: 'Tuesday' },
    { value: 3, label: 'Wednesday' },
    { value: 4, label: 'Thursday' },
    { value: 5, label: 'Friday' },
    { value: 6, label: 'Saturday' },
  ];

  // ============================================================================
  // LIFECYCLE HOOKS
  // ============================================================================

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name,
        description: initialData.description || '',
        dataType: initialData.dataType,
        exportFormat: initialData.exportFormat,
        schedule: initialData.schedule,
        exportConfig: initialData.exportConfig,
        notificationConfig: initialData.notificationConfig || {
          enabled: false,
          email: { enabled: false, recipients: [] },
          push: { enabled: false },
          webhook: { enabled: false, url: '', headers: {} },
        },
      });
    } else {
      // Reset form for new schedule
      setFormData({
        name: '',
        description: '',
        dataType: 'hardware',
        exportFormat: 'excel',
        schedule: {
          type: 'daily',
          time: '09:00',
        },
        exportConfig: {
          includeHeaders: true,
          includeMetadata: true,
        },
        notificationConfig: {
          enabled: false,
          email: { enabled: false, recipients: [] },
          push: { enabled: false },
          webhook: { enabled: false, url: '', headers: {} },
        },
      });
    }
    setActiveStep(0);
    setErrors({});
  }, [initialData, open]);

  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================

  const handleNext = () => {
    if (validateStep(activeStep)) {
      setActiveStep(prevActiveStep => prevActiveStep + 1);
    }
  };

  const handleBack = () => {
    setActiveStep(prevActiveStep => prevActiveStep - 1);
  };

  const handleSubmit = () => {
    if (validateAllSteps()) {
      onSubmit(formData);
    }
  };

  const handleFieldChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));

    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: '',
      }));
    }
  };

  const handleScheduleChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      schedule: {
        ...prev.schedule,
        [field]: value,
      },
    }));
  };

  const handleExportConfigChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      exportConfig: {
        ...prev.exportConfig,
        [field]: value,
      },
    }));
  };

  const handleNotificationConfigChange = (path: string[], value: any) => {
    setFormData(prev => {
      const newConfig = { ...prev };
      let current: any = newConfig.notificationConfig;

      for (let i = 0; i < path.length - 1; i++) {
        current = current[path[i]];
      }
      current[path[path.length - 1]] = value;

      return newConfig;
    });
  };

  // ============================================================================
  // VALIDATION
  // ============================================================================

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    switch (step) {
      case 0: // Basic Information
        if (!formData.name.trim()) {
          newErrors.name = 'Schedule name is required';
        }
        if (!formData.dataType) {
          newErrors.dataType = 'Data type is required';
        }
        if (!formData.exportFormat) {
          newErrors.exportFormat = 'Export format is required';
        }
        break;

      case 1: // Schedule Configuration
        if (!formData.schedule.type) {
          newErrors.scheduleType = 'Schedule type is required';
        }

        if (formData.schedule.type === 'once' && !formData.schedule.executeAt) {
          newErrors.executeAt = 'Execution date/time is required';
        }

        if (
          ['daily', 'weekly', 'monthly'].includes(formData.schedule.type) &&
          !formData.schedule.time
        ) {
          newErrors.time = 'Time is required';
        }

        if (
          formData.schedule.type === 'weekly' &&
          formData.schedule.dayOfWeek === undefined
        ) {
          newErrors.dayOfWeek = 'Day of week is required';
        }

        if (
          formData.schedule.type === 'monthly' &&
          !formData.schedule.dayOfMonth
        ) {
          newErrors.dayOfMonth = 'Day of month is required';
        }

        if (
          formData.schedule.type === 'cron' &&
          !formData.schedule.cronExpression
        ) {
          newErrors.cronExpression = 'Cron expression is required';
        }
        break;

      case 2: // Export Settings
        // Export settings are generally optional
        break;

      case 3: // Notifications
        if (
          formData.notificationConfig?.email?.enabled &&
          (!formData.notificationConfig.email.recipients ||
            formData.notificationConfig.email.recipients.length === 0)
        ) {
          newErrors.emailRecipients =
            'Email recipients are required when email notifications are enabled';
        }

        if (
          formData.notificationConfig?.webhook?.enabled &&
          !formData.notificationConfig.webhook.url
        ) {
          newErrors.webhookUrl =
            'Webhook URL is required when webhook notifications are enabled';
        }
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateAllSteps = (): boolean => {
    for (let i = 0; i < steps.length; i++) {
      if (!validateStep(i)) {
        setActiveStep(i);
        return false;
      }
    }
    return true;
  };

  // ============================================================================
  // RENDER METHODS
  // ============================================================================

  const renderBasicInformation = () => (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <TextField
          fullWidth
          label='Schedule Name'
          value={formData.name}
          onChange={e => handleFieldChange('name', e.target.value)}
          error={!!errors.name}
          helperText={errors.name}
          required
        />
      </Grid>

      <Grid item xs={12}>
        <TextField
          fullWidth
          label='Description'
          value={formData.description}
          onChange={e => handleFieldChange('description', e.target.value)}
          multiline
          rows={2}
          placeholder='Optional description of what this schedule does'
        />
      </Grid>

      <Grid item xs={12} md={6}>
        <FormControl fullWidth error={!!errors.dataType}>
          <InputLabel>Data Type</InputLabel>
          <Select
            value={formData.dataType}
            label='Data Type'
            onChange={e => handleFieldChange('dataType', e.target.value)}
          >
            {dataTypes.map(type => (
              <MenuItem key={type.value} value={type.value}>
                {type.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>

      <Grid item xs={12} md={6}>
        <FormControl fullWidth error={!!errors.exportFormat}>
          <InputLabel>Export Format</InputLabel>
          <Select
            value={formData.exportFormat}
            label='Export Format'
            onChange={e => handleFieldChange('exportFormat', e.target.value)}
          >
            {exportFormats.map(format => (
              <MenuItem key={format.value} value={format.value}>
                <Box>
                  <Typography variant='body2'>{format.label}</Typography>
                  <Typography variant='caption' color='text.secondary'>
                    {format.description}
                  </Typography>
                </Box>
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>
    </Grid>
  );

  const renderScheduleConfiguration = () => (
    <Box>
      <Typography variant='h6' gutterBottom>
        Schedule Type
      </Typography>

      <RadioGroup
        value={formData.schedule.type}
        onChange={e => handleScheduleChange('type', e.target.value)}
      >
        {scheduleTypes.map(type => (
          <FormControlLabel
            key={type.value}
            value={type.value}
            control={<Radio />}
            label={
              <Box>
                <Typography variant='body2'>{type.label}</Typography>
                <Typography variant='caption' color='text.secondary'>
                  {type.description}
                </Typography>
              </Box>
            }
          />
        ))}
      </RadioGroup>

      <Divider sx={{ my: 3 }} />

      {/* Schedule-specific configuration */}
      {formData.schedule.type === 'once' && (
        <Box>
          <Typography variant='subtitle1' gutterBottom>
            Execution Time
          </Typography>
          <DateTimePicker
            label='Execute At'
            value={formData.schedule.executeAt || null}
            onChange={value => handleScheduleChange('executeAt', value)}
            slotProps={{
              textField: {
                fullWidth: true,
                error: !!errors.executeAt,
                helperText: errors.executeAt,
              },
            }}
          />
        </Box>
      )}

      {['daily', 'weekly', 'monthly'].includes(formData.schedule.type) && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <TimePicker
              label='Time'
              value={
                formData.schedule.time
                  ? new Date(`2000-01-01T${formData.schedule.time}:00`)
                  : null
              }
              onChange={value => {
                if (value) {
                  const timeString = value.toTimeString().substring(0, 5);
                  handleScheduleChange('time', timeString);
                }
              }}
              slotProps={{
                textField: {
                  fullWidth: true,
                  error: !!errors.time,
                  helperText: errors.time,
                },
              }}
            />
          </Grid>

          {formData.schedule.type === 'weekly' && (
            <Grid item xs={12} md={6}>
              <FormControl fullWidth error={!!errors.dayOfWeek}>
                <InputLabel>Day of Week</InputLabel>
                <Select
                  value={formData.schedule.dayOfWeek ?? ''}
                  label='Day of Week'
                  onChange={e =>
                    handleScheduleChange('dayOfWeek', Number(e.target.value))
                  }
                >
                  {weekDays.map(day => (
                    <MenuItem key={day.value} value={day.value}>
                      {day.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          )}

          {formData.schedule.type === 'monthly' && (
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label='Day of Month'
                type='number'
                value={formData.schedule.dayOfMonth || ''}
                onChange={e =>
                  handleScheduleChange('dayOfMonth', Number(e.target.value))
                }
                error={!!errors.dayOfMonth}
                helperText={
                  errors.dayOfMonth || 'Enter a number between 1 and 31'
                }
                inputProps={{ min: 1, max: 31 }}
              />
            </Grid>
          )}
        </Grid>
      )}

      {formData.schedule.type === 'cron' && (
        <Box>
          <Alert severity='info' sx={{ mb: 2 }}>
            Use standard cron syntax: minute hour day month dayOfWeek
            <br />
            Example: "0 9 * * 1" = Every Monday at 9:00 AM
          </Alert>
          <TextField
            fullWidth
            label='Cron Expression'
            value={formData.schedule.cronExpression || ''}
            onChange={e =>
              handleScheduleChange('cronExpression', e.target.value)
            }
            error={!!errors.cronExpression}
            helperText={errors.cronExpression}
            placeholder='0 9 * * *'
          />
        </Box>
      )}
    </Box>
  );

  const renderExportSettings = () => (
    <Box>
      <Typography variant='h6' gutterBottom>
        Export Configuration
      </Typography>

      <Card variant='outlined' sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant='subtitle2' gutterBottom>
            General Options
          </Typography>

          <FormGroup>
            <FormControlLabel
              control={
                <Checkbox
                  checked={formData.exportConfig?.includeHeaders ?? true}
                  onChange={e =>
                    handleExportConfigChange('includeHeaders', e.target.checked)
                  }
                />
              }
              label='Include column headers'
            />

            <FormControlLabel
              control={
                <Checkbox
                  checked={formData.exportConfig?.includeMetadata ?? true}
                  onChange={e =>
                    handleExportConfigChange(
                      'includeMetadata',
                      e.target.checked
                    )
                  }
                />
              }
              label='Include metadata (export date, filters, etc.)'
            />
          </FormGroup>
        </CardContent>
      </Card>

      {formData.exportFormat === 'excel' && (
        <Card variant='outlined' sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant='subtitle2' gutterBottom>
              Excel Options
            </Typography>

            <FormGroup>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.exportConfig?.excel?.autoFilter ?? false}
                    onChange={e =>
                      handleExportConfigChange('excel', {
                        ...formData.exportConfig?.excel,
                        autoFilter: e.target.checked,
                      })
                    }
                  />
                }
                label='Enable auto-filter'
              />

              <FormControlLabel
                control={
                  <Checkbox
                    checked={
                      formData.exportConfig?.excel?.freezeHeader ?? false
                    }
                    onChange={e =>
                      handleExportConfigChange('excel', {
                        ...formData.exportConfig?.excel,
                        freezeHeader: e.target.checked,
                      })
                    }
                  />
                }
                label='Freeze header row'
              />
            </FormGroup>
          </CardContent>
        </Card>
      )}

      {formData.exportFormat === 'pdf' && (
        <Card variant='outlined' sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant='subtitle2' gutterBottom>
              PDF Options
            </Typography>

            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Page Size</InputLabel>
                  <Select
                    value={formData.exportConfig?.pdf?.pageSize || 'A4'}
                    label='Page Size'
                    onChange={e =>
                      handleExportConfigChange('pdf', {
                        ...formData.exportConfig?.pdf,
                        pageSize: e.target.value,
                      })
                    }
                  >
                    <MenuItem value='A4'>A4</MenuItem>
                    <MenuItem value='Letter'>Letter</MenuItem>
                    <MenuItem value='Legal'>Legal</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Orientation</InputLabel>
                  <Select
                    value={
                      formData.exportConfig?.pdf?.orientation || 'portrait'
                    }
                    label='Orientation'
                    onChange={e =>
                      handleExportConfigChange('pdf', {
                        ...formData.exportConfig?.pdf,
                        orientation: e.target.value,
                      })
                    }
                  >
                    <MenuItem value='portrait'>Portrait</MenuItem>
                    <MenuItem value='landscape'>Landscape</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}
    </Box>
  );

  const renderNotifications = () => (
    <Box>
      <Typography variant='h6' gutterBottom>
        Notification Settings
      </Typography>

      <FormControlLabel
        control={
          <Switch
            checked={formData.notificationConfig?.enabled ?? false}
            onChange={e =>
              handleNotificationConfigChange(['enabled'], e.target.checked)
            }
          />
        }
        label='Enable notifications for this schedule'
      />

      {formData.notificationConfig?.enabled && (
        <Box sx={{ mt: 3 }}>
          {/* Email Notifications */}
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Switch
                  checked={formData.notificationConfig?.email?.enabled ?? false}
                  onChange={e =>
                    handleNotificationConfigChange(
                      ['email', 'enabled'],
                      e.target.checked
                    )
                  }
                  onClick={e => e.stopPropagation()}
                />
                <Typography>Email Notifications</Typography>
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              <TextField
                fullWidth
                label='Email Recipients'
                value={
                  formData.notificationConfig?.email?.recipients?.join(', ') ||
                  ''
                }
                onChange={e => {
                  const emails = e.target.value
                    .split(',')
                    .map(email => email.trim())
                    .filter(email => email);
                  handleNotificationConfigChange(
                    ['email', 'recipients'],
                    emails
                  );
                }}
                error={!!errors.emailRecipients}
                helperText={
                  errors.emailRecipients ||
                  'Enter email addresses separated by commas'
                }
                placeholder='user1@company.com, user2@company.com'
              />
            </AccordionDetails>
          </Accordion>

          {/* Push Notifications */}
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Switch
                  checked={formData.notificationConfig?.push?.enabled ?? false}
                  onChange={e =>
                    handleNotificationConfigChange(
                      ['push', 'enabled'],
                      e.target.checked
                    )
                  }
                  onClick={e => e.stopPropagation()}
                />
                <Typography>Push Notifications</Typography>
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              <Alert severity='info'>
                Push notifications will be sent to your browser when the export
                completes.
              </Alert>
            </AccordionDetails>
          </Accordion>

          {/* Webhook Notifications */}
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Switch
                  checked={
                    formData.notificationConfig?.webhook?.enabled ?? false
                  }
                  onChange={e =>
                    handleNotificationConfigChange(
                      ['webhook', 'enabled'],
                      e.target.checked
                    )
                  }
                  onClick={e => e.stopPropagation()}
                />
                <Typography>Webhook Notifications</Typography>
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              <TextField
                fullWidth
                label='Webhook URL'
                value={formData.notificationConfig?.webhook?.url || ''}
                onChange={e =>
                  handleNotificationConfigChange(
                    ['webhook', 'url'],
                    e.target.value
                  )
                }
                error={!!errors.webhookUrl}
                helperText={
                  errors.webhookUrl || 'URL to POST notification data'
                }
                placeholder='https://your-server.com/webhook'
              />
            </AccordionDetails>
          </Accordion>
        </Box>
      )}
    </Box>
  );

  // ============================================================================
  // MAIN RENDER
  // ============================================================================

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth='md'
      fullWidth
      PaperProps={{
        sx: { height: '80vh' },
      }}
    >
      <DialogTitle>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Typography variant='h5'>
            {initialData ? 'Edit Schedule' : 'Create Export Schedule'}
          </Typography>
          <IconButton onClick={onClose} edge='end'>
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        {/* Stepper */}
        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map(label => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {/* Step Content */}
        <StepContent value={activeStep} index={0}>
          {renderBasicInformation()}
        </StepContent>

        <StepContent value={activeStep} index={1}>
          {renderScheduleConfiguration()}
        </StepContent>

        <StepContent value={activeStep} index={2}>
          {renderExportSettings()}
        </StepContent>

        <StepContent value={activeStep} index={3}>
          {renderNotifications()}
        </StepContent>
      </DialogContent>

      <DialogActions sx={{ justifyContent: 'space-between', px: 3, py: 2 }}>
        <Button disabled={activeStep === 0} onClick={handleBack}>
          Back
        </Button>

        <Box>
          {activeStep === steps.length - 1 ? (
            <Button variant='contained' onClick={handleSubmit}>
              {initialData ? 'Update Schedule' : 'Create Schedule'}
            </Button>
          ) : (
            <Button variant='contained' onClick={handleNext}>
              Next
            </Button>
          )}
        </Box>
      </DialogActions>
    </Dialog>
  );
};

export default ExportScheduleForm;
