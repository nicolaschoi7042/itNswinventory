/**
 * Import Error Dialog Component
 *
 * Displays detailed import errors and warnings with downloadable error reports
 */

import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Tabs,
  Tab,
  Alert,
  Chip,
  IconButton,
  Tooltip,
  TextField,
  InputAdornment,
  Collapse,
  Card,
  CardContent,
} from '@mui/material';
import {
  Download as DownloadIcon,
  Search as SearchIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import type {
  ImportError,
  ImportWarning,
  ImportResult,
} from '@/services/data-import.service';
import { createCSVExportService } from '@/services/csv-export.service';

// ============================================================================
// TYPES AND INTERFACES
// ============================================================================

interface ImportErrorDialogProps {
  open: boolean;
  onClose: () => void;
  importResult: ImportResult;
  title?: string;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

// ============================================================================
// TAB PANEL COMPONENT
// ============================================================================

const TabPanel: React.FC<TabPanelProps> = ({
  children,
  value,
  index,
  ...other
}) => {
  return (
    <div
      role='tabpanel'
      hidden={value !== index}
      id={`error-tabpanel-${index}`}
      aria-labelledby={`error-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
};

// ============================================================================
// IMPORT ERROR DIALOG COMPONENT
// ============================================================================

export const ImportErrorDialog: React.FC<ImportErrorDialogProps> = ({
  open,
  onClose,
  importResult,
  title = '가져오기 오류 및 경고',
}) => {
  const [tabValue, setTabValue] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());

  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleRowToggle = (index: number) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedRows(newExpanded);
  };

  const handleDownloadErrorReport = async () => {
    const csvService = createCSVExportService();

    // Prepare error data for export
    const errorData = importResult.errors.map(error => ({
      행번호: error.row,
      필드: error.field || '',
      오류메시지: error.message,
      오류코드: error.code,
      심각도: error.severity === 'error' ? '오류' : '경고',
      원본값: error.originalValue || '',
    }));

    const warningData = importResult.warnings.map(warning => ({
      행번호: warning.row,
      필드: warning.field || '',
      경고메시지: warning.message,
      원본값: warning.originalValue || '',
      변환된값: warning.transformedValue || '',
    }));

    // Export errors
    if (errorData.length > 0) {
      await csvService.exportToCSV(errorData, 'errors', {
        filename: `import_errors_${new Date().toISOString().split('T')[0]}.csv`,
        includeHeaders: true,
      });
    }

    // Export warnings separately if they exist
    if (warningData.length > 0) {
      await csvService.exportToCSV(warningData, 'warnings', {
        filename: `import_warnings_${new Date().toISOString().split('T')[0]}.csv`,
        includeHeaders: true,
      });
    }
  };

  // ============================================================================
  // FILTER FUNCTIONS
  // ============================================================================

  const filteredErrors = importResult.errors.filter(
    error =>
      !searchTerm ||
      error.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (error.field &&
        error.field.toLowerCase().includes(searchTerm.toLowerCase())) ||
      error.row.toString().includes(searchTerm)
  );

  const filteredWarnings = importResult.warnings.filter(
    warning =>
      !searchTerm ||
      warning.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (warning.field &&
        warning.field.toLowerCase().includes(searchTerm.toLowerCase())) ||
      warning.row.toString().includes(searchTerm)
  );

  // ============================================================================
  // RENDER METHODS
  // ============================================================================

  const renderErrorTable = (errors: ImportError[]) => (
    <TableContainer component={Paper} variant='outlined'>
      <Table size='small'>
        <TableHead>
          <TableRow>
            <TableCell width='80px'>행 번호</TableCell>
            <TableCell width='120px'>필드</TableCell>
            <TableCell>오류 메시지</TableCell>
            <TableCell width='100px'>심각도</TableCell>
            <TableCell width='120px'>오류 코드</TableCell>
            <TableCell width='50px'>상세</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {errors.map((error, index) => (
            <React.Fragment key={index}>
              <TableRow>
                <TableCell>{error.row}</TableCell>
                <TableCell>
                  {error.field && (
                    <Chip label={error.field} size='small' variant='outlined' />
                  )}
                </TableCell>
                <TableCell>{error.message}</TableCell>
                <TableCell>
                  <Chip
                    icon={
                      error.severity === 'error' ? (
                        <ErrorIcon />
                      ) : (
                        <WarningIcon />
                      )
                    }
                    label={error.severity === 'error' ? '오류' : '경고'}
                    color={error.severity === 'error' ? 'error' : 'warning'}
                    size='small'
                  />
                </TableCell>
                <TableCell>
                  <Typography
                    variant='caption'
                    sx={{ fontFamily: 'monospace' }}
                  >
                    {error.code}
                  </Typography>
                </TableCell>
                <TableCell>
                  {error.originalValue && (
                    <IconButton
                      size='small'
                      onClick={() => handleRowToggle(index)}
                    >
                      {expandedRows.has(index) ? (
                        <ExpandLessIcon />
                      ) : (
                        <ExpandMoreIcon />
                      )}
                    </IconButton>
                  )}
                </TableCell>
              </TableRow>
              {error.originalValue && (
                <TableRow>
                  <TableCell colSpan={6} sx={{ py: 0 }}>
                    <Collapse
                      in={expandedRows.has(index)}
                      timeout='auto'
                      unmountOnExit
                    >
                      <Box sx={{ py: 2 }}>
                        <Card variant='outlined'>
                          <CardContent>
                            <Typography variant='subtitle2' gutterBottom>
                              원본 데이터:
                            </Typography>
                            <Typography
                              variant='body2'
                              sx={{
                                fontFamily: 'monospace',
                                bgcolor: 'grey.100',
                                p: 1,
                                borderRadius: 1,
                              }}
                            >
                              {JSON.stringify(error.originalValue, null, 2)}
                            </Typography>
                          </CardContent>
                        </Card>
                      </Box>
                    </Collapse>
                  </TableCell>
                </TableRow>
              )}
            </React.Fragment>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );

  const renderWarningTable = (warnings: ImportWarning[]) => (
    <TableContainer component={Paper} variant='outlined'>
      <Table size='small'>
        <TableHead>
          <TableRow>
            <TableCell width='80px'>행 번호</TableCell>
            <TableCell width='120px'>필드</TableCell>
            <TableCell>경고 메시지</TableCell>
            <TableCell width='120px'>원본 값</TableCell>
            <TableCell width='120px'>변환된 값</TableCell>
            <TableCell width='50px'>상세</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {warnings.map((warning, index) => (
            <React.Fragment key={index}>
              <TableRow>
                <TableCell>{warning.row}</TableCell>
                <TableCell>
                  {warning.field && (
                    <Chip
                      label={warning.field}
                      size='small'
                      variant='outlined'
                    />
                  )}
                </TableCell>
                <TableCell>{warning.message}</TableCell>
                <TableCell>
                  <Typography variant='body2' sx={{ fontFamily: 'monospace' }}>
                    {warning.originalValue
                      ? String(warning.originalValue)
                      : '-'}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant='body2' sx={{ fontFamily: 'monospace' }}>
                    {warning.transformedValue
                      ? String(warning.transformedValue)
                      : '-'}
                  </Typography>
                </TableCell>
                <TableCell>
                  {(warning.originalValue || warning.transformedValue) && (
                    <IconButton
                      size='small'
                      onClick={() => handleRowToggle(index + 1000)} // Offset to avoid collision
                    >
                      {expandedRows.has(index + 1000) ? (
                        <ExpandLessIcon />
                      ) : (
                        <ExpandMoreIcon />
                      )}
                    </IconButton>
                  )}
                </TableCell>
              </TableRow>
              {(warning.originalValue || warning.transformedValue) && (
                <TableRow>
                  <TableCell colSpan={6} sx={{ py: 0 }}>
                    <Collapse
                      in={expandedRows.has(index + 1000)}
                      timeout='auto'
                      unmountOnExit
                    >
                      <Box sx={{ py: 2 }}>
                        <Card variant='outlined'>
                          <CardContent>
                            <Box sx={{ display: 'flex', gap: 2 }}>
                              {warning.originalValue && (
                                <Box sx={{ flex: 1 }}>
                                  <Typography variant='subtitle2' gutterBottom>
                                    원본 데이터:
                                  </Typography>
                                  <Typography
                                    variant='body2'
                                    sx={{
                                      fontFamily: 'monospace',
                                      bgcolor: 'error.light',
                                      color: 'error.contrastText',
                                      p: 1,
                                      borderRadius: 1,
                                    }}
                                  >
                                    {JSON.stringify(
                                      warning.originalValue,
                                      null,
                                      2
                                    )}
                                  </Typography>
                                </Box>
                              )}
                              {warning.transformedValue && (
                                <Box sx={{ flex: 1 }}>
                                  <Typography variant='subtitle2' gutterBottom>
                                    변환된 데이터:
                                  </Typography>
                                  <Typography
                                    variant='body2'
                                    sx={{
                                      fontFamily: 'monospace',
                                      bgcolor: 'success.light',
                                      color: 'success.contrastText',
                                      p: 1,
                                      borderRadius: 1,
                                    }}
                                  >
                                    {JSON.stringify(
                                      warning.transformedValue,
                                      null,
                                      2
                                    )}
                                  </Typography>
                                </Box>
                              )}
                            </Box>
                          </CardContent>
                        </Card>
                      </Box>
                    </Collapse>
                  </TableCell>
                </TableRow>
              )}
            </React.Fragment>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );

  const renderSummaryTab = () => (
    <Box>
      <Alert
        severity={importResult.success ? 'success' : 'error'}
        sx={{ mb: 3 }}
      >
        <Typography variant='h6' gutterBottom>
          가져오기 {importResult.success ? '완료' : '실패'}
        </Typography>
        <Typography>
          총 {importResult.totalRows}개 행 중 {importResult.successfulImports}개
          성공,
          {importResult.failedImports}개 실패
        </Typography>
      </Alert>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 2,
          mb: 3,
        }}
      >
        <Card>
          <CardContent sx={{ textAlign: 'center' }}>
            <Typography variant='h4' color='primary'>
              {importResult.totalRows}
            </Typography>
            <Typography variant='body2'>총 행 수</Typography>
          </CardContent>
        </Card>

        <Card>
          <CardContent sx={{ textAlign: 'center' }}>
            <Typography variant='h4' color='success.main'>
              {importResult.successfulImports}
            </Typography>
            <Typography variant='body2'>성공</Typography>
          </CardContent>
        </Card>

        <Card>
          <CardContent sx={{ textAlign: 'center' }}>
            <Typography variant='h4' color='error.main'>
              {importResult.failedImports}
            </Typography>
            <Typography variant='body2'>실패</Typography>
          </CardContent>
        </Card>

        <Card>
          <CardContent sx={{ textAlign: 'center' }}>
            <Typography variant='h4' color='warning.main'>
              {importResult.warnings.length}
            </Typography>
            <Typography variant='body2'>경고</Typography>
          </CardContent>
        </Card>
      </Box>

      {importResult.skippedRows.length > 0 && (
        <Alert severity='warning' sx={{ mb: 2 }}>
          <Typography variant='subtitle2' gutterBottom>
            건너뛴 행: {importResult.skippedRows.length}개
          </Typography>
          <Typography variant='body2'>
            행 번호: {importResult.skippedRows.slice(0, 20).join(', ')}
            {importResult.skippedRows.length > 20 &&
              ` ... 및 ${importResult.skippedRows.length - 20}개 더`}
          </Typography>
        </Alert>
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
      maxWidth='lg'
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
          <Typography variant='h5'>{title}</Typography>
          <IconButton onClick={onClose} edge='end'>
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        {/* Search Bar */}
        <Box sx={{ mb: 2 }}>
          <TextField
            fullWidth
            size='small'
            placeholder='행 번호, 필드명, 또는 메시지로 검색...'
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position='start'>
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
        </Box>

        {/* Tabs */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange}>
            <Tab
              label={`요약`}
              id='error-tab-0'
              aria-controls='error-tabpanel-0'
            />
            <Tab
              label={`오류 (${filteredErrors.length})`}
              id='error-tab-1'
              aria-controls='error-tabpanel-1'
              disabled={filteredErrors.length === 0}
            />
            <Tab
              label={`경고 (${filteredWarnings.length})`}
              id='error-tab-2'
              aria-controls='error-tabpanel-2'
              disabled={filteredWarnings.length === 0}
            />
          </Tabs>
        </Box>

        {/* Tab Panels */}
        <TabPanel value={tabValue} index={0}>
          {renderSummaryTab()}
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          {filteredErrors.length > 0 ? (
            renderErrorTable(filteredErrors)
          ) : (
            <Alert severity='success'>오류가 없습니다!</Alert>
          )}
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          {filteredWarnings.length > 0 ? (
            renderWarningTable(filteredWarnings)
          ) : (
            <Alert severity='success'>경고가 없습니다!</Alert>
          )}
        </TabPanel>
      </DialogContent>

      <DialogActions>
        <Box sx={{ display: 'flex', gap: 1 }}>
          {(importResult.errors.length > 0 ||
            importResult.warnings.length > 0) && (
            <Tooltip title='오류 및 경고 보고서를 CSV 파일로 다운로드'>
              <Button
                startIcon={<DownloadIcon />}
                onClick={handleDownloadErrorReport}
                variant='outlined'
              >
                오류 보고서 다운로드
              </Button>
            </Tooltip>
          )}
          <Button onClick={onClose} variant='contained'>
            닫기
          </Button>
        </Box>
      </DialogActions>
    </Dialog>
  );
};

export default ImportErrorDialog;
