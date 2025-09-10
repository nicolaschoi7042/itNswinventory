/**
 * Assignment Scheduler Component
 * 
 * Advanced scheduling system for assignments with calendar view,
 * conflict detection, and automated scheduling recommendations.
 */

'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardHeader,
  Button,
  IconButton,
  Chip,
  Alert,
  Stack,
  Grid,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Switch,
  TextField,
  Autocomplete,
  Divider,
  useTheme,
  alpha
} from '@mui/material';
import {
  Schedule as ScheduleIcon,
  CalendarToday as CalendarIcon,
  Event as EventIcon,
  Alarm as AlarmIcon,
  Repeat as RepeatIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  ArrowForward as ArrowIcon,
  Person as PersonIcon,
  Computer as ComputerIcon,
  Timeline as TimelineIcon
} from '@mui/icons-material';
import { DatePicker, TimePicker } from '@mui/x-date-pickers';

// Import assignment types
import {
  Assignment,
  AssignmentWithDetails,
  CreateAssignmentData,
  AssetType
} from '@/types/assignment';

// ============================================================================
// INTERFACES
// ============================================================================

export interface ScheduledAssignment {
  id?: string;
  employeeId: string;
  employeeName: string;
  assetId: string;
  assetName: string;
  assetType: AssetType;
  scheduledDate: string; // ISO string
  scheduledTime?: string; // ISO string for specific time
  duration?: number; // In hours
  returnDate?: string; // Expected return date
  priority: 'low' | 'medium' | 'high' | 'urgent';
  recurring?: boolean;
  recurringType?: 'daily' | 'weekly' | 'monthly';
  recurringEnd?: string;
  notes?: string;
  autoAssign?: boolean; // Automatically assign when time arrives
  notifications?: NotificationSettings;
  status: 'scheduled' | 'confirmed' | 'cancelled' | 'completed';
}

export interface NotificationSettings {
  emailReminder?: boolean;
  reminderBefore?: number; // Minutes before
  employeeNotification?: boolean;
  managerNotification?: boolean;
}

export interface SchedulingConflict {
  type: 'asset_unavailable' | 'employee_busy' | 'time_overlap' | 'resource_limit';
  message: string;
  severity: 'error' | 'warning' | 'info';
  conflictingAssignment?: Assignment;
  suggestedAlternatives?: string[];
}

export interface TimeSlot {
  start: string;
  end: string;
  available: boolean;
  conflicts?: SchedulingConflict[];
  reason?: string;
}

interface AssignmentSchedulerProps {
  assignments?: (Assignment | AssignmentWithDetails)[];
  employees?: any[];
  assets?: any[];
  onScheduleAssignment?: (scheduled: ScheduledAssignment) => void;
  onScheduleUpdate?: (scheduled: ScheduledAssignment) => void;
  showCalendarView?: boolean;
  allowRecurring?: boolean;
  maxFutureMonths?: number;
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

const generateTimeSlots = (date: string, assignments: Assignment[]): TimeSlot[] => {
  const slots: TimeSlot[] = [];
  const targetDate = new Date(date);
  
  // Generate hourly slots for business hours (9 AM - 6 PM)
  for (let hour = 9; hour <= 18; hour++) {
    const slotStart = new Date(targetDate);
    slotStart.setHours(hour, 0, 0, 0);
    const slotEnd = new Date(slotStart);
    slotEnd.setHours(hour + 1, 0, 0, 0);
    
    // Check for conflicts
    const conflicts = assignments.filter(assignment => {
      const assignedDate = new Date(assignment.assigned_date);
      return assignedDate.toDateString() === targetDate.toDateString() &&
             assignedDate.getHours() === hour;
    });
    
    slots.push({
      start: slotStart.toISOString(),
      end: slotEnd.toISOString(),
      available: conflicts.length === 0,
      conflicts: conflicts.length > 0 ? [{
        type: 'time_overlap',
        message: `${conflicts.length}개의 할당이 예정되어 있습니다.`,
        severity: 'warning'
      }] : undefined
    });
  }
  
  return slots;
};

const checkSchedulingConflicts = (
  scheduled: Partial<ScheduledAssignment>,
  assignments: Assignment[]
): SchedulingConflict[] => {
  const conflicts: SchedulingConflict[] = [];
  
  if (!scheduled.scheduledDate) return conflicts;
  
  const scheduledDateTime = new Date(scheduled.scheduledDate);
  
  // Check asset availability
  const assetConflicts = assignments.filter(assignment => 
    assignment.asset_id === scheduled.assetId &&
    assignment.status === '사용중' &&
    new Date(assignment.assigned_date) <= scheduledDateTime &&
    (!assignment.return_date || new Date(assignment.return_date) >= scheduledDateTime)
  );
  
  if (assetConflicts.length > 0) {
    conflicts.push({
      type: 'asset_unavailable',
      message: '해당 자산이 이미 할당되어 있습니다.',
      severity: 'error',
      conflictingAssignment: assetConflicts[0],
      suggestedAlternatives: ['다른 시간 선택', '대체 자산 찾기']
    });
  }
  
  // Check employee workload
  const employeeAssignments = assignments.filter(assignment =>
    assignment.employee_id === scheduled.employeeId &&
    assignment.status === '사용중' &&
    new Date(assignment.assigned_date).toDateString() === scheduledDateTime.toDateString()
  );
  
  if (employeeAssignments.length >= 3) {
    conflicts.push({
      type: 'employee_busy',
      message: '해당 직원에게 이미 많은 할당이 있습니다.',
      severity: 'warning',
      suggestedAlternatives: ['다른 날짜 선택', '할당 분산']
    });
  }
  
  return conflicts;
};

const suggestOptimalTime = (
  employeeId: string,
  assetId: string,
  preferredDate: string,
  assignments: Assignment[]
): string[] => {
  const suggestions: string[] = [];
  const baseDate = new Date(preferredDate);
  
  // Try next few days
  for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
    const testDate = new Date(baseDate);
    testDate.setDate(baseDate.getDate() + dayOffset);
    
    const timeSlots = generateTimeSlots(testDate.toISOString(), assignments);
    const availableSlots = timeSlots.filter(slot => slot.available);
    
    if (availableSlots.length > 0) {
      suggestions.push(testDate.toISOString().split('T')[0]);
      if (suggestions.length >= 3) break;
    }
  }
  
  return suggestions;
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function AssignmentScheduler({
  assignments = [],
  employees = [],
  assets = [],
  onScheduleAssignment,
  onScheduleUpdate,
  showCalendarView = true,
  allowRecurring = true,
  maxFutureMonths = 6
}: AssignmentSchedulerProps) {
  const theme = useTheme();
  
  const [scheduledAssignment, setScheduledAssignment] = useState<Partial<ScheduledAssignment>>({
    scheduledDate: new Date().toISOString().split('T')[0],
    priority: 'medium',
    autoAssign: true,
    notifications: {
      emailReminder: true,
      reminderBefore: 60,
      employeeNotification: true,
      managerNotification: false
    },
    status: 'scheduled'
  });
  
  const [conflicts, setConflicts] = useState<SchedulingConflict[]>([]);
  const [suggestedTimes, setSuggestedTimes] = useState<string[]>([]);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<TimeSlot | null>(null);
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);

  // Available time slots for selected date
  const availableTimeSlots = useMemo(() => {
    if (!scheduledAssignment.scheduledDate) return [];
    return generateTimeSlots(scheduledAssignment.scheduledDate, assignments);
  }, [scheduledAssignment.scheduledDate, assignments]);

  // Check conflicts when key fields change
  useEffect(() => {
    if (scheduledAssignment.employeeId && scheduledAssignment.assetId && scheduledAssignment.scheduledDate) {
      const newConflicts = checkSchedulingConflicts(scheduledAssignment, assignments);
      setConflicts(newConflicts);
      
      // Generate suggestions if there are conflicts
      if (newConflicts.some(c => c.severity === 'error')) {
        const suggestions = suggestOptimalTime(
          scheduledAssignment.employeeId!,
          scheduledAssignment.assetId!,
          scheduledAssignment.scheduledDate!,
          assignments
        );
        setSuggestedTimes(suggestions);
      } else {
        setSuggestedTimes([]);
      }
    }
  }, [scheduledAssignment.employeeId, scheduledAssignment.assetId, scheduledAssignment.scheduledDate, assignments]);

  // Handle form field changes
  const handleFieldChange = (field: keyof ScheduledAssignment, value: any) => {
    setScheduledAssignment(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Handle notification settings change
  const handleNotificationChange = (field: keyof NotificationSettings, value: any) => {
    setScheduledAssignment(prev => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [field]: value
      }
    }));
  };

  // Handle scheduling submission
  const handleSchedule = () => {
    if (!scheduledAssignment.employeeId || !scheduledAssignment.assetId || !scheduledAssignment.scheduledDate) {
      return;
    }

    const fullSchedule: ScheduledAssignment = {
      id: `schedule_${Date.now()}`,
      employeeId: scheduledAssignment.employeeId,
      employeeName: employees.find(e => e.id === scheduledAssignment.employeeId)?.name || '',
      assetId: scheduledAssignment.assetId,
      assetName: assets.find(a => a.id === scheduledAssignment.assetId)?.name || '',
      assetType: assets.find(a => a.id === scheduledAssignment.assetId)?.type === 'software' ? 'software' : 'hardware',
      scheduledDate: scheduledAssignment.scheduledDate,
      scheduledTime: selectedTimeSlot?.start,
      duration: scheduledAssignment.duration,
      returnDate: scheduledAssignment.returnDate,
      priority: scheduledAssignment.priority || 'medium',
      recurring: scheduledAssignment.recurring,
      recurringType: scheduledAssignment.recurringType,
      recurringEnd: scheduledAssignment.recurringEnd,
      notes: scheduledAssignment.notes,
      autoAssign: scheduledAssignment.autoAssign,
      notifications: scheduledAssignment.notifications,
      status: 'scheduled'
    };

    if (onScheduleAssignment) {
      onScheduleAssignment(fullSchedule);
    }

    // Reset form
    setScheduledAssignment({
      scheduledDate: new Date().toISOString().split('T')[0],
      priority: 'medium',
      autoAssign: true,
      notifications: {
        emailReminder: true,
        reminderBefore: 60,
        employeeNotification: true,
        managerNotification: false
      },
      status: 'scheduled'
    });
    setSelectedTimeSlot(null);
  };

  const canSchedule = scheduledAssignment.employeeId && 
                     scheduledAssignment.assetId && 
                     scheduledAssignment.scheduledDate &&
                     !conflicts.some(c => c.severity === 'error');

  return (
    <Card variant="outlined">
      <CardHeader
        title={
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <ScheduleIcon color="primary" />
            <Typography variant="h6">할당 일정 관리</Typography>
          </Box>
        }
      />

      <CardContent>
        <Stack spacing={3}>
          {/* Basic Scheduling Information */}
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Autocomplete
                options={employees}
                getOptionLabel={(option) => option.name}
                value={employees.find(e => e.id === scheduledAssignment.employeeId) || null}
                onChange={(_, value) => handleFieldChange('employeeId', value?.id || '')}
                renderInput={(params) => (
                  <TextField {...params} label="직원 선택" required />
                )}
                renderOption={(props, option) => (
                  <Box component="li" {...props}>
                    <PersonIcon sx={{ mr: 1 }} color="action" />
                    <Box>
                      <Typography variant="body2">{option.name}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {option.department} • {option.position}
                      </Typography>
                    </Box>
                  </Box>
                )}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <Autocomplete
                options={assets}
                getOptionLabel={(option) => `${option.name} (${option.id})`}
                value={assets.find(a => a.id === scheduledAssignment.assetId) || null}
                onChange={(_, value) => handleFieldChange('assetId', value?.id || '')}
                renderInput={(params) => (
                  <TextField {...params} label="자산 선택" required />
                )}
                renderOption={(props, option) => (
                  <Box component="li" {...props}>
                    <ComputerIcon sx={{ mr: 1 }} color="action" />
                    <Box>
                      <Typography variant="body2">{option.name}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {option.manufacturer} • {option.type}
                      </Typography>
                    </Box>
                  </Box>
                )}
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <DatePicker
                label="할당 예정일"
                value={scheduledAssignment.scheduledDate ? new Date(scheduledAssignment.scheduledDate) : null}
                onChange={(date) => handleFieldChange('scheduledDate', date?.toISOString().split('T')[0])}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    required: true
                  }
                }}
                minDate={new Date()}
                maxDate={new Date(Date.now() + maxFutureMonths * 30 * 24 * 60 * 60 * 1000)}
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <FormLabel>우선순위</FormLabel>
                <RadioGroup
                  row
                  value={scheduledAssignment.priority}
                  onChange={(e) => handleFieldChange('priority', e.target.value)}
                >
                  <FormControlLabel value="low" control={<Radio />} label="낮음" />
                  <FormControlLabel value="medium" control={<Radio />} label="보통" />
                  <FormControlLabel value="high" control={<Radio />} label="높음" />
                  <FormControlLabel value="urgent" control={<Radio />} label="긴급" />
                </RadioGroup>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={4}>
              <DatePicker
                label="예상 반납일 (선택사항)"
                value={scheduledAssignment.returnDate ? new Date(scheduledAssignment.returnDate) : null}
                onChange={(date) => handleFieldChange('returnDate', date?.toISOString().split('T')[0])}
                slotProps={{
                  textField: {
                    fullWidth: true
                  }
                }}
                minDate={scheduledAssignment.scheduledDate ? new Date(scheduledAssignment.scheduledDate) : new Date()}
              />
            </Grid>
          </Grid>

          {/* Time Slot Selection */}
          {scheduledAssignment.scheduledDate && (
            <Card variant="outlined">
              <CardContent>
                <Typography variant="subtitle1" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <TimelineIcon color="primary" />
                  시간대 선택
                </Typography>
                
                <Grid container spacing={1}>
                  {availableTimeSlots.map((slot, index) => {
                    const startTime = new Date(slot.start).toLocaleTimeString('ko-KR', { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    });
                    const isSelected = selectedTimeSlot?.start === slot.start;
                    
                    return (
                      <Grid item xs={6} sm={4} md={3} key={index}>
                        <Button
                          variant={isSelected ? "contained" : slot.available ? "outlined" : "text"}
                          color={slot.available ? "primary" : "error"}
                          disabled={!slot.available}
                          onClick={() => setSelectedTimeSlot(slot)}
                          fullWidth
                          size="small"
                          sx={{ 
                            justifyContent: 'center',
                            opacity: slot.available ? 1 : 0.5
                          }}
                        >
                          {startTime}
                        </Button>
                      </Grid>
                    );
                  })}
                </Grid>
              </CardContent>
            </Card>
          )}

          {/* Conflicts and Suggestions */}
          {conflicts.length > 0 && (
            <Alert 
              severity={conflicts.some(c => c.severity === 'error') ? 'error' : 'warning'}
              icon={<WarningIcon />}
            >
              <Typography variant="subtitle2" gutterBottom>
                일정 충돌 감지 ({conflicts.length}개)
              </Typography>
              <Stack spacing={1}>
                {conflicts.map((conflict, index) => (
                  <Box key={index}>
                    <Typography variant="body2">{conflict.message}</Typography>
                    {conflict.suggestedAlternatives && (
                      <Typography variant="caption" color="text.secondary">
                        권장사항: {conflict.suggestedAlternatives.join(', ')}
                      </Typography>
                    )}
                  </Box>
                ))}
              </Stack>
            </Alert>
          )}

          {/* Suggested Times */}
          {suggestedTimes.length > 0 && (
            <Card variant="outlined" sx={{ bgcolor: alpha(theme.palette.info.main, 0.05) }}>
              <CardContent>
                <Typography variant="subtitle2" gutterBottom color="info.main">
                  추천 일정
                </Typography>
                <Stack direction="row" spacing={1} flexWrap="wrap">
                  {suggestedTimes.map((date, index) => (
                    <Chip
                      key={index}
                      label={new Date(date).toLocaleDateString('ko-KR')}
                      onClick={() => handleFieldChange('scheduledDate', date)}
                      clickable
                      color="info"
                      variant="outlined"
                    />
                  ))}
                </Stack>
              </CardContent>
            </Card>
          )}

          {/* Advanced Options */}
          <Card variant="outlined">
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="subtitle1">고급 옵션</Typography>
                <Switch
                  checked={showAdvancedOptions}
                  onChange={(e) => setShowAdvancedOptions(e.target.checked)}
                />
              </Box>

              {showAdvancedOptions && (
                <Stack spacing={2}>
                  {/* Auto Assignment */}
                  <FormControlLabel
                    control={
                      <Switch
                        checked={scheduledAssignment.autoAssign}
                        onChange={(e) => handleFieldChange('autoAssign', e.target.checked)}
                      />
                    }
                    label="예정 시간에 자동으로 할당"
                  />

                  {/* Recurring Schedule */}
                  {allowRecurring && (
                    <Box>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={scheduledAssignment.recurring}
                            onChange={(e) => handleFieldChange('recurring', e.target.checked)}
                          />
                        }
                        label="반복 일정"
                      />
                      
                      {scheduledAssignment.recurring && (
                        <Grid container spacing={2} sx={{ mt: 1 }}>
                          <Grid item xs={6}>
                            <FormControl fullWidth>
                              <FormLabel>반복 주기</FormLabel>
                              <RadioGroup
                                value={scheduledAssignment.recurringType}
                                onChange={(e) => handleFieldChange('recurringType', e.target.value)}
                              >
                                <FormControlLabel value="daily" control={<Radio />} label="매일" />
                                <FormControlLabel value="weekly" control={<Radio />} label="매주" />
                                <FormControlLabel value="monthly" control={<Radio />} label="매월" />
                              </RadioGroup>
                            </FormControl>
                          </Grid>
                          <Grid item xs={6}>
                            <DatePicker
                              label="반복 종료일"
                              value={scheduledAssignment.recurringEnd ? new Date(scheduledAssignment.recurringEnd) : null}
                              onChange={(date) => handleFieldChange('recurringEnd', date?.toISOString().split('T')[0])}
                              slotProps={{
                                textField: {
                                  fullWidth: true
                                }
                              }}
                              minDate={scheduledAssignment.scheduledDate ? new Date(scheduledAssignment.scheduledDate) : new Date()}
                            />
                          </Grid>
                        </Grid>
                      )}
                    </Box>
                  )}

                  {/* Notification Settings */}
                  <Box>
                    <Typography variant="subtitle2" gutterBottom>알림 설정</Typography>
                    <Stack spacing={1}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={scheduledAssignment.notifications?.emailReminder}
                            onChange={(e) => handleNotificationChange('emailReminder', e.target.checked)}
                          />
                        }
                        label="이메일 알림"
                      />
                      <FormControlLabel
                        control={
                          <Switch
                            checked={scheduledAssignment.notifications?.employeeNotification}
                            onChange={(e) => handleNotificationChange('employeeNotification', e.target.checked)}
                          />
                        }
                        label="직원 알림"
                      />
                      <FormControlLabel
                        control={
                          <Switch
                            checked={scheduledAssignment.notifications?.managerNotification}
                            onChange={(e) => handleNotificationChange('managerNotification', e.target.checked)}
                          />
                        }
                        label="관리자 알림"
                      />
                      
                      {scheduledAssignment.notifications?.emailReminder && (
                        <TextField
                          type="number"
                          label="알림 시간 (분 전)"
                          value={scheduledAssignment.notifications.reminderBefore}
                          onChange={(e) => handleNotificationChange('reminderBefore', parseInt(e.target.value))}
                          inputProps={{ min: 5, max: 1440 }}
                          size="small"
                          sx={{ maxWidth: 200 }}
                        />
                      )}
                    </Stack>
                  </Box>

                  {/* Notes */}
                  <TextField
                    label="일정 메모"
                    multiline
                    rows={2}
                    value={scheduledAssignment.notes || ''}
                    onChange={(e) => handleFieldChange('notes', e.target.value)}
                    placeholder="할당 일정에 대한 메모를 입력하세요..."
                    fullWidth
                  />
                </Stack>
              )}
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
            <Button
              variant="outlined"
              onClick={() => {
                setScheduledAssignment({
                  scheduledDate: new Date().toISOString().split('T')[0],
                  priority: 'medium',
                  autoAssign: true,
                  notifications: {
                    emailReminder: true,
                    reminderBefore: 60,
                    employeeNotification: true,
                    managerNotification: false
                  },
                  status: 'scheduled'
                });
                setSelectedTimeSlot(null);
              }}
            >
              초기화
            </Button>
            <Button
              variant="contained"
              startIcon={<EventIcon />}
              onClick={handleSchedule}
              disabled={!canSchedule}
            >
              일정 등록
            </Button>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}

// ============================================================================
// EXPORTS
// ============================================================================

export default AssignmentScheduler;