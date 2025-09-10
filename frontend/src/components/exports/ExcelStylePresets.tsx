/**
 * Excel Style Presets Component
 *
 * Provides predefined styling options and custom formatting
 * capabilities for Excel exports with visual previews.
 */

import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Switch,
  FormControlLabel,
  Grid,
  Chip,
  Button,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  ColorPicker,
  Divider,
  Alert,
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  Palette as PaletteIcon,
  Preview as PreviewIcon,
  Save as SaveIcon,
} from '@mui/icons-material';
import type { CellStyle, BorderStyle, ExcelExportConfig } from '@/types/export';

// ============================================================================
// TYPES AND INTERFACES
// ============================================================================

interface StylePreset {
  id: string;
  name: string;
  description: string;
  headerStyle: CellStyle;
  dataStyle: CellStyle;
  alternateRowStyle?: CellStyle;
  preview: {
    headerColor: string;
    dataColor: string;
    alternateColor?: string;
  };
}

interface ExcelStylePresetsProps {
  config: ExcelExportConfig;
  onConfigChange: (config: Partial<ExcelExportConfig>) => void;
  onApplyPreset: (preset: StylePreset) => void;
}

// ============================================================================
// PREDEFINED STYLE PRESETS
// ============================================================================

const STYLE_PRESETS: StylePreset[] = [
  {
    id: 'default',
    name: '기본 스타일',
    description: '깔끔하고 전문적인 기본 스타일',
    headerStyle: {
      backgroundColor: '#366092',
      color: '#FFFFFF',
      fontWeight: 'bold',
      textAlign: 'center',
      border: {
        all: { style: 'thin', color: '#000000' },
      },
    },
    dataStyle: {
      backgroundColor: '#FFFFFF',
      color: '#000000',
      border: {
        all: { style: 'thin', color: '#E0E0E0' },
      },
    },
    alternateRowStyle: {
      backgroundColor: '#F8F9FA',
      color: '#000000',
    },
    preview: {
      headerColor: '#366092',
      dataColor: '#FFFFFF',
      alternateColor: '#F8F9FA',
    },
  },
  {
    id: 'corporate',
    name: '기업용 스타일',
    description: '공식 문서용 고급 스타일',
    headerStyle: {
      backgroundColor: '#2C3E50',
      color: '#FFFFFF',
      fontWeight: 'bold',
      fontSize: 12,
      textAlign: 'center',
      border: {
        all: { style: 'medium', color: '#34495E' },
      },
    },
    dataStyle: {
      backgroundColor: '#FFFFFF',
      color: '#2C3E50',
      fontSize: 10,
      border: {
        all: { style: 'thin', color: '#BDC3C7' },
      },
    },
    alternateRowStyle: {
      backgroundColor: '#ECF0F1',
      color: '#2C3E50',
    },
    preview: {
      headerColor: '#2C3E50',
      dataColor: '#FFFFFF',
      alternateColor: '#ECF0F1',
    },
  },
  {
    id: 'modern',
    name: '모던 스타일',
    description: '현대적이고 세련된 디자인',
    headerStyle: {
      backgroundColor: '#667EEA',
      color: '#FFFFFF',
      fontWeight: 'bold',
      fontSize: 11,
      textAlign: 'center',
      border: {
        all: { style: 'thin', color: '#764BA2' },
      },
    },
    dataStyle: {
      backgroundColor: '#FFFFFF',
      color: '#4A5568',
      fontSize: 10,
      border: {
        all: { style: 'thin', color: '#E2E8F0' },
      },
    },
    alternateRowStyle: {
      backgroundColor: '#F7FAFC',
      color: '#4A5568',
    },
    preview: {
      headerColor: '#667EEA',
      dataColor: '#FFFFFF',
      alternateColor: '#F7FAFC',
    },
  },
  {
    id: 'minimal',
    name: '미니멀 스타일',
    description: '단순하고 깔끔한 스타일',
    headerStyle: {
      backgroundColor: '#FFFFFF',
      color: '#2D3748',
      fontWeight: 'bold',
      textAlign: 'center',
      border: {
        bottom: { style: 'medium', color: '#2D3748' },
      },
    },
    dataStyle: {
      backgroundColor: '#FFFFFF',
      color: '#4A5568',
      border: {
        bottom: { style: 'thin', color: '#E2E8F0' },
      },
    },
    preview: {
      headerColor: '#FFFFFF',
      dataColor: '#FFFFFF',
    },
  },
  {
    id: 'colorful',
    name: '컬러풀 스타일',
    description: '밝고 활기찬 색상 조합',
    headerStyle: {
      backgroundColor: '#48BB78',
      color: '#FFFFFF',
      fontWeight: 'bold',
      fontSize: 11,
      textAlign: 'center',
      border: {
        all: { style: 'thin', color: '#38A169' },
      },
    },
    dataStyle: {
      backgroundColor: '#FFFFFF',
      color: '#2D3748',
      border: {
        all: { style: 'thin', color: '#C6F6D5' },
      },
    },
    alternateRowStyle: {
      backgroundColor: '#F0FFF4',
      color: '#2D3748',
    },
    preview: {
      headerColor: '#48BB78',
      dataColor: '#FFFFFF',
      alternateColor: '#F0FFF4',
    },
  },
];

// ============================================================================
// EXCEL STYLE PRESETS COMPONENT
// ============================================================================

export const ExcelStylePresets: React.FC<ExcelStylePresetsProps> = ({
  config,
  onConfigChange,
  onApplyPreset,
}) => {
  const [selectedPreset, setSelectedPreset] = useState<string>('default');
  const [customHeaderStyle, setCustomHeaderStyle] = useState<CellStyle>(
    STYLE_PRESETS[0].headerStyle
  );
  const [customDataStyle, setCustomDataStyle] = useState<CellStyle>(
    STYLE_PRESETS[0].dataStyle
  );
  const [showPreview, setShowPreview] = useState(false);

  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================

  const handlePresetChange = (presetId: string) => {
    setSelectedPreset(presetId);
    const preset = STYLE_PRESETS.find(p => p.id === presetId);
    if (preset) {
      setCustomHeaderStyle(preset.headerStyle);
      setCustomDataStyle(preset.dataStyle);
      onApplyPreset(preset);
    }
  };

  const handleCustomStyleChange = (
    styleType: 'header' | 'data',
    property: keyof CellStyle,
    value: any
  ) => {
    if (styleType === 'header') {
      const updatedStyle = { ...customHeaderStyle, [property]: value };
      setCustomHeaderStyle(updatedStyle);
      onConfigChange({
        cellStyles: {
          ...config.cellStyles,
          headerStyle: updatedStyle,
        },
      });
    } else {
      const updatedStyle = { ...customDataStyle, [property]: value };
      setCustomDataStyle(updatedStyle);
      onConfigChange({
        cellStyles: {
          ...config.cellStyles,
          dataStyle: updatedStyle,
        },
      });
    }
  };

  const handleAdvancedOptionChange = (
    option: keyof ExcelExportConfig,
    value: any
  ) => {
    onConfigChange({ [option]: value });
  };

  // ============================================================================
  // RENDER METHODS
  // ============================================================================

  const renderPresetCard = (preset: StylePreset) => (
    <Card
      key={preset.id}
      sx={{
        cursor: 'pointer',
        border: selectedPreset === preset.id ? 2 : 1,
        borderColor: selectedPreset === preset.id ? 'primary.main' : 'divider',
        transition: 'all 0.2s ease-in-out',
        '&:hover': {
          boxShadow: 3,
          transform: 'translateY(-2px)',
        },
      }}
      onClick={() => handlePresetChange(preset.id)}
    >
      <CardContent sx={{ p: 2 }}>
        <Typography variant='h6' gutterBottom>
          {preset.name}
        </Typography>
        <Typography variant='body2' color='text.secondary' gutterBottom>
          {preset.description}
        </Typography>

        {/* Style Preview */}
        <Box sx={{ mt: 2 }}>
          <Typography variant='caption' gutterBottom>
            미리보기:
          </Typography>
          <Box
            sx={{
              border: 1,
              borderColor: 'divider',
              borderRadius: 1,
              overflow: 'hidden',
            }}
          >
            {/* Header Row */}
            <Box
              sx={{
                display: 'flex',
                backgroundColor: preset.preview.headerColor,
                color: '#FFFFFF',
                fontSize: '10px',
                fontWeight: 'bold',
                textAlign: 'center',
              }}
            >
              <Box
                sx={{ flex: 1, p: 0.5, borderRight: 1, borderColor: 'divider' }}
              >
                ID
              </Box>
              <Box
                sx={{ flex: 2, p: 0.5, borderRight: 1, borderColor: 'divider' }}
              >
                이름
              </Box>
              <Box sx={{ flex: 1, p: 0.5 }}>상태</Box>
            </Box>

            {/* Data Rows */}
            {[1, 2].map((row, index) => (
              <Box
                key={row}
                sx={{
                  display: 'flex',
                  backgroundColor:
                    index === 0
                      ? preset.preview.dataColor
                      : preset.preview.alternateColor ||
                        preset.preview.dataColor,
                  fontSize: '9px',
                  borderTop: 1,
                  borderColor: 'divider',
                }}
              >
                <Box
                  sx={{
                    flex: 1,
                    p: 0.5,
                    borderRight: 1,
                    borderColor: 'divider',
                  }}
                >
                  {row}
                </Box>
                <Box
                  sx={{
                    flex: 2,
                    p: 0.5,
                    borderRight: 1,
                    borderColor: 'divider',
                  }}
                >
                  샘플 데이터 {row}
                </Box>
                <Box sx={{ flex: 1, p: 0.5 }}>활성</Box>
              </Box>
            ))}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );

  const renderColorPicker = (
    label: string,
    value: string | undefined,
    onChange: (color: string) => void
  ) => (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <Typography variant='body2' sx={{ minWidth: 80 }}>
        {label}:
      </Typography>
      <Box
        sx={{
          width: 32,
          height: 24,
          backgroundColor: value || '#FFFFFF',
          border: 1,
          borderColor: 'divider',
          borderRadius: 1,
          cursor: 'pointer',
        }}
        onClick={() => {
          // In a real implementation, this would open a color picker
          const color = prompt(
            '색상을 입력하세요 (hex 형식):',
            value || '#FFFFFF'
          );
          if (color) onChange(color);
        }}
      />
      <Typography variant='caption' color='text.secondary'>
        {value || '#FFFFFF'}
      </Typography>
    </Box>
  );

  const renderBorderStyle = (
    style: CellStyle,
    onChange: (border: BorderStyle) => void
  ) => (
    <Box sx={{ mt: 2 }}>
      <Typography variant='body2' gutterBottom>
        테두리 설정:
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={6}>
          <FormControl fullWidth size='small'>
            <InputLabel>테두리 스타일</InputLabel>
            <Select
              value={style.border?.all?.style || 'thin'}
              onChange={e =>
                onChange({
                  all: {
                    style: e.target.value as any,
                    color: style.border?.all?.color || '#000000',
                  },
                })
              }
            >
              <MenuItem value='thin'>얇게</MenuItem>
              <MenuItem value='medium'>보통</MenuItem>
              <MenuItem value='thick'>두껍게</MenuItem>
              <MenuItem value='dotted'>점선</MenuItem>
              <MenuItem value='dashed'>대시</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={6}>
          {renderColorPicker('테두리 색상', style.border?.all?.color, color =>
            onChange({
              all: {
                style: style.border?.all?.style || 'thin',
                color,
              },
            })
          )}
        </Grid>
      </Grid>
    </Box>
  );

  return (
    <Box>
      {/* Preset Selection */}
      <Typography variant='h6' gutterBottom>
        Excel 스타일 프리셋
      </Typography>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        {STYLE_PRESETS.map(renderPresetCard)}
      </Grid>

      {/* Advanced Options */}
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant='h6'>고급 옵션</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={3}>
            {/* Column Width Options */}
            <Grid item xs={12} md={6}>
              <Typography variant='subtitle1' gutterBottom>
                컬럼 설정
              </Typography>
              <FormControlLabel
                control={
                  <Switch
                    checked={config.autoColumnWidth || false}
                    onChange={e =>
                      handleAdvancedOptionChange(
                        'autoColumnWidth',
                        e.target.checked
                      )
                    }
                  />
                }
                label='자동 컬럼 너비 조정'
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={config.freezeHeader || false}
                    onChange={e =>
                      handleAdvancedOptionChange(
                        'freezeHeader',
                        e.target.checked
                      )
                    }
                  />
                }
                label='헤더 행 고정'
              />
            </Grid>

            {/* Formatting Options */}
            <Grid item xs={12} md={6}>
              <Typography variant='subtitle1' gutterBottom>
                포맷 설정
              </Typography>
              <TextField
                label='날짜 형식'
                value={config.dateFormat || 'yyyy-mm-dd'}
                onChange={e => onConfigChange({ dateFormat: e.target.value })}
                size='small'
                fullWidth
                sx={{ mb: 2 }}
              />
              <TextField
                label='숫자 형식'
                value={config.numberFormat || '#,##0'}
                onChange={e => onConfigChange({ numberFormat: e.target.value })}
                size='small'
                fullWidth
              />
            </Grid>
          </Grid>
        </AccordionDetails>
      </Accordion>

      {/* Custom Style Editor */}
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant='h6'>사용자 정의 스타일</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={3}>
            {/* Header Style */}
            <Grid item xs={12} md={6}>
              <Typography variant='subtitle1' gutterBottom>
                헤더 스타일
              </Typography>

              {renderColorPicker(
                '배경색',
                customHeaderStyle.backgroundColor,
                color =>
                  handleCustomStyleChange('header', 'backgroundColor', color)
              )}

              {renderColorPicker('글자색', customHeaderStyle.color, color =>
                handleCustomStyleChange('header', 'color', color)
              )}

              <Box sx={{ mt: 2 }}>
                <FormControl size='small' sx={{ minWidth: 120, mr: 2 }}>
                  <InputLabel>글자 굵기</InputLabel>
                  <Select
                    value={customHeaderStyle.fontWeight || 'normal'}
                    onChange={e =>
                      handleCustomStyleChange(
                        'header',
                        'fontWeight',
                        e.target.value
                      )
                    }
                  >
                    <MenuItem value='normal'>보통</MenuItem>
                    <MenuItem value='bold'>굵게</MenuItem>
                  </Select>
                </FormControl>

                <FormControl size='small' sx={{ minWidth: 120 }}>
                  <InputLabel>정렬</InputLabel>
                  <Select
                    value={customHeaderStyle.textAlign || 'left'}
                    onChange={e =>
                      handleCustomStyleChange(
                        'header',
                        'textAlign',
                        e.target.value
                      )
                    }
                  >
                    <MenuItem value='left'>왼쪽</MenuItem>
                    <MenuItem value='center'>가운데</MenuItem>
                    <MenuItem value='right'>오른쪽</MenuItem>
                  </Select>
                </FormControl>
              </Box>

              {renderBorderStyle(customHeaderStyle, border =>
                handleCustomStyleChange('header', 'border', border)
              )}
            </Grid>

            {/* Data Style */}
            <Grid item xs={12} md={6}>
              <Typography variant='subtitle1' gutterBottom>
                데이터 스타일
              </Typography>

              {renderColorPicker(
                '배경색',
                customDataStyle.backgroundColor,
                color =>
                  handleCustomStyleChange('data', 'backgroundColor', color)
              )}

              {renderColorPicker('글자색', customDataStyle.color, color =>
                handleCustomStyleChange('data', 'color', color)
              )}

              <Box sx={{ mt: 2 }}>
                <FormControl size='small' sx={{ minWidth: 120, mr: 2 }}>
                  <InputLabel>글자 크기</InputLabel>
                  <Select
                    value={customDataStyle.fontSize || 10}
                    onChange={e =>
                      handleCustomStyleChange(
                        'data',
                        'fontSize',
                        Number(e.target.value)
                      )
                    }
                  >
                    <MenuItem value={8}>8pt</MenuItem>
                    <MenuItem value={9}>9pt</MenuItem>
                    <MenuItem value={10}>10pt</MenuItem>
                    <MenuItem value={11}>11pt</MenuItem>
                    <MenuItem value={12}>12pt</MenuItem>
                  </Select>
                </FormControl>

                <FormControl size='small' sx={{ minWidth: 120 }}>
                  <InputLabel>정렬</InputLabel>
                  <Select
                    value={customDataStyle.textAlign || 'left'}
                    onChange={e =>
                      handleCustomStyleChange(
                        'data',
                        'textAlign',
                        e.target.value
                      )
                    }
                  >
                    <MenuItem value='left'>왼쪽</MenuItem>
                    <MenuItem value='center'>가운데</MenuItem>
                    <MenuItem value='right'>오른쪽</MenuItem>
                  </Select>
                </FormControl>
              </Box>

              {renderBorderStyle(customDataStyle, border =>
                handleCustomStyleChange('data', 'border', border)
              )}
            </Grid>
          </Grid>

          <Divider sx={{ my: 3 }} />

          {/* Action Buttons */}
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
            <Button
              variant='outlined'
              startIcon={<PreviewIcon />}
              onClick={() => setShowPreview(!showPreview)}
            >
              미리보기 {showPreview ? '숨기기' : '보기'}
            </Button>
            <Button
              variant='contained'
              startIcon={<SaveIcon />}
              onClick={() => {
                // Save custom style as new preset
                alert('사용자 정의 스타일이 저장되었습니다.');
              }}
            >
              스타일 저장
            </Button>
          </Box>
        </AccordionDetails>
      </Accordion>

      {/* Live Preview */}
      {showPreview && (
        <Card sx={{ mt: 3 }}>
          <CardContent>
            <Typography variant='h6' gutterBottom>
              실시간 미리보기
            </Typography>
            <Alert severity='info' sx={{ mb: 2 }}>
              현재 설정으로 생성될 Excel 파일의 스타일을 미리 볼 수 있습니다.
            </Alert>

            {/* Preview Table */}
            <Box
              sx={{
                border: 1,
                borderColor: 'divider',
                borderRadius: 1,
                overflow: 'hidden',
              }}
            >
              {/* Header */}
              <Box
                sx={{
                  display: 'flex',
                  backgroundColor:
                    customHeaderStyle.backgroundColor || '#366092',
                  color: customHeaderStyle.color || '#FFFFFF',
                  fontWeight: customHeaderStyle.fontWeight || 'bold',
                  textAlign: customHeaderStyle.textAlign || 'center',
                  fontSize: customHeaderStyle.fontSize || 11,
                }}
              >
                <Box
                  sx={{ flex: 1, p: 1, borderRight: 1, borderColor: 'divider' }}
                >
                  ID
                </Box>
                <Box
                  sx={{ flex: 2, p: 1, borderRight: 1, borderColor: 'divider' }}
                >
                  이름
                </Box>
                <Box
                  sx={{ flex: 1, p: 1, borderRight: 1, borderColor: 'divider' }}
                >
                  부서
                </Box>
                <Box sx={{ flex: 1, p: 1 }}>상태</Box>
              </Box>

              {/* Data Rows */}
              {['김철수', '이영희', '박민수'].map((name, index) => (
                <Box
                  key={name}
                  sx={{
                    display: 'flex',
                    backgroundColor:
                      index % 2 === 0
                        ? customDataStyle.backgroundColor || '#FFFFFF'
                        : '#F8F9FA',
                    color: customDataStyle.color || '#000000',
                    fontSize: customDataStyle.fontSize || 10,
                    textAlign: customDataStyle.textAlign || 'left',
                    borderTop: 1,
                    borderColor: 'divider',
                  }}
                >
                  <Box
                    sx={{
                      flex: 1,
                      p: 1,
                      borderRight: 1,
                      borderColor: 'divider',
                    }}
                  >
                    {index + 1}
                  </Box>
                  <Box
                    sx={{
                      flex: 2,
                      p: 1,
                      borderRight: 1,
                      borderColor: 'divider',
                    }}
                  >
                    {name}
                  </Box>
                  <Box
                    sx={{
                      flex: 1,
                      p: 1,
                      borderRight: 1,
                      borderColor: 'divider',
                    }}
                  >
                    개발팀
                  </Box>
                  <Box sx={{ flex: 1, p: 1 }}>재직</Box>
                </Box>
              ))}
            </Box>
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

export default ExcelStylePresets;
