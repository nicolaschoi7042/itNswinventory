/**
 * Assignment Validation Status Component
 *
 * Displays real-time validation status for assignment forms
 * with detailed availability and eligibility information.
 */

import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  Alert,
  LinearProgress,
  Stack,
  Divider,
  Collapse,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  useTheme,
  alpha,
} from '@mui/material';
import {
  CheckCircle as CheckIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  ExpandMore as ExpandIcon,
  ExpandLess as CollapseIcon,
  Person as PersonIcon,
  Computer as ComputerIcon,
  License as LicenseIcon,
  Assignment as AssignmentIcon,
} from '@mui/icons-material';

// Types for validation status
interface ValidationIssue {
  type:
    | 'asset_availability'
    | 'employee_limit'
    | 'software_license'
    | 'conflict';
  severity: 'error' | 'warning';
  message: string;
  details?: any;
}

interface ValidationStatus {
  isEligible: boolean;
  issues: ValidationIssue[];
  warnings: string[];
  recommendations: string[];
}

interface AssignmentValidationStatusProps {
  validationStatus: ValidationStatus | null;
  loading?: boolean;
  compact?: boolean;
  showDetails?: boolean;
  employeeName?: string;
  assetName?: string;
  assetType?: 'hardware' | 'software';
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function AssignmentValidationStatus({
  validationStatus,
  loading = false,
  compact = false,
  showDetails = true,
  employeeName,
  assetName,
  assetType,
}: AssignmentValidationStatusProps) {
  const theme = useTheme();
  const [expanded, setExpanded] = React.useState(showDetails);

  if (!validationStatus && !loading) {
    return null;
  }

  if (loading) {
    return (
      <Card variant='outlined' sx={{ mb: 2 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <LinearProgress sx={{ flexGrow: 1 }} />
            <Typography variant='body2' color='text.secondary'>
              가용성 확인 중...
            </Typography>
          </Box>
        </CardContent>
      </Card>
    );
  }

  if (!validationStatus) return null;

  const { isEligible, issues, warnings, recommendations } = validationStatus;
  const errorIssues = issues.filter(issue => issue.severity === 'error');
  const warningIssues = issues.filter(issue => issue.severity === 'warning');

  // Determine overall status
  const overallStatus =
    errorIssues.length > 0
      ? 'error'
      : warningIssues.length > 0
        ? 'warning'
        : 'success';

  const statusColor = {
    success: theme.palette.success.main,
    warning: theme.palette.warning.main,
    error: theme.palette.error.main,
  }[overallStatus];

  const StatusIcon = {
    success: CheckIcon,
    warning: WarningIcon,
    error: ErrorIcon,
  }[overallStatus];

  const statusMessage = isEligible
    ? '할당이 가능합니다'
    : '할당이 불가능합니다';

  if (compact) {
    return (
      <Box sx={{ mb: 2 }}>
        <Chip
          icon={<StatusIcon />}
          label={statusMessage}
          color={overallStatus as 'success' | 'warning' | 'error'}
          variant={isEligible ? 'filled' : 'outlined'}
          size='small'
        />
        {errorIssues.length > 0 && (
          <Typography
            variant='caption'
            color='error'
            display='block'
            sx={{ mt: 0.5 }}
          >
            {errorIssues[0].message}
          </Typography>
        )}
      </Box>
    );
  }

  return (
    <Card
      variant='outlined'
      sx={{
        mb: 2,
        border: `1px solid ${statusColor}`,
        backgroundColor: alpha(statusColor, 0.05),
      }}
    >
      <CardContent>
        {/* Header */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            mb: 2,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <StatusIcon sx={{ color: statusColor }} />
            <Typography variant='h6' sx={{ color: statusColor }}>
              {statusMessage}
            </Typography>
          </Box>

          {!showDetails && (
            <IconButton
              size='small'
              onClick={() => setExpanded(!expanded)}
              aria-label={expanded ? '접기' : '펼치기'}
            >
              {expanded ? <CollapseIcon /> : <ExpandIcon />}
            </IconButton>
          )}
        </Box>

        {/* Assignment Summary */}
        {(employeeName || assetName) && (
          <Box sx={{ mb: 2 }}>
            <Stack
              direction='row'
              spacing={2}
              divider={<Divider orientation='vertical' flexItem />}
            >
              {employeeName && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <PersonIcon fontSize='small' color='action' />
                  <Typography variant='body2'>{employeeName}</Typography>
                </Box>
              )}
              {assetName && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  {assetType === 'software' ? (
                    <LicenseIcon fontSize='small' color='action' />
                  ) : (
                    <ComputerIcon fontSize='small' color='action' />
                  )}
                  <Typography variant='body2'>{assetName}</Typography>
                </Box>
              )}
            </Stack>
          </Box>
        )}

        {/* Validation Details */}
        <Collapse in={expanded}>
          <Box>
            {/* Error Issues */}
            {errorIssues.length > 0 && (
              <Box sx={{ mb: 2 }}>
                <Typography variant='subtitle2' color='error' gutterBottom>
                  오류 ({errorIssues.length})
                </Typography>
                <List dense>
                  {errorIssues.map((issue, index) => (
                    <ListItem key={index} sx={{ pl: 0 }}>
                      <ListItemIcon sx={{ minWidth: 32 }}>
                        <ErrorIcon color='error' fontSize='small' />
                      </ListItemIcon>
                      <ListItemText
                        primary={issue.message}
                        primaryTypographyProps={{ variant: 'body2' }}
                      />
                    </ListItem>
                  ))}
                </List>
              </Box>
            )}

            {/* Warning Issues */}
            {warningIssues.length > 0 && (
              <Box sx={{ mb: 2 }}>
                <Typography
                  variant='subtitle2'
                  color='warning.main'
                  gutterBottom
                >
                  주의사항 ({warningIssues.length})
                </Typography>
                <List dense>
                  {warningIssues.map((issue, index) => (
                    <ListItem key={index} sx={{ pl: 0 }}>
                      <ListItemIcon sx={{ minWidth: 32 }}>
                        <WarningIcon color='warning' fontSize='small' />
                      </ListItemIcon>
                      <ListItemText
                        primary={issue.message}
                        primaryTypographyProps={{ variant: 'body2' }}
                      />
                    </ListItem>
                  ))}
                </List>
              </Box>
            )}

            {/* General Warnings */}
            {warnings.length > 0 && (
              <Box sx={{ mb: 2 }}>
                <Typography
                  variant='subtitle2'
                  color='warning.main'
                  gutterBottom
                >
                  일반 경고 ({warnings.length})
                </Typography>
                <List dense>
                  {warnings.map((warning, index) => (
                    <ListItem key={index} sx={{ pl: 0 }}>
                      <ListItemIcon sx={{ minWidth: 32 }}>
                        <WarningIcon color='warning' fontSize='small' />
                      </ListItemIcon>
                      <ListItemText
                        primary={warning}
                        primaryTypographyProps={{ variant: 'body2' }}
                      />
                    </ListItem>
                  ))}
                </List>
              </Box>
            )}

            {/* Recommendations */}
            {recommendations.length > 0 && (
              <Box sx={{ mb: 2 }}>
                <Typography variant='subtitle2' color='info.main' gutterBottom>
                  권장사항
                </Typography>
                <List dense>
                  {recommendations.map((recommendation, index) => (
                    <ListItem key={index} sx={{ pl: 0 }}>
                      <ListItemIcon sx={{ minWidth: 32 }}>
                        <InfoIcon color='info' fontSize='small' />
                      </ListItemIcon>
                      <ListItemText
                        primary={recommendation}
                        primaryTypographyProps={{ variant: 'body2' }}
                      />
                    </ListItem>
                  ))}
                </List>
              </Box>
            )}

            {/* Success State */}
            {isEligible &&
              errorIssues.length === 0 &&
              warningIssues.length === 0 && (
                <Alert severity='success' icon={<CheckIcon />}>
                  모든 검증을 통과했습니다. 할당을 진행할 수 있습니다.
                </Alert>
              )}
          </Box>
        </Collapse>
      </CardContent>
    </Card>
  );
}

// ============================================================================
// ADDITIONAL VALIDATION DISPLAY COMPONENTS
// ============================================================================

/**
 * Employee Assignment Limit Display
 */
export function EmployeeAssignmentLimitDisplay({
  currentCount,
  maxCount = 5,
  employeeName,
}: {
  currentCount: number;
  maxCount?: number;
  employeeName?: string;
}) {
  const theme = useTheme();
  const utilizationRate = (currentCount / maxCount) * 100;

  const getColor = () => {
    if (utilizationRate >= 100) return theme.palette.error.main;
    if (utilizationRate >= 80) return theme.palette.warning.main;
    return theme.palette.success.main;
  };

  return (
    <Box sx={{ mb: 2 }}>
      <Typography variant='body2' gutterBottom>
        {employeeName ? `${employeeName}의 할당 현황` : '직원 할당 현황'}
      </Typography>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <LinearProgress
          variant='determinate'
          value={Math.min(utilizationRate, 100)}
          sx={{
            flexGrow: 1,
            height: 8,
            borderRadius: 1,
            backgroundColor: alpha(getColor(), 0.2),
            '& .MuiLinearProgress-bar': {
              backgroundColor: getColor(),
            },
          }}
        />
        <Typography variant='caption' sx={{ minWidth: 60, textAlign: 'right' }}>
          {currentCount}/{maxCount}
        </Typography>
      </Box>
    </Box>
  );
}

/**
 * Software License Utilization Display
 */
export function SoftwareLicenseUtilizationDisplay({
  currentUsage,
  maxLicenses,
  softwareName,
}: {
  currentUsage: number;
  maxLicenses: number;
  softwareName?: string;
}) {
  const theme = useTheme();
  const utilizationRate =
    maxLicenses > 0 ? (currentUsage / maxLicenses) * 100 : 0;

  const getColor = () => {
    if (utilizationRate >= 100) return theme.palette.error.main;
    if (utilizationRate >= 80) return theme.palette.warning.main;
    return theme.palette.success.main;
  };

  return (
    <Box sx={{ mb: 2 }}>
      <Typography variant='body2' gutterBottom>
        {softwareName
          ? `${softwareName} 라이선스 사용률`
          : '소프트웨어 라이선스 사용률'}
      </Typography>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <LinearProgress
          variant='determinate'
          value={Math.min(utilizationRate, 100)}
          sx={{
            flexGrow: 1,
            height: 8,
            borderRadius: 1,
            backgroundColor: alpha(getColor(), 0.2),
            '& .MuiLinearProgress-bar': {
              backgroundColor: getColor(),
            },
          }}
        />
        <Typography variant='caption' sx={{ minWidth: 80, textAlign: 'right' }}>
          {currentUsage}/{maxLicenses} ({utilizationRate.toFixed(1)}%)
        </Typography>
      </Box>
    </Box>
  );
}

// ============================================================================
// EXPORTS
// ============================================================================

export default AssignmentValidationStatus;
