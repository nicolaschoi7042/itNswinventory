import {
  Card,
  CardContent,
  CardHeader,
  Typography,
  Box,
  useTheme,
  Chip,
  Stack,
  IconButton,
  Tooltip,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Select,
  FormControl,
  InputLabel,
  ToggleButtonGroup,
  ToggleButton,
} from '@mui/material';
import {
  Computer as ComputerIcon,
  Memory as SoftwareIcon,
  People as PeopleIcon,
  Assignment as AssignmentIcon,
  MoreVert as MoreVertIcon,
  Refresh as RefreshIcon,
  Download as DownloadIcon,
  BarChart as BarChartIcon,
  PieChart as PieChartIcon,
  ShowChart as LineChartIcon,
} from '@mui/icons-material';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
} from 'recharts';
import { ReactNode, useState } from 'react';

export interface AssetData {
  id: string;
  category: string;
  name: string;
  value: number;
  percentage?: number;
  status?: 'active' | 'inactive' | 'maintenance' | 'retired';
  details?: Record<string, any>;
}

export interface AssetChartProps {
  data: AssetData[];
  title?: string;
  type?: 'pie' | 'bar' | 'donut';
  showHeader?: boolean;
  showLegend?: boolean;
  showValues?: boolean;
  showPercentages?: boolean;
  height?: number;
  loading?: boolean;
  onRefresh?: () => void;
  onExport?: (format: 'png' | 'pdf' | 'csv') => void;
  onDataPointClick?: (data: AssetData) => void;
  colorScheme?: 'default' | 'category' | 'status';
  maxItems?: number;
  sortBy?: 'value' | 'name' | 'percentage';
  sortOrder?: 'asc' | 'desc';
  dense?: boolean;
}

const COLORS = {
  default: [
    '#2196f3',
    '#4caf50',
    '#ff9800',
    '#f44336',
    '#9c27b0',
    '#00bcd4',
    '#795548',
    '#607d8b',
  ],
  category: {
    hardware: '#2196f3',
    software: '#4caf50',
    employee: '#ff9800',
    assignment: '#9c27b0',
  },
  status: {
    active: '#4caf50',
    inactive: '#9e9e9e',
    maintenance: '#ff9800',
    retired: '#f44336',
  },
};

export function AssetChart({
  data,
  title = 'Asset Distribution',
  type = 'pie',
  showHeader = true,
  showLegend = true,
  showValues = true,
  showPercentages = true,
  height = 300,
  loading = false,
  onRefresh,
  onExport,
  onDataPointClick,
  colorScheme = 'default',
  maxItems = 10,
  sortBy = 'value',
  sortOrder = 'desc',
  dense = false,
}: AssetChartProps) {
  const theme = useTheme();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [chartType, setChartType] = useState<'pie' | 'bar' | 'donut'>(type);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const getColors = (item: AssetData, index: number): string => {
    switch (colorScheme) {
      case 'category':
        return (
          COLORS.category[item.category as keyof typeof COLORS.category] ||
          COLORS.default[index % COLORS.default.length]
        );
      case 'status':
        return (
          COLORS.status[item.status as keyof typeof COLORS.status] ||
          COLORS.default[index % COLORS.default.length]
        );
      default:
        return COLORS.default[index % COLORS.default.length];
    }
  };

  const processData = (): AssetData[] => {
    let processedData = [...data];

    // Calculate percentages
    const total = processedData.reduce((sum, item) => sum + item.value, 0);
    processedData = processedData.map(item => ({
      ...item,
      percentage: total > 0 ? (item.value / total) * 100 : 0,
    }));

    // Sort data
    processedData.sort((a, b) => {
      let valueA: any, valueB: any;

      switch (sortBy) {
        case 'name':
          valueA = a.name.toLowerCase();
          valueB = b.name.toLowerCase();
          break;
        case 'percentage':
          valueA = a.percentage || 0;
          valueB = b.percentage || 0;
          break;
        default:
          valueA = a.value;
          valueB = b.value;
      }

      if (sortOrder === 'asc') {
        return valueA > valueB ? 1 : -1;
      } else {
        return valueA < valueB ? 1 : -1;
      }
    });

    // Limit items
    if (maxItems && processedData.length > maxItems) {
      const topItems = processedData.slice(0, maxItems - 1);
      const otherItems = processedData.slice(maxItems - 1);
      const otherValue = otherItems.reduce((sum, item) => sum + item.value, 0);

      if (otherValue > 0) {
        topItems.push({
          id: 'others',
          category: 'others',
          name: `Others (${otherItems.length})`,
          value: otherValue,
          percentage: (otherValue / total) * 100,
        });
      }

      return topItems;
    }

    return processedData;
  };

  const chartData = processData();

  const renderPieChart = () => (
    <ResponsiveContainer width='100%' height={height}>
      <PieChart>
        <Pie
          data={chartData}
          cx='50%'
          cy='50%'
          outerRadius={chartType === 'donut' ? height * 0.3 : height * 0.35}
          innerRadius={chartType === 'donut' ? height * 0.15 : 0}
          fill='#8884d8'
          dataKey='value'
          onClick={onDataPointClick}
          label={
            showValues
              ? ({ name, value, percentage }) =>
                  showPercentages
                    ? `${name}: ${Math.round(percentage || 0)}%`
                    : `${name}: ${value}`
              : false
          }
        >
          {chartData.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={getColors(entry, index)}
              style={{ cursor: onDataPointClick ? 'pointer' : 'default' }}
            />
          ))}
        </Pie>
        <RechartsTooltip
          formatter={(value: number, name: string, props: any) => [
            `${value} (${Math.round(props.payload.percentage || 0)}%)`,
            name,
          ]}
        />
        {showLegend && <Legend />}
      </PieChart>
    </ResponsiveContainer>
  );

  const renderBarChart = () => (
    <ResponsiveContainer width='100%' height={height}>
      <BarChart
        data={chartData}
        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray='3 3' />
        <XAxis
          dataKey='name'
          angle={-45}
          textAnchor='end'
          height={dense ? 60 : 80}
          fontSize={dense ? 10 : 12}
        />
        <YAxis fontSize={dense ? 10 : 12} />
        <RechartsTooltip
          formatter={(value: number, name: string, props: any) => [
            showPercentages
              ? `${value} (${Math.round(props.payload.percentage || 0)}%)`
              : value,
            'Count',
          ]}
        />
        <Bar
          dataKey='value'
          onClick={data =>
            onDataPointClick && onDataPointClick(data.payload as AssetData)
          }
          style={{ cursor: onDataPointClick ? 'pointer' : 'default' }}
        >
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={getColors(entry, index)} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );

  const renderChart = () => {
    if (loading) {
      return (
        <Box
          sx={{
            height,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'action.hover',
            borderRadius: 1,
          }}
        >
          <Typography color='text.secondary'>Loading chart...</Typography>
        </Box>
      );
    }

    if (chartData.length === 0) {
      return (
        <Box
          sx={{
            height,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
          }}
        >
          <BarChartIcon
            sx={{
              fontSize: 48,
              color: 'text.disabled',
              mb: 2,
            }}
          />
          <Typography variant='body2' color='text.secondary'>
            No data available
          </Typography>
        </Box>
      );
    }

    return chartType === 'bar' ? renderBarChart() : renderPieChart();
  };

  const renderLegendList = () => (
    <Stack spacing={1} sx={{ mt: 2 }}>
      {chartData.map((item, index) => (
        <Box
          key={item.id}
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            cursor: onDataPointClick ? 'pointer' : 'default',
            p: 0.5,
            borderRadius: 1,
            '&:hover': onDataPointClick
              ? {
                  backgroundColor: 'action.hover',
                }
              : {},
          }}
          onClick={() => onDataPointClick?.(item)}
        >
          <Box
            sx={{
              width: 16,
              height: 16,
              backgroundColor: getColors(item, index),
              borderRadius: 0.5,
              flexShrink: 0,
            }}
          />
          <Typography
            variant={dense ? 'caption' : 'body2'}
            sx={{ flex: 1, fontWeight: 500 }}
          >
            {item.name}
          </Typography>
          <Typography
            variant={dense ? 'caption' : 'body2'}
            color='text.secondary'
          >
            {item.value}
          </Typography>
          {showPercentages && (
            <Typography
              variant={dense ? 'caption' : 'body2'}
              color='text.secondary'
            >
              ({Math.round(item.percentage || 0)}%)
            </Typography>
          )}
        </Box>
      ))}
    </Stack>
  );

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {showHeader && (
        <CardHeader
          title={
            <Typography variant='h6' sx={{ fontWeight: 600 }}>
              {title}
            </Typography>
          }
          action={
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <ToggleButtonGroup
                value={chartType}
                exclusive
                onChange={(_, newType) => newType && setChartType(newType)}
                size='small'
              >
                <ToggleButton value='pie' aria-label='pie chart'>
                  <Tooltip title='Pie Chart'>
                    <PieChartIcon fontSize='small' />
                  </Tooltip>
                </ToggleButton>
                <ToggleButton value='donut' aria-label='donut chart'>
                  <Tooltip title='Donut Chart'>
                    <PieChartIcon fontSize='small' />
                  </Tooltip>
                </ToggleButton>
                <ToggleButton value='bar' aria-label='bar chart'>
                  <Tooltip title='Bar Chart'>
                    <BarChartIcon fontSize='small' />
                  </Tooltip>
                </ToggleButton>
              </ToggleButtonGroup>

              {onRefresh && (
                <Tooltip title='Refresh'>
                  <IconButton
                    size='small'
                    onClick={onRefresh}
                    disabled={loading}
                  >
                    <RefreshIcon />
                  </IconButton>
                </Tooltip>
              )}

              {onExport && (
                <>
                  <IconButton size='small' onClick={handleMenuOpen}>
                    <MoreVertIcon />
                  </IconButton>

                  <Menu
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl)}
                    onClose={handleMenuClose}
                    transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                    anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                  >
                    <MenuItem
                      onClick={() => {
                        onExport('png');
                        handleMenuClose();
                      }}
                    >
                      <ListItemIcon>
                        <DownloadIcon fontSize='small' />
                      </ListItemIcon>
                      <ListItemText>Export as PNG</ListItemText>
                    </MenuItem>
                    <MenuItem
                      onClick={() => {
                        onExport('pdf');
                        handleMenuClose();
                      }}
                    >
                      <ListItemIcon>
                        <DownloadIcon fontSize='small' />
                      </ListItemIcon>
                      <ListItemText>Export as PDF</ListItemText>
                    </MenuItem>
                    <MenuItem
                      onClick={() => {
                        onExport('csv');
                        handleMenuClose();
                      }}
                    >
                      <ListItemIcon>
                        <DownloadIcon fontSize='small' />
                      </ListItemIcon>
                      <ListItemText>Export Data as CSV</ListItemText>
                    </MenuItem>
                  </Menu>
                </>
              )}
            </Box>
          }
          sx={{ pb: 1 }}
        />
      )}

      <CardContent sx={{ pt: 0, flex: 1, overflow: 'auto' }}>
        {renderChart()}

        {!showLegend && chartData.length > 0 && renderLegendList()}
      </CardContent>
    </Card>
  );
}

// Asset distribution summary component
export interface AssetSummaryProps {
  hardware: AssetData[];
  software: AssetData[];
  employees: AssetData[];
  assignments: AssetData[];
  showTotals?: boolean;
  dense?: boolean;
}

export function AssetSummary({
  hardware,
  software,
  employees,
  assignments,
  showTotals = true,
  dense = false,
}: AssetSummaryProps) {
  const categories = [
    {
      name: 'Hardware',
      icon: <ComputerIcon />,
      data: hardware,
      color: COLORS.category.hardware,
    },
    {
      name: 'Software',
      icon: <SoftwareIcon />,
      data: software,
      color: COLORS.category.software,
    },
    {
      name: 'Employees',
      icon: <PeopleIcon />,
      data: employees,
      color: COLORS.category.employee,
    },
    {
      name: 'Assignments',
      icon: <AssignmentIcon />,
      data: assignments,
      color: COLORS.category.assignment,
    },
  ];

  const getTotalValue = (data: AssetData[]) =>
    data.reduce((sum, item) => sum + item.value, 0);

  return (
    <Box
      sx={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: 2,
        justifyContent: 'center',
      }}
    >
      {categories.map(category => {
        const total = getTotalValue(category.data);

        return (
          <Chip
            key={category.name}
            icon={category.icon}
            label={
              showTotals
                ? `${category.name}: ${total.toLocaleString()}`
                : category.name
            }
            sx={{
              backgroundColor: `${category.color}20`,
              color: category.color,
              fontWeight: 600,
              ...(dense && {
                '& .MuiChip-label': { px: 1 },
                height: 24,
              }),
            }}
          />
        );
      })}
    </Box>
  );
}

// Multi-chart dashboard component
export interface AssetDashboardProps {
  data: {
    hardware: AssetData[];
    software: AssetData[];
    employees: AssetData[];
    assignments: AssetData[];
  };
  loading?: boolean;
  onRefresh?: () => void;
}

export function AssetDashboard({
  data,
  loading = false,
  onRefresh,
}: AssetDashboardProps) {
  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
        gap: 3,
      }}
    >
      <AssetChart
        data={data.hardware}
        title='Hardware Distribution'
        type='pie'
        loading={loading}
        onRefresh={onRefresh}
        colorScheme='category'
      />

      <AssetChart
        data={data.software}
        title='Software Licenses'
        type='bar'
        loading={loading}
        onRefresh={onRefresh}
        colorScheme='status'
      />

      <AssetChart
        data={data.assignments}
        title='Asset Assignments'
        type='donut'
        loading={loading}
        onRefresh={onRefresh}
        colorScheme='default'
      />

      <Box sx={{ gridColumn: '1 / -1' }}>
        <AssetSummary
          hardware={data.hardware}
          software={data.software}
          employees={data.employees}
          assignments={data.assignments}
        />
      </Box>
    </Box>
  );
}

// Hook for asset chart data management
export function useAssetChart(initialData: AssetData[] = []) {
  const [data, setData] = useState<AssetData[]>(initialData);
  const [loading, setLoading] = useState(false);

  const updateData = (newData: AssetData[]) => {
    setData(newData);
  };

  const refreshData = async (fetchFn?: () => Promise<AssetData[]>) => {
    if (!fetchFn) return;

    setLoading(true);
    try {
      const newData = await fetchFn();
      setData(newData);
    } catch (error) {
      console.error('Failed to refresh chart data:', error);
    } finally {
      setLoading(false);
    }
  };

  const addDataPoint = (newPoint: AssetData) => {
    setData(prev => [...prev, newPoint]);
  };

  const updateDataPoint = (id: string, updates: Partial<AssetData>) => {
    setData(prev =>
      prev.map(item => (item.id === id ? { ...item, ...updates } : item))
    );
  };

  const removeDataPoint = (id: string) => {
    setData(prev => prev.filter(item => item.id !== id));
  };

  return {
    data,
    loading,
    updateData,
    refreshData,
    addDataPoint,
    updateDataPoint,
    removeDataPoint,
  };
}
