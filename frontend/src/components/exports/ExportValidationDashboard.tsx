/**
 * Export Validation Dashboard Component
 *
 * Displays export validation results, data quality metrics, and integrity checks
 */

import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  LinearProgress,
  Grid,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Tooltip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Badge,
  CircularProgress,
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  Refresh as RefreshIcon,
  Download as DownloadIcon,
  Assessment as AssessmentIcon,
  Security as SecurityIcon,
  Speed as SpeedIcon,
  DataUsage as DataUsageIcon,
  Timeline as TimelineIcon,
  BugReport as BugReportIcon,
} from '@mui/icons-material';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from 'recharts';
import { exportValidationService } from '@/services/export-validation.service';

// ============================================================================
// TYPES AND INTERFACES
// ============================================================================

interface ExportValidationDashboardProps {
  className?: string;
}

interface ValidationSummary {
  totalValidations: number;
  passedValidations: number;
  failedValidations: number;
  warningsCount: number;
  dataQualityAverage: number;
  recentValidations: ValidationHistory[];
}

interface ValidationHistory {
  id: string;
  dataType: string;
  timestamp: Date;
  recordCount: number;
  isValid: boolean;
  qualityScore: number;
  errorCount: number;
  warningCount: number;
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export const ExportValidationDashboard: React.FC<
  ExportValidationDashboardProps
> = ({ className }) => {
  // ============================================================================
  // STATE MANAGEMENT
  // ============================================================================

  const [summary, setSummary] = useState<ValidationSummary | null>(null);
  const [retryQueueStatus, setRetryQueueStatus] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [selectedValidation, setSelectedValidation] =
    useState<ValidationHistory | null>(null);
  const [validationDetailsOpen, setValidationDetailsOpen] = useState(false);

  // ============================================================================
  // LIFECYCLE HOOKS
  // ============================================================================

  useEffect(() => {
    loadDashboardData();

    // Set up periodic refresh
    const interval = setInterval(loadDashboardData, 30000); // Every 30 seconds

    return () => clearInterval(interval);
  }, []);

  // ============================================================================
  // DATA LOADING
  // ============================================================================

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      // Load validation summary (mock data for now)
      const mockSummary: ValidationSummary = {
        totalValidations: 156,
        passedValidations: 142,
        failedValidations: 14,
        warningsCount: 23,
        dataQualityAverage: 87.5,
        recentValidations: generateMockValidationHistory(),
      };

      setSummary(mockSummary);

      // Load retry queue status
      const queueStatus = exportValidationService.getRetryQueueStatus();
      setRetryQueueStatus(queueStatus);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateMockValidationHistory = (): ValidationHistory[] => {
    const dataTypes = ['hardware', 'software', 'employees', 'assignments'];
    const history: ValidationHistory[] = [];

    for (let i = 0; i < 10; i++) {
      history.push({
        id: `validation_${i}`,
        dataType: dataTypes[Math.floor(Math.random() * dataTypes.length)],
        timestamp: new Date(Date.now() - i * 86400000), // i days ago
        recordCount: Math.floor(Math.random() * 1000) + 100,
        isValid: Math.random() > 0.1, // 90% success rate
        qualityScore: Math.floor(Math.random() * 30) + 70, // 70-100
        errorCount: Math.floor(Math.random() * 5),
        warningCount: Math.floor(Math.random() * 10),
      });
    }

    return history.sort(
      (a, b) => b.timestamp.getTime() - a.timestamp.getTime()
    );
  };

  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================

  const handleValidationClick = (validation: ValidationHistory) => {
    setSelectedValidation(validation);
    setValidationDetailsOpen(true);
  };

  const handleRefresh = () => {
    loadDashboardData();
  };

  const handleRetryProcessing = async () => {
    try {
      setLoading(true);
      await exportValidationService.processRetryQueue();
      await loadDashboardData();
    } catch (error) {
      console.error('Error processing retry queue:', error);
    } finally {
      setLoading(false);
    }
  };

  // ============================================================================
  // UTILITY FUNCTIONS
  // ============================================================================

  const getQualityColor = (score: number): string => {
    if (score >= 90) return '#4caf50'; // green
    if (score >= 75) return '#ff9800'; // orange
    if (score >= 60) return '#f44336'; // red
    return '#9e9e9e'; // grey
  };

  const getQualityLabel = (score: number): string => {
    if (score >= 90) return 'Excellent';
    if (score >= 75) return 'Good';
    if (score >= 60) return 'Fair';
    return 'Poor';
  };

  // ============================================================================
  // RENDER METHODS
  // ============================================================================

  const renderSummaryCards = () => {
    if (!summary) return null;

    const successRate =
      summary.totalValidations > 0
        ? Math.round(
            (summary.passedValidations / summary.totalValidations) * 100
          )
        : 0;

    return (
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mb: 1,
                }}
              >
                <AssessmentIcon color='primary' sx={{ mr: 1 }} />
                <Typography variant='h4' color='primary'>
                  {summary.totalValidations}
                </Typography>
              </Box>
              <Typography variant='body2'>Total Validations</Typography>
              <Typography variant='caption' color='text.secondary'>
                Last 30 days
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mb: 1,
                }}
              >
                <CheckCircleIcon color='success' sx={{ mr: 1 }} />
                <Typography variant='h4' color='success.main'>
                  {successRate}%
                </Typography>
              </Box>
              <Typography variant='body2'>Success Rate</Typography>
              <Typography variant='caption' color='text.secondary'>
                {summary.passedValidations}/{summary.totalValidations} passed
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mb: 1,
                }}
              >
                <SpeedIcon color='info' sx={{ mr: 1 }} />
                <Typography variant='h4' color='info.main'>
                  {summary.dataQualityAverage}%
                </Typography>
              </Box>
              <Typography variant='body2'>Avg Data Quality</Typography>
              <Typography variant='caption' color='text.secondary'>
                {getQualityLabel(summary.dataQualityAverage)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mb: 1,
                }}
              >
                <WarningIcon color='warning' sx={{ mr: 1 }} />
                <Typography variant='h4' color='warning.main'>
                  {summary.warningsCount}
                </Typography>
              </Box>
              <Typography variant='body2'>Active Warnings</Typography>
              <Typography variant='caption' color='text.secondary'>
                Requires attention
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    );
  };

  const renderQualityDistribution = () => {
    if (!summary) return null;

    const data = summary.recentValidations.reduce(
      (acc, validation) => {
        const range = Math.floor(validation.qualityScore / 10) * 10;
        const key = `${range}-${range + 9}%`;
        acc[key] = (acc[key] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    const chartData = Object.entries(data).map(([range, count]) => ({
      range,
      count,
      percentage: Math.round((count / summary.recentValidations.length) * 100),
    }));

    return (
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant='h6' gutterBottom>
            Data Quality Distribution
          </Typography>
          <ResponsiveContainer width='100%' height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray='3 3' />
              <XAxis dataKey='range' />
              <YAxis />
              <RechartsTooltip />
              <Bar dataKey='count' fill='#1976d2' />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    );
  };

  const renderValidationTrend = () => {
    if (!summary) return null;

    const trendData = summary.recentValidations
      .slice(-7) // Last 7 validations
      .map((validation, index) => ({
        day: `Day ${index + 1}`,
        quality: validation.qualityScore,
        errors: validation.errorCount,
        warnings: validation.warningCount,
      }));

    return (
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant='h6' gutterBottom>
            Validation Trend (Last 7 Days)
          </Typography>
          <ResponsiveContainer width='100%' height={300}>
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray='3 3' />
              <XAxis dataKey='day' />
              <YAxis />
              <RechartsTooltip />
              <Line
                type='monotone'
                dataKey='quality'
                stroke='#4caf50'
                name='Quality Score'
              />
              <Line
                type='monotone'
                dataKey='errors'
                stroke='#f44336'
                name='Errors'
              />
              <Line
                type='monotone'
                dataKey='warnings'
                stroke='#ff9800'
                name='Warnings'
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    );
  };

  const renderRetryQueue = () => {
    if (!retryQueueStatus) return null;

    return (
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              mb: 2,
            }}
          >
            <Typography variant='h6'>Retry Queue Status</Typography>
            <Button
              variant='outlined'
              startIcon={<RefreshIcon />}
              onClick={handleRetryProcessing}
              disabled={loading}
            >
              Process Queue
            </Button>
          </Box>

          <Grid container spacing={2}>
            <Grid item xs={6} sm={3}>
              <Box
                sx={{
                  textAlign: 'center',
                  p: 2,
                  bgcolor: 'warning.light',
                  borderRadius: 1,
                }}
              >
                <Typography variant='h4' color='warning.contrastText'>
                  {retryQueueStatus.pending}
                </Typography>
                <Typography variant='body2' color='warning.contrastText'>
                  Pending
                </Typography>
              </Box>
            </Grid>

            <Grid item xs={6} sm={3}>
              <Box
                sx={{
                  textAlign: 'center',
                  p: 2,
                  bgcolor: 'info.light',
                  borderRadius: 1,
                }}
              >
                <Typography variant='h4' color='info.contrastText'>
                  {retryQueueStatus.processing}
                </Typography>
                <Typography variant='body2' color='info.contrastText'>
                  Processing
                </Typography>
              </Box>
            </Grid>

            <Grid item xs={6} sm={3}>
              <Box
                sx={{
                  textAlign: 'center',
                  p: 2,
                  bgcolor: 'success.light',
                  borderRadius: 1,
                }}
              >
                <Typography variant='h4' color='success.contrastText'>
                  {retryQueueStatus.completed}
                </Typography>
                <Typography variant='body2' color='success.contrastText'>
                  Completed
                </Typography>
              </Box>
            </Grid>

            <Grid item xs={6} sm={3}>
              <Box
                sx={{
                  textAlign: 'center',
                  p: 2,
                  bgcolor: 'error.light',
                  borderRadius: 1,
                }}
              >
                <Typography variant='h4' color='error.contrastText'>
                  {retryQueueStatus.failed}
                </Typography>
                <Typography variant='body2' color='error.contrastText'>
                  Failed
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    );
  };

  const renderRecentValidations = () => {
    if (!summary) return null;

    return (
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant='h6' gutterBottom>
            Recent Validations
          </Typography>

          <TableContainer component={Paper} variant='outlined'>
            <Table size='small'>
              <TableHead>
                <TableRow>
                  <TableCell>Data Type</TableCell>
                  <TableCell>Timestamp</TableCell>
                  <TableCell>Records</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Quality</TableCell>
                  <TableCell>Issues</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {summary.recentValidations.map(validation => (
                  <TableRow
                    key={validation.id}
                    sx={{
                      '&:hover': { bgcolor: 'action.hover', cursor: 'pointer' },
                      bgcolor: validation.isValid
                        ? 'transparent'
                        : 'error.light',
                    }}
                    onClick={() => handleValidationClick(validation)}
                  >
                    <TableCell>
                      <Chip
                        label={validation.dataType}
                        size='small'
                        variant='outlined'
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant='body2'>
                        {validation.timestamp.toLocaleDateString()}
                      </Typography>
                      <Typography variant='caption' color='text.secondary'>
                        {validation.timestamp.toLocaleTimeString()}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {validation.recordCount.toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <Chip
                        icon={
                          validation.isValid ? (
                            <CheckCircleIcon />
                          ) : (
                            <ErrorIcon />
                          )
                        }
                        label={validation.isValid ? 'Valid' : 'Invalid'}
                        color={validation.isValid ? 'success' : 'error'}
                        size='small'
                      />
                    </TableCell>
                    <TableCell>
                      <Box
                        sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                      >
                        <LinearProgress
                          variant='determinate'
                          value={validation.qualityScore}
                          sx={{
                            width: 60,
                            '& .MuiLinearProgress-bar': {
                              backgroundColor: getQualityColor(
                                validation.qualityScore
                              ),
                            },
                          }}
                        />
                        <Typography variant='body2'>
                          {validation.qualityScore}%
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        {validation.errorCount > 0 && (
                          <Badge
                            badgeContent={validation.errorCount}
                            color='error'
                          >
                            <ErrorIcon fontSize='small' />
                          </Badge>
                        )}
                        {validation.warningCount > 0 && (
                          <Badge
                            badgeContent={validation.warningCount}
                            color='warning'
                          >
                            <WarningIcon fontSize='small' />
                          </Badge>
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Tooltip title='View Details'>
                        <IconButton size='small'>
                          <InfoIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    );
  };

  const renderValidationDetails = () => {
    if (!selectedValidation) return null;

    return (
      <Dialog
        open={validationDetailsOpen}
        onClose={() => setValidationDetailsOpen(false)}
        maxWidth='md'
        fullWidth
      >
        <DialogTitle>
          Validation Details - {selectedValidation.dataType}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={6}>
              <Typography variant='subtitle2'>Timestamp:</Typography>
              <Typography variant='body2'>
                {selectedValidation.timestamp.toLocaleString()}
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant='subtitle2'>Record Count:</Typography>
              <Typography variant='body2'>
                {selectedValidation.recordCount.toLocaleString()}
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant='subtitle2'>Quality Score:</Typography>
              <Typography variant='body2'>
                {selectedValidation.qualityScore}% (
                {getQualityLabel(selectedValidation.qualityScore)})
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant='subtitle2'>Status:</Typography>
              <Chip
                label={selectedValidation.isValid ? 'Valid' : 'Invalid'}
                color={selectedValidation.isValid ? 'success' : 'error'}
                size='small'
              />
            </Grid>
          </Grid>

          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography>Errors ({selectedValidation.errorCount})</Typography>
            </AccordionSummary>
            <AccordionDetails>
              {selectedValidation.errorCount > 0 ? (
                <List>
                  {/* Mock error list */}
                  <ListItem>
                    <ListItemIcon>
                      <ErrorIcon color='error' />
                    </ListItemIcon>
                    <ListItemText
                      primary="Missing required field 'asset_id'"
                      secondary="Row 15: Field 'asset_id' is required but not provided"
                    />
                  </ListItem>
                </List>
              ) : (
                <Typography color='text.secondary'>No errors found</Typography>
              )}
            </AccordionDetails>
          </Accordion>

          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography>
                Warnings ({selectedValidation.warningCount})
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              {selectedValidation.warningCount > 0 ? (
                <List>
                  {/* Mock warning list */}
                  <ListItem>
                    <ListItemIcon>
                      <WarningIcon color='warning' />
                    </ListItemIcon>
                    <ListItemText
                      primary='Potential duplicate record'
                      secondary='Row 42: Similar record found at row 23'
                    />
                  </ListItem>
                </List>
              ) : (
                <Typography color='text.secondary'>
                  No warnings found
                </Typography>
              )}
            </AccordionDetails>
          </Accordion>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setValidationDetailsOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    );
  };

  // ============================================================================
  // MAIN RENDER
  // ============================================================================

  return (
    <Box className={className}>
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 3,
        }}
      >
        <Typography variant='h4' component='h1'>
          Export Validation Dashboard
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Tooltip title='Refresh Data'>
            <IconButton onClick={handleRefresh} disabled={loading}>
              {loading ? <CircularProgress size={24} /> : <RefreshIcon />}
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Loading Indicator */}
      {loading && <LinearProgress sx={{ mb: 2 }} />}

      {/* Summary Cards */}
      {renderSummaryCards()}

      {/* Charts and Analysis */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={6}>
          {renderQualityDistribution()}
        </Grid>
        <Grid item xs={12} md={6}>
          {renderValidationTrend()}
        </Grid>
      </Grid>

      {/* Retry Queue Status */}
      {renderRetryQueue()}

      {/* Recent Validations Table */}
      {renderRecentValidations()}

      {/* Validation Details Dialog */}
      {renderValidationDetails()}
    </Box>
  );
};

export default ExportValidationDashboard;
