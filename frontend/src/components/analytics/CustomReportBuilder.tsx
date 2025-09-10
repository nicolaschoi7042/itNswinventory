/**
 * Custom Report Builder Component
 *
 * Advanced interface for building custom reports with filtering,
 * grouping, aggregations, and visualization options.
 */

import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Chip,
  Grid,
  Paper,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Tooltip,
  Switch,
  FormControlLabel,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  ExpandMore as ExpandMoreIcon,
  Preview as PreviewIcon,
  Save as SaveIcon,
  Download as DownloadIcon,
  Settings as SettingsIcon,
  BarChart as ChartIcon,
  FilterList as FilterIcon,
  Group as GroupIcon,
  Functions as AggregateIcon,
} from '@mui/icons-material';
import type {
  CustomReportConfig,
  ReportFilter,
  ReportAggregation,
  ReportChart,
  AnalyticsData,
  ExportFormat,
} from '@/services/analytics.service';
import { createAnalyticsService } from '@/services/analytics.service';

// ============================================================================
// TYPES AND INTERFACES
// ============================================================================

interface CustomReportBuilderProps {
  open: boolean;
  onClose: () => void;
  data: AnalyticsData;
  onReportGenerated: (result: any) => void;
  initialConfig?: Partial<CustomReportConfig>;
}

interface DataTypeField {
  name: string;
  label: string;
  type: 'string' | 'number' | 'date' | 'boolean';
  dataType: string;
}

// ============================================================================
// FIELD DEFINITIONS
// ============================================================================

const DATA_TYPE_FIELDS: Record<string, DataTypeField[]> = {
  employees: [
    { name: 'id', label: 'ID', type: 'string', dataType: 'employees' },
    { name: 'name', label: '이름', type: 'string', dataType: 'employees' },
    { name: 'email', label: '이메일', type: 'string', dataType: 'employees' },
    {
      name: 'department',
      label: '부서',
      type: 'string',
      dataType: 'employees',
    },
    { name: 'position', label: '직급', type: 'string', dataType: 'employees' },
    { name: 'joinDate', label: '입사일', type: 'date', dataType: 'employees' },
    { name: 'status', label: '상태', type: 'string', dataType: 'employees' },
  ],
  hardware: [
    { name: 'id', label: 'ID', type: 'string', dataType: 'hardware' },
    {
      name: 'assetTag',
      label: '자산태그',
      type: 'string',
      dataType: 'hardware',
    },
    { name: 'type', label: '유형', type: 'string', dataType: 'hardware' },
    { name: 'brand', label: '브랜드', type: 'string', dataType: 'hardware' },
    { name: 'model', label: '모델', type: 'string', dataType: 'hardware' },
    { name: 'status', label: '상태', type: 'string', dataType: 'hardware' },
    { name: 'location', label: '위치', type: 'string', dataType: 'hardware' },
    {
      name: 'purchaseDate',
      label: '구매일',
      type: 'date',
      dataType: 'hardware',
    },
    {
      name: 'warrantyExpiry',
      label: '보증만료일',
      type: 'date',
      dataType: 'hardware',
    },
    { name: 'price', label: '가격', type: 'number', dataType: 'hardware' },
  ],
  software: [
    { name: 'id', label: 'ID', type: 'string', dataType: 'software' },
    {
      name: 'name',
      label: '소프트웨어명',
      type: 'string',
      dataType: 'software',
    },
    { name: 'vendor', label: '제조사', type: 'string', dataType: 'software' },
    {
      name: 'licenseType',
      label: '라이선스유형',
      type: 'string',
      dataType: 'software',
    },
    {
      name: 'totalLicenses',
      label: '총라이선스',
      type: 'number',
      dataType: 'software',
    },
    {
      name: 'usedLicenses',
      label: '사용라이선스',
      type: 'number',
      dataType: 'software',
    },
    { name: 'price', label: '가격', type: 'number', dataType: 'software' },
    {
      name: 'purchaseDate',
      label: '구매일',
      type: 'date',
      dataType: 'software',
    },
    { name: 'expiryDate', label: '만료일', type: 'date', dataType: 'software' },
  ],
  assignments: [
    { name: 'id', label: 'ID', type: 'string', dataType: 'assignments' },
    {
      name: 'employeeName',
      label: '직원명',
      type: 'string',
      dataType: 'assignments',
    },
    {
      name: 'assetType',
      label: '자산유형',
      type: 'string',
      dataType: 'assignments',
    },
    {
      name: 'assetName',
      label: '자산명',
      type: 'string',
      dataType: 'assignments',
    },
    { name: 'status', label: '상태', type: 'string', dataType: 'assignments' },
    {
      name: 'assignedDate',
      label: '할당일',
      type: 'date',
      dataType: 'assignments',
    },
    {
      name: 'returnedDate',
      label: '반납일',
      type: 'date',
      dataType: 'assignments',
    },
  ],
  users: [
    { name: 'username', label: '사용자명', type: 'string', dataType: 'users' },
    { name: 'fullName', label: '이름', type: 'string', dataType: 'users' },
    { name: 'role', label: '역할', type: 'string', dataType: 'users' },
    { name: 'department', label: '부서', type: 'string', dataType: 'users' },
    { name: 'status', label: '상태', type: 'string', dataType: 'users' },
    {
      name: 'lastLogin',
      label: '마지막로그인',
      type: 'date',
      dataType: 'users',
    },
  ],
};

// ============================================================================
// CUSTOM REPORT BUILDER COMPONENT
// ============================================================================

export const CustomReportBuilder: React.FC<CustomReportBuilderProps> = ({
  open,
  onClose,
  data,
  onReportGenerated,
  initialConfig,
}) => {
  // State management
  const [activeStep, setActiveStep] = useState(0);
  const [config, setConfig] = useState<CustomReportConfig>({
    title: '',
    description: '',
    dataTypes: [],
    filters: [],
    groupBy: [],
    aggregations: [],
    charts: [],
    format: 'excel',
    includeInsights: true,
    ...initialConfig,
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [showPreview, setShowPreview] = useState(false);

  const analyticsService = createAnalyticsService();

  // Available fields based on selected data types
  const availableFields: DataTypeField[] = config.dataTypes.flatMap(
    dataType => DATA_TYPE_FIELDS[dataType] || []
  );

  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================

  const handleConfigChange = (updates: Partial<CustomReportConfig>) => {
    setConfig(prev => ({ ...prev, ...updates }));
  };

  const handleDataTypeToggle = (dataType: string) => {
    const newDataTypes = config.dataTypes.includes(dataType)
      ? config.dataTypes.filter(dt => dt !== dataType)
      : [...config.dataTypes, dataType];

    handleConfigChange({ dataTypes: newDataTypes });

    // Clear dependent configurations when data types change
    if (newDataTypes.length !== config.dataTypes.length) {
      handleConfigChange({
        filters: [],
        groupBy: [],
        aggregations: [],
        charts: [],
      });
    }
  };

  const handleAddFilter = () => {
    const newFilter: ReportFilter = {
      field: availableFields[0]?.name || '',
      operator: 'equals',
      value: '',
      dataType: availableFields[0]?.dataType || '',
    };

    handleConfigChange({
      filters: [...config.filters, newFilter],
    });
  };

  const handleUpdateFilter = (
    index: number,
    updates: Partial<ReportFilter>
  ) => {
    const newFilters = [...config.filters];
    newFilters[index] = { ...newFilters[index], ...updates };
    handleConfigChange({ filters: newFilters });
  };

  const handleRemoveFilter = (index: number) => {
    const newFilters = config.filters.filter((_, i) => i !== index);
    handleConfigChange({ filters: newFilters });
  };

  const handleAddAggregation = () => {
    const newAggregation: ReportAggregation = {
      field:
        availableFields.find(f => f.type === 'number')?.name ||
        availableFields[0]?.name ||
        '',
      operation: 'count',
      alias: '',
    };

    handleConfigChange({
      aggregations: [...config.aggregations, newAggregation],
    });
  };

  const handleUpdateAggregation = (
    index: number,
    updates: Partial<ReportAggregation>
  ) => {
    const newAggregations = [...config.aggregations];
    newAggregations[index] = { ...newAggregations[index], ...updates };
    handleConfigChange({ aggregations: newAggregations });
  };

  const handleRemoveAggregation = (index: number) => {
    const newAggregations = config.aggregations.filter((_, i) => i !== index);
    handleConfigChange({ aggregations: newAggregations });
  };

  const handleAddChart = () => {
    const newChart: ReportChart = {
      type: 'bar',
      title: '',
      xAxis: availableFields[0]?.name || '',
      yAxis:
        availableFields.find(f => f.type === 'number')?.name ||
        availableFields[0]?.name ||
        '',
      groupBy: '',
      aggregation: 'count',
    };

    handleConfigChange({
      charts: [...config.charts, newChart],
    });
  };

  const handleUpdateChart = (index: number, updates: Partial<ReportChart>) => {
    const newCharts = [...config.charts];
    newCharts[index] = { ...newCharts[index], ...updates };
    handleConfigChange({ charts: newCharts });
  };

  const handleRemoveChart = (index: number) => {
    const newCharts = config.charts.filter((_, i) => i !== index);
    handleConfigChange({ charts: newCharts });
  };

  const handleGeneratePreview = async () => {
    if (config.dataTypes.length === 0) {
      alert('데이터 유형을 선택해주세요.');
      return;
    }

    try {
      setIsGenerating(true);
      // Create a preview version of the config with limited data
      const previewConfig = {
        ...config,
        title: config.title || '미리보기 리포트',
      };

      const result = await analyticsService.generateCustomReport(
        data,
        previewConfig
      );
      if (result.success && result.importedData) {
        setPreviewData(result.importedData.slice(0, 10)); // Show first 10 rows
        setShowPreview(true);
      }
    } catch (error) {
      console.error('Preview generation failed:', error);
      alert('미리보기 생성에 실패했습니다.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateReport = async () => {
    if (!config.title.trim()) {
      alert('리포트 제목을 입력해주세요.');
      return;
    }

    if (config.dataTypes.length === 0) {
      alert('데이터 유형을 선택해주세요.');
      return;
    }

    try {
      setIsGenerating(true);
      const result = await analyticsService.generateCustomReport(data, config);
      onReportGenerated(result);
      onClose();
    } catch (error) {
      console.error('Report generation failed:', error);
      alert('리포트 생성에 실패했습니다.');
    } finally {
      setIsGenerating(false);
    }
  };

  // ============================================================================
  // RENDER METHODS
  // ============================================================================

  const renderBasicConfig = () => (
    <Box>
      <Typography variant='h6' gutterBottom>
        기본 설정
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <TextField
            label='리포트 제목'
            fullWidth
            value={config.title}
            onChange={e => handleConfigChange({ title: e.target.value })}
            required
          />
        </Grid>

        <Grid item xs={12}>
          <TextField
            label='설명 (선택사항)'
            fullWidth
            multiline
            rows={3}
            value={config.description}
            onChange={e => handleConfigChange({ description: e.target.value })}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <FormControl fullWidth>
            <InputLabel>출력 형식</InputLabel>
            <Select
              value={config.format}
              onChange={e =>
                handleConfigChange({ format: e.target.value as ExportFormat })
              }
              label='출력 형식'
            >
              <MenuItem value='excel'>Excel (.xlsx)</MenuItem>
              <MenuItem value='pdf'>PDF</MenuItem>
              <MenuItem value='csv'>CSV</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12} md={6}>
          <FormControlLabel
            control={
              <Switch
                checked={config.includeInsights}
                onChange={e =>
                  handleConfigChange({ includeInsights: e.target.checked })
                }
              />
            }
            label='인사이트 포함'
          />
        </Grid>
      </Grid>
    </Box>
  );

  const renderDataTypeSelection = () => (
    <Box>
      <Typography variant='h6' gutterBottom>
        데이터 유형 선택
      </Typography>
      <Typography variant='body2' color='text.secondary' gutterBottom>
        리포트에 포함할 데이터 유형을 선택하세요.
      </Typography>

      <Grid container spacing={2} sx={{ mt: 1 }}>
        {Object.entries(DATA_TYPE_FIELDS).map(([dataType, fields]) => (
          <Grid item xs={12} sm={6} md={4} key={dataType}>
            <Card
              variant={
                config.dataTypes.includes(dataType) ? 'elevation' : 'outlined'
              }
              sx={{
                cursor: 'pointer',
                border: config.dataTypes.includes(dataType) ? 2 : 1,
                borderColor: config.dataTypes.includes(dataType)
                  ? 'primary.main'
                  : 'divider',
              }}
              onClick={() => handleDataTypeToggle(dataType)}
            >
              <CardContent>
                <Typography variant='h6'>
                  {dataType === 'employees' && '직원'}
                  {dataType === 'hardware' && '하드웨어'}
                  {dataType === 'software' && '소프트웨어'}
                  {dataType === 'assignments' && '자산 할당'}
                  {dataType === 'users' && '사용자'}
                </Typography>
                <Typography variant='body2' color='text.secondary'>
                  {fields.length}개 필드 사용 가능
                </Typography>
                {config.dataTypes.includes(dataType) && (
                  <Chip
                    label='선택됨'
                    color='primary'
                    size='small'
                    sx={{ mt: 1 }}
                  />
                )}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {config.dataTypes.length > 0 && (
        <Alert severity='info' sx={{ mt: 2 }}>
          선택된 데이터 유형:{' '}
          {config.dataTypes
            .map(dt => {
              const labels = {
                employees: '직원',
                hardware: '하드웨어',
                software: '소프트웨어',
                assignments: '자산 할당',
                users: '사용자',
              };
              return labels[dt as keyof typeof labels];
            })
            .join(', ')}
        </Alert>
      )}
    </Box>
  );

  const renderFiltersAndGrouping = () => (
    <Box>
      {/* Filters Section */}
      <Accordion defaultExpanded>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <FilterIcon />
            <Typography variant='h6'>필터 ({config.filters.length})</Typography>
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          {config.filters.map((filter, index) => (
            <Card key={index} variant='outlined' sx={{ mb: 2 }}>
              <CardContent>
                <Grid container spacing={2} alignItems='center'>
                  <Grid item xs={12} sm={3}>
                    <FormControl fullWidth size='small'>
                      <InputLabel>필드</InputLabel>
                      <Select
                        value={filter.field}
                        onChange={e =>
                          handleUpdateFilter(index, { field: e.target.value })
                        }
                        label='필드'
                      >
                        {availableFields.map(field => (
                          <MenuItem
                            key={`${field.dataType}.${field.name}`}
                            value={field.name}
                          >
                            {field.label} ({field.dataType})
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid item xs={12} sm={2}>
                    <FormControl fullWidth size='small'>
                      <InputLabel>조건</InputLabel>
                      <Select
                        value={filter.operator}
                        onChange={e =>
                          handleUpdateFilter(index, {
                            operator: e.target.value as any,
                          })
                        }
                        label='조건'
                      >
                        <MenuItem value='equals'>같음</MenuItem>
                        <MenuItem value='contains'>포함</MenuItem>
                        <MenuItem value='greaterThan'>큼</MenuItem>
                        <MenuItem value='lessThan'>작음</MenuItem>
                        <MenuItem value='between'>범위</MenuItem>
                        <MenuItem value='in'>목록에 포함</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      size='small'
                      fullWidth
                      label='값'
                      value={filter.value}
                      onChange={e =>
                        handleUpdateFilter(index, { value: e.target.value })
                      }
                    />
                  </Grid>

                  <Grid item xs={12} sm={1}>
                    <IconButton
                      onClick={() => handleRemoveFilter(index)}
                      color='error'
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          ))}

          <Button
            startIcon={<AddIcon />}
            onClick={handleAddFilter}
            disabled={availableFields.length === 0}
          >
            필터 추가
          </Button>
        </AccordionDetails>
      </Accordion>

      {/* Group By Section */}
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <GroupIcon />
            <Typography variant='h6'>
              그룹화 ({config.groupBy.length})
            </Typography>
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          <FormControl fullWidth>
            <InputLabel>그룹화 필드</InputLabel>
            <Select
              multiple
              value={config.groupBy}
              onChange={e =>
                handleConfigChange({ groupBy: e.target.value as string[] })
              }
              label='그룹화 필드'
              renderValue={selected => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {selected.map(value => (
                    <Chip
                      key={value}
                      label={
                        availableFields.find(f => f.name === value)?.label ||
                        value
                      }
                    />
                  ))}
                </Box>
              )}
            >
              {availableFields.map(field => (
                <MenuItem
                  key={`${field.dataType}.${field.name}`}
                  value={field.name}
                >
                  {field.label} ({field.dataType})
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </AccordionDetails>
      </Accordion>

      {/* Aggregations Section */}
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <AggregateIcon />
            <Typography variant='h6'>
              집계 ({config.aggregations.length})
            </Typography>
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          {config.aggregations.map((aggregation, index) => (
            <Card key={index} variant='outlined' sx={{ mb: 2 }}>
              <CardContent>
                <Grid container spacing={2} alignItems='center'>
                  <Grid item xs={12} sm={4}>
                    <FormControl fullWidth size='small'>
                      <InputLabel>필드</InputLabel>
                      <Select
                        value={aggregation.field}
                        onChange={e =>
                          handleUpdateAggregation(index, {
                            field: e.target.value,
                          })
                        }
                        label='필드'
                      >
                        {availableFields.map(field => (
                          <MenuItem
                            key={`${field.dataType}.${field.name}`}
                            value={field.name}
                          >
                            {field.label} ({field.dataType})
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid item xs={12} sm={3}>
                    <FormControl fullWidth size='small'>
                      <InputLabel>연산</InputLabel>
                      <Select
                        value={aggregation.operation}
                        onChange={e =>
                          handleUpdateAggregation(index, {
                            operation: e.target.value as any,
                          })
                        }
                        label='연산'
                      >
                        <MenuItem value='count'>개수</MenuItem>
                        <MenuItem value='sum'>합계</MenuItem>
                        <MenuItem value='avg'>평균</MenuItem>
                        <MenuItem value='min'>최소값</MenuItem>
                        <MenuItem value='max'>최대값</MenuItem>
                        <MenuItem value='distinct'>고유값 개수</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid item xs={12} sm={4}>
                    <TextField
                      size='small'
                      fullWidth
                      label='별칭 (선택사항)'
                      value={aggregation.alias || ''}
                      onChange={e =>
                        handleUpdateAggregation(index, {
                          alias: e.target.value,
                        })
                      }
                    />
                  </Grid>

                  <Grid item xs={12} sm={1}>
                    <IconButton
                      onClick={() => handleRemoveAggregation(index)}
                      color='error'
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          ))}

          <Button
            startIcon={<AddIcon />}
            onClick={handleAddAggregation}
            disabled={availableFields.length === 0}
          >
            집계 추가
          </Button>
        </AccordionDetails>
      </Accordion>
    </Box>
  );

  const renderPreview = () => (
    <Box>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 2,
        }}
      >
        <Typography variant='h6'>리포트 미리보기</Typography>
        <Button
          variant='outlined'
          startIcon={<PreviewIcon />}
          onClick={handleGeneratePreview}
          disabled={isGenerating || config.dataTypes.length === 0}
        >
          미리보기 새로고침
        </Button>
      </Box>

      {previewData.length > 0 ? (
        <TableContainer component={Paper} variant='outlined'>
          <Table size='small'>
            <TableHead>
              <TableRow>
                {Object.keys(previewData[0]).map(key => (
                  <TableCell key={key}>{key}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {previewData.slice(0, 5).map((row, index) => (
                <TableRow key={index}>
                  {Object.values(row).map((value, cellIndex) => (
                    <TableCell key={cellIndex}>{String(value || '')}</TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        <Alert severity='info'>
          미리보기를 보려면 위의 '미리보기 새로고침' 버튼을 클릭하세요.
        </Alert>
      )}
    </Box>
  );

  const steps = [
    {
      label: '기본 설정',
      content: renderBasicConfig(),
    },
    {
      label: '데이터 선택',
      content: renderDataTypeSelection(),
    },
    {
      label: '필터 및 그룹화',
      content: renderFiltersAndGrouping(),
    },
    {
      label: '미리보기 및 생성',
      content: renderPreview(),
    },
  ];

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
        sx: { height: '90vh' },
      }}
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <SettingsIcon />
          <Typography variant='h5'>커스텀 리포트 빌더</Typography>
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        <Stepper activeStep={activeStep} orientation='vertical'>
          {steps.map((step, index) => (
            <Step key={index}>
              <StepLabel>{step.label}</StepLabel>
              <StepContent>
                {step.content}
                <Box sx={{ mt: 3 }}>
                  <Button
                    variant='contained'
                    onClick={() => setActiveStep(index + 1)}
                    disabled={index === steps.length - 1}
                    sx={{ mr: 1 }}
                  >
                    {index === steps.length - 1 ? '완료' : '다음'}
                  </Button>
                  {index > 0 && (
                    <Button onClick={() => setActiveStep(index - 1)}>
                      이전
                    </Button>
                  )}
                </Box>
              </StepContent>
            </Step>
          ))}
        </Stepper>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>취소</Button>
        <Button
          variant='contained'
          startIcon={<DownloadIcon />}
          onClick={handleGenerateReport}
          disabled={
            isGenerating ||
            !config.title.trim() ||
            config.dataTypes.length === 0
          }
        >
          {isGenerating ? '생성 중...' : '리포트 생성'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CustomReportBuilder;
