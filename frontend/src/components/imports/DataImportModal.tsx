/**
 * Data Import Modal Component
 *
 * Comprehensive modal for importing data from CSV/Excel files
 * with preview, column mapping, validation, and progress tracking.
 */

import React, { useState, useCallback, useRef } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Grid,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  LinearProgress,
  Alert,
  AlertTitle,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Tooltip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Switch,
  FormControlLabel,
} from '@mui/material';
import {
  CloudUpload as UploadIcon,
  Preview as PreviewIcon,
  CheckCircle as CheckIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
  Download as DownloadIcon,
  Refresh as RefreshIcon,
  Close as CloseIcon,
  Visibility as ViewIcon,
  Settings as SettingsIcon,
} from '@mui/icons-material';
import { useDropzone } from 'react-dropzone';
import type {
  ImportDataType,
  ImportResult,
  ImportPreview,
  ImportProgress,
  ImportError,
  ImportValidationResult,
} from '@/services/data-import.service';
import { createDataImportService } from '@/services/data-import.service';

// ============================================================================
// TYPES AND INTERFACES
// ============================================================================

interface DataImportModalProps {
  open: boolean;
  onClose: () => void;
  onImportComplete: (result: ImportResult) => void;
  defaultDataType?: ImportDataType;
  title?: string;
}

interface ImportStep {
  label: string;
  description: string;
  completed: boolean;
  active: boolean;
}

// ============================================================================
// DATA IMPORT MODAL COMPONENT
// ============================================================================

export const DataImportModal: React.FC<DataImportModalProps> = ({
  open,
  onClose,
  onImportComplete,
  defaultDataType = 'employees',
  title = '데이터 가져오기',
}) => {
  // State management
  const [activeStep, setActiveStep] = useState(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dataType, setDataType] = useState<ImportDataType>(defaultDataType);
  const [preview, setPreview] = useState<ImportPreview | null>(null);
  const [columnMapping, setColumnMapping] = useState<Record<string, string>>(
    {}
  );
  const [importProgress, setImportProgress] = useState<ImportProgress | null>(
    null
  );
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [validationResults, setValidationResults] = useState<
    ImportValidationResult[]
  >([]);
  const [showPreviewDetails, setShowPreviewDetails] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const importService = useRef(
    createDataImportService(progress => {
      setImportProgress(progress);
    })
  );

  // Steps configuration
  const steps: ImportStep[] = [
    {
      label: '파일 선택',
      description: 'CSV 또는 Excel 파일을 선택하세요',
      completed: !!selectedFile,
      active: activeStep === 0,
    },
    {
      label: '데이터 유형 및 미리보기',
      description: '데이터 유형을 확인하고 미리보기를 확인하세요',
      completed: !!preview,
      active: activeStep === 1,
    },
    {
      label: '컬럼 매핑',
      description: '파일의 컬럼을 시스템 필드와 연결하세요',
      completed: Object.keys(columnMapping).length > 0,
      active: activeStep === 2,
    },
    {
      label: '검증 및 가져오기',
      description: '데이터를 검증하고 시스템에 가져옵니다',
      completed: !!importResult?.success,
      active: activeStep === 3,
    },
  ];

  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================

  const handleFileSelect = useCallback(async (files: File[]) => {
    const file = files[0];
    if (!file) return;

    setSelectedFile(file);
    setIsProcessing(true);

    try {
      const previewData = await importService.current.parseFileForPreview(file);
      setPreview(previewData);

      // Auto-set data type if detected
      if (previewData.detectedDataType) {
        setDataType(previewData.detectedDataType);
      }

      // Apply suggested mapping
      setColumnMapping(previewData.suggestedMapping);

      setActiveStep(1);
    } catch (error) {
      console.error('File preview failed:', error);
      alert(
        `파일 미리보기 실패: ${error instanceof Error ? error.message : '알 수 없는 오류'}`
      );
    } finally {
      setIsProcessing(false);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: handleFileSelect,
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': [
        '.xlsx',
      ],
      'application/vnd.ms-excel': ['.xls'],
    },
    maxFiles: 1,
    disabled: isProcessing,
  });

  const handleDataTypeChange = async (newDataType: ImportDataType) => {
    setDataType(newDataType);

    if (preview) {
      // Regenerate suggested mapping for new data type
      const config =
        importService.current.getImportConfigForDataType(newDataType);
      const newMapping: Record<string, string> = {};

      preview.headers.forEach(header => {
        const normalizedHeader = header.toLowerCase();
        const matchedColumn = config.columns.find(
          col =>
            normalizedHeader.includes(col.key.toLowerCase()) ||
            normalizedHeader.includes(col.label.toLowerCase())
        );

        if (matchedColumn) {
          newMapping[header] = matchedColumn.key;
        }
      });

      setColumnMapping(newMapping);
    }
  };

  const handleColumnMappingChange = (
    fileColumn: string,
    systemField: string
  ) => {
    setColumnMapping(prev => ({
      ...prev,
      [fileColumn]: systemField,
    }));
  };

  const handleStartImport = async () => {
    if (!selectedFile || !preview) return;

    setIsProcessing(true);
    setActiveStep(3);

    try {
      const result = await importService.current.importFromFile(
        selectedFile,
        dataType,
        columnMapping
      );

      setImportResult(result);
      setValidationResults(result.validationResults || []);

      if (result.success) {
        onImportComplete(result);
      }
    } catch (error) {
      console.error('Import failed:', error);
      alert(
        `가져오기 실패: ${error instanceof Error ? error.message : '알 수 없는 오류'}`
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClose = () => {
    // Reset all state
    setActiveStep(0);
    setSelectedFile(null);
    setPreview(null);
    setColumnMapping({});
    setImportProgress(null);
    setImportResult(null);
    setIsProcessing(false);
    setValidationResults([]);
    onClose();
  };

  const handleRetry = () => {
    setActiveStep(0);
    setImportResult(null);
    setImportProgress(null);
    setValidationResults([]);
  };

  // ============================================================================
  // RENDER METHODS
  // ============================================================================

  const renderFileUpload = () => (
    <Box>
      <Card>
        <CardContent>
          <Box
            {...getRootProps()}
            sx={{
              border: 2,
              borderColor: isDragActive ? 'primary.main' : 'grey.300',
              borderStyle: 'dashed',
              borderRadius: 2,
              p: 4,
              textAlign: 'center',
              cursor: 'pointer',
              bgcolor: isDragActive ? 'action.hover' : 'background.paper',
              transition: 'all 0.2s ease-in-out',
            }}
          >
            <input {...getInputProps()} />
            <UploadIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
            <Typography variant='h6' gutterBottom>
              {isDragActive
                ? '파일을 여기에 놓으세요'
                : '파일을 드래그하거나 클릭하여 선택하세요'}
            </Typography>
            <Typography variant='body2' color='text.secondary'>
              CSV 또는 Excel 파일만 지원됩니다 (최대 10MB)
            </Typography>
          </Box>

          {selectedFile && (
            <Box sx={{ mt: 2 }}>
              <Alert severity='success'>
                <AlertTitle>파일 선택됨</AlertTitle>
                {selectedFile.name} (
                {(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
              </Alert>
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );

  const renderDataTypeAndPreview = () => (
    <Box>
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <FormControl fullWidth>
            <InputLabel>데이터 유형</InputLabel>
            <Select
              value={dataType}
              onChange={e =>
                handleDataTypeChange(e.target.value as ImportDataType)
              }
              label='데이터 유형'
            >
              <MenuItem value='employees'>직원 데이터</MenuItem>
              <MenuItem value='hardware'>하드웨어 자산</MenuItem>
              <MenuItem value='software'>소프트웨어 라이선스</MenuItem>
              <MenuItem value='assignments'>자산 할당</MenuItem>
              <MenuItem value='users'>사용자 계정</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12} md={8}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant='h6'>파일 미리보기</Typography>
            {preview && (
              <Chip
                label={`${preview.estimatedRows}개 행`}
                color='primary'
                size='small'
              />
            )}
            <IconButton
              onClick={() => setShowPreviewDetails(!showPreviewDetails)}
              size='small'
            >
              <ViewIcon />
            </IconButton>
          </Box>
        </Grid>
      </Grid>

      {preview && (
        <Box sx={{ mt: 3 }}>
          {/* Issues Alert */}
          {preview.issues.length > 0 && (
            <Alert severity='warning' sx={{ mb: 2 }}>
              <AlertTitle>발견된 문제점</AlertTitle>
              <List dense>
                {preview.issues.map((issue, index) => (
                  <ListItem key={index}>
                    <ListItemIcon>
                      <WarningIcon color='warning' fontSize='small' />
                    </ListItemIcon>
                    <ListItemText primary={issue.message} />
                  </ListItem>
                ))}
              </List>
            </Alert>
          )}

          {/* Preview Table */}
          <Card>
            <CardContent>
              <Typography variant='subtitle1' gutterBottom>
                데이터 미리보기 (처음 5개 행)
              </Typography>

              <TableContainer component={Paper} variant='outlined'>
                <Table size='small'>
                  <TableHead>
                    <TableRow>
                      {preview.headers.map((header, index) => (
                        <TableCell key={index} sx={{ fontWeight: 'bold' }}>
                          {header}
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {preview.sampleData.slice(0, 5).map((row, rowIndex) => (
                      <TableRow key={rowIndex}>
                        {row.map((cell, cellIndex) => (
                          <TableCell key={cellIndex}>
                            {String(cell || '')}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Box>
      )}
    </Box>
  );

  const renderColumnMapping = () => {
    if (!preview) return null;

    const config = importService.current.getImportConfigForDataType(dataType);

    return (
      <Box>
        <Typography variant='h6' gutterBottom>
          컬럼 매핑 설정
        </Typography>
        <Typography variant='body2' color='text.secondary' gutterBottom>
          파일의 각 컬럼을 시스템 필드와 연결하세요. 필수 필드는 반드시
          매핑되어야 합니다.
        </Typography>

        <Grid container spacing={2} sx={{ mt: 2 }}>
          {preview.headers.map((header, index) => (
            <Grid item xs={12} md={6} key={index}>
              <Card variant='outlined'>
                <CardContent sx={{ p: 2 }}>
                  <Typography variant='subtitle2' gutterBottom>
                    파일 컬럼: <strong>{header}</strong>
                  </Typography>

                  <FormControl fullWidth size='small'>
                    <InputLabel>시스템 필드</InputLabel>
                    <Select
                      value={columnMapping[header] || ''}
                      onChange={e =>
                        handleColumnMappingChange(header, e.target.value)
                      }
                      label='시스템 필드'
                    >
                      <MenuItem value=''>
                        <em>매핑하지 않음</em>
                      </MenuItem>
                      {config.columns.map(column => (
                        <MenuItem key={column.key} value={column.key}>
                          {column.label}
                          {config.requiredFields.includes(column.key) && (
                            <Chip
                              label='필수'
                              size='small'
                              color='error'
                              sx={{ ml: 1 }}
                            />
                          )}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  {/* Show sample data */}
                  {preview.sampleData.length > 0 && (
                    <Box sx={{ mt: 1 }}>
                      <Typography variant='caption' color='text.secondary'>
                        샘플 데이터: {preview.sampleData[0][index] || '(빈 값)'}
                      </Typography>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Mapping Summary */}
        <Box sx={{ mt: 3 }}>
          <Typography variant='subtitle1' gutterBottom>
            매핑 요약
          </Typography>

          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Alert severity='info'>
                <AlertTitle>매핑된 필드</AlertTitle>
                {
                  Object.entries(columnMapping).filter(([_, value]) => value)
                    .length
                }
                개 / {preview.headers.length}개 컬럼
              </Alert>
            </Grid>

            <Grid item xs={12} md={6}>
              {config.requiredFields.some(
                field => !Object.values(columnMapping).includes(field)
              ) ? (
                <Alert severity='warning'>
                  <AlertTitle>누락된 필수 필드</AlertTitle>
                  {config.requiredFields
                    .filter(
                      field => !Object.values(columnMapping).includes(field)
                    )
                    .join(', ')}
                </Alert>
              ) : (
                <Alert severity='success'>
                  <AlertTitle>필수 필드 완료</AlertTitle>
                  모든 필수 필드가 매핑되었습니다.
                </Alert>
              )}
            </Grid>
          </Grid>
        </Box>
      </Box>
    );
  };

  const renderImportProgress = () => (
    <Box>
      {importProgress && (
        <Box sx={{ mb: 3 }}>
          <Typography variant='h6' gutterBottom>
            가져오기 진행 상황
          </Typography>

          <Box sx={{ mb: 2 }}>
            <Typography variant='body2' color='text.secondary'>
              {importProgress.message}
            </Typography>
            <LinearProgress
              variant='determinate'
              value={importProgress.progress}
              sx={{ mt: 1 }}
            />
            <Typography variant='caption' sx={{ mt: 1, display: 'block' }}>
              {importProgress.progress.toFixed(1)}% 완료
            </Typography>
          </Box>
        </Box>
      )}

      {importResult && (
        <Box>
          <Typography variant='h6' gutterBottom>
            가져오기 결과
          </Typography>

          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} md={3}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography variant='h4' color='primary'>
                    {importResult.totalRows}
                  </Typography>
                  <Typography variant='body2'>총 행 수</Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={3}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography variant='h4' color='success.main'>
                    {importResult.successfulImports}
                  </Typography>
                  <Typography variant='body2'>성공</Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={3}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography variant='h4' color='error.main'>
                    {importResult.failedImports}
                  </Typography>
                  <Typography variant='body2'>실패</Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={3}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography variant='h4' color='warning.main'>
                    {importResult.warnings.length}
                  </Typography>
                  <Typography variant='body2'>경고</Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Errors and Warnings */}
          {importResult.errors.length > 0 && (
            <Alert severity='error' sx={{ mb: 2 }}>
              <AlertTitle>오류 ({importResult.errors.length}개)</AlertTitle>
              <List dense>
                {importResult.errors.slice(0, 5).map((error, index) => (
                  <ListItem key={index}>
                    <ListItemText
                      primary={`행 ${error.row}: ${error.message}`}
                      secondary={error.field && `필드: ${error.field}`}
                    />
                  </ListItem>
                ))}
                {importResult.errors.length > 5 && (
                  <ListItem>
                    <ListItemText
                      primary={`... 및 ${importResult.errors.length - 5}개 추가 오류`}
                    />
                  </ListItem>
                )}
              </List>
            </Alert>
          )}

          {importResult.warnings.length > 0 && (
            <Alert severity='warning' sx={{ mb: 2 }}>
              <AlertTitle>경고 ({importResult.warnings.length}개)</AlertTitle>
              <List dense>
                {importResult.warnings.slice(0, 3).map((warning, index) => (
                  <ListItem key={index}>
                    <ListItemText
                      primary={`행 ${warning.row}: ${warning.message}`}
                      secondary={warning.field && `필드: ${warning.field}`}
                    />
                  </ListItem>
                ))}
                {importResult.warnings.length > 3 && (
                  <ListItem>
                    <ListItemText
                      primary={`... 및 ${importResult.warnings.length - 3}개 추가 경고`}
                    />
                  </ListItem>
                )}
              </List>
            </Alert>
          )}

          {importResult.success ? (
            <Alert severity='success'>
              <AlertTitle>가져오기 완료</AlertTitle>
              {importResult.successfulImports}개의 데이터가 성공적으로
              가져와졌습니다.
            </Alert>
          ) : (
            <Alert severity='error'>
              <AlertTitle>가져오기 실패</AlertTitle>
              일부 데이터에서 오류가 발생했습니다. 오류를 수정한 후 다시
              시도해주세요.
            </Alert>
          )}
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
      onClose={handleClose}
      maxWidth='lg'
      fullWidth
      PaperProps={{
        sx: { height: '90vh' },
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
          <IconButton onClick={handleClose} edge='end'>
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        <Stepper activeStep={activeStep} orientation='vertical'>
          <Step>
            <StepLabel>파일 선택</StepLabel>
            <StepContent>
              {renderFileUpload()}
              <Box sx={{ mt: 2 }}>
                <Button
                  variant='contained'
                  onClick={() => setActiveStep(1)}
                  disabled={!selectedFile || isProcessing}
                >
                  다음
                </Button>
              </Box>
            </StepContent>
          </Step>

          <Step>
            <StepLabel>데이터 유형 및 미리보기</StepLabel>
            <StepContent>
              {renderDataTypeAndPreview()}
              <Box sx={{ mt: 2 }}>
                <Button
                  variant='contained'
                  onClick={() => setActiveStep(2)}
                  disabled={!preview || isProcessing}
                  sx={{ mr: 1 }}
                >
                  다음
                </Button>
                <Button onClick={() => setActiveStep(0)}>이전</Button>
              </Box>
            </StepContent>
          </Step>

          <Step>
            <StepLabel>컬럼 매핑</StepLabel>
            <StepContent>
              {renderColumnMapping()}
              <Box sx={{ mt: 2 }}>
                <Button
                  variant='contained'
                  onClick={handleStartImport}
                  disabled={
                    isProcessing || Object.keys(columnMapping).length === 0
                  }
                  sx={{ mr: 1 }}
                >
                  가져오기 시작
                </Button>
                <Button onClick={() => setActiveStep(1)}>이전</Button>
              </Box>
            </StepContent>
          </Step>

          <Step>
            <StepLabel>검증 및 가져오기</StepLabel>
            <StepContent>
              {renderImportProgress()}
              {importResult && (
                <Box sx={{ mt: 2 }}>
                  {importResult.success ? (
                    <Button
                      variant='contained'
                      color='success'
                      onClick={handleClose}
                    >
                      완료
                    </Button>
                  ) : (
                    <Box>
                      <Button
                        variant='contained'
                        onClick={handleRetry}
                        sx={{ mr: 1 }}
                      >
                        다시 시도
                      </Button>
                      <Button onClick={handleClose}>취소</Button>
                    </Box>
                  )}
                </Box>
              )}
            </StepContent>
          </Step>
        </Stepper>
      </DialogContent>
    </Dialog>
  );
};

export default DataImportModal;
