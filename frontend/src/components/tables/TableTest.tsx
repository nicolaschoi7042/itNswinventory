import React, { useState, useCallback, useEffect } from 'react';
import { 
  Box, 
  Paper, 
  Typography, 
  Chip, 
  Alert,
  Card,
  CardContent,
  CardHeader,
  Grid,
  Stack,
  Button,
  LinearProgress,
} from '@mui/material';
import {
  Speed as SpeedIcon,
  Assessment as AssessmentIcon,
  Refresh as RefreshIcon,
  CheckCircle as CheckIcon,
  Error as ErrorIcon,
} from '@mui/icons-material';

import { DataTable } from './DataTable';
import { SearchFilter } from './SearchFilter';
import { TableActions } from './TableActions';

// Generate large dataset for performance testing
const generateEmployeeData = (count: number) => {
  const departments = ['IT팀', '개발팀', '디자인팀', '마케팅팀', '영업팀', '재무팀', '인사팀'];
  const statuses = ['재직', '휴직', '퇴직'];
  const positions = ['인턴', '주임', '대리', '과장', '차장', '부장'];
  
  return Array.from({ length: count }, (_, index) => ({
    id: `EMP${String(index + 1).padStart(4, '0')}`,
    name: `직원${index + 1}`,
    email: `employee${index + 1}@company.com`,
    department: departments[Math.floor(Math.random() * departments.length)],
    position: positions[Math.floor(Math.random() * positions.length)],
    phone: `010-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`,
    hireDate: new Date(2020 + Math.floor(Math.random() * 4), Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1).toISOString().split('T')[0],
    status: statuses[Math.floor(Math.random() * statuses.length)],
    salary: 3000 + Math.floor(Math.random() * 5000),
    avatar: `https://i.pravatar.cc/40?img=${index + 1}`,
  }));
};

const generateHardwareData = (count: number) => {
  const types = ['데스크톱', '노트북', '모니터', '프린터', '서버', '태블릿'];
  const manufacturers = ['Dell', 'HP', 'Lenovo', 'Samsung', 'LG', 'Apple'];
  const statuses = ['사용중', '대기', '수리중', '폐기'];
  
  return Array.from({ length: count }, (_, index) => ({
    id: `HW${String(index + 1).padStart(4, '0')}`,
    assetTag: `AS${String(index + 1000).padStart(4, '0')}`,
    name: `${manufacturers[Math.floor(Math.random() * manufacturers.length)]} ${types[Math.floor(Math.random() * types.length)]}`,
    type: types[Math.floor(Math.random() * types.length)],
    manufacturer: manufacturers[Math.floor(Math.random() * manufacturers.length)],
    model: `Model-${index + 1}`,
    serialNumber: `SN${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
    purchaseDate: new Date(2019 + Math.floor(Math.random() * 5), Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1).toISOString().split('T')[0],
    status: statuses[Math.floor(Math.random() * statuses.length)],
    location: `${Math.floor(Math.random() * 10) + 1}층`,
    assignedTo: Math.random() > 0.3 ? `직원${Math.floor(Math.random() * 100) + 1}` : null,
    cost: 500 + Math.floor(Math.random() * 3000),
  }));
};

interface TestMetrics {
  renderTime: number;
  rowCount: number;
  searchTime: number;
  sortTime: number;
  filterTime: number;
}

export function TableTest() {
  const [searchValue, setSearchValue] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [currentTab, setCurrentTab] = useState<'employee' | 'hardware'>('employee');
  const [loading, setLoading] = useState(false);
  const [testMetrics, setTestMetrics] = useState<TestMetrics>({
    renderTime: 0,
    rowCount: 0,
    searchTime: 0,
    sortTime: 0,
    filterTime: 0,
  });
  const [dataSize, setDataSize] = useState<'small' | 'medium' | 'large'>('small');
  
  // Generate test data based on size
  const getDataSizes = () => ({
    small: { employees: 50, hardware: 30 },
    medium: { employees: 500, hardware: 300 },
    large: { employees: 2000, hardware: 1000 },
  });

  const [employeeData, setEmployeeData] = useState(() => generateEmployeeData(50));
  const [hardwareData, setHardwareData] = useState(() => generateHardwareData(30));

  const userRole = 'admin';

  // Performance measurement utilities
  const measurePerformance = useCallback((label: string, fn: () => void) => {
    const start = performance.now();
    fn();
    const end = performance.now();
    const duration = end - start;
    
    setTestMetrics(prev => ({
      ...prev,
      [`${label}Time`]: Math.round(duration * 100) / 100,
    }));
    
    return duration;
  }, []);

  // Data regeneration with performance tracking
  const regenerateData = useCallback((newSize: 'small' | 'medium' | 'large') => {
    setLoading(true);
    const sizes = getDataSizes()[newSize];
    
    setTimeout(() => {
      measurePerformance('render', () => {
        setEmployeeData(generateEmployeeData(sizes.employees));
        setHardwareData(generateHardwareData(sizes.hardware));
        setDataSize(newSize);
      });
      setLoading(false);
    }, 100);
  }, [measurePerformance]);

  // Column definitions with enhanced testing features
  const employeeColumns = [
    { 
      id: 'id', 
      label: '사번', 
      sortable: true,
      width: '10%',
    },
    { 
      id: 'name', 
      label: '이름', 
      sortable: true,
      width: '15%',
    },
    { 
      id: 'department', 
      label: '부서', 
      sortable: true,
      width: '12%',
    },
    { 
      id: 'position', 
      label: '직급', 
      sortable: true,
      width: '10%',
    },
    { 
      id: 'email', 
      label: '이메일', 
      sortable: true,
      width: '20%',
    },
    { 
      id: 'phone', 
      label: '연락처', 
      sortable: false,
      width: '13%',
    },
    { 
      id: 'status', 
      label: '상태', 
      sortable: true,
      width: '10%',
      render: (value: string) => (
        <Chip 
          label={value} 
          color={value === '재직' ? 'success' : value === '휴직' ? 'warning' : 'default'}
          size="small"
          variant="outlined"
        />
      )
    },
    {
      id: 'actions',
      label: '작업',
      sortable: false,
      width: '10%',
      render: (_: any, row: any) => (
        <TableActions
          actions={[
            {
              label: '보기',
              onClick: () => console.log('View employee:', row),
              icon: 'visibility',
            },
            {
              label: '수정',
              onClick: () => console.log('Edit employee:', row),
              icon: 'edit',
              requiresRole: 'manager',
            },
            {
              label: '삭제',
              onClick: () => console.log('Delete employee:', row),
              icon: 'delete',
              requiresRole: 'admin',
              danger: true,
            },
          ]}
          currentUserRole={userRole}
        />
      )
    }
  ];

  const hardwareColumns = [
    { 
      id: 'id', 
      label: 'ID', 
      sortable: true,
      width: '8%',
    },
    { 
      id: 'assetTag', 
      label: '자산번호', 
      sortable: true,
      width: '10%',
    },
    { 
      id: 'name', 
      label: '자산명', 
      sortable: true,
      width: '18%',
    },
    { 
      id: 'type', 
      label: '유형', 
      sortable: true,
      width: '10%',
    },
    { 
      id: 'manufacturer', 
      label: '제조사', 
      sortable: true,
      width: '10%',
    },
    { 
      id: 'serialNumber', 
      label: '시리얼', 
      sortable: true,
      width: '12%',
    },
    { 
      id: 'status', 
      label: '상태', 
      sortable: true,
      width: '8%',
      render: (value: string) => (
        <Chip 
          label={value} 
          color={value === '사용중' ? 'primary' : value === '대기' ? 'success' : value === '수리중' ? 'warning' : 'default'}
          size="small"
          variant="outlined"
        />
      )
    },
    { 
      id: 'assignedTo', 
      label: '할당자', 
      sortable: true,
      width: '10%',
    },
    {
      id: 'actions',
      label: '작업',
      sortable: false,
      width: '4%',
      render: (_: any, row: any) => (
        <TableActions
          actions={[
            {
              label: '보기',
              onClick: () => console.log('View hardware:', row),
              icon: 'visibility',
            },
            {
              label: '수정',
              onClick: () => console.log('Edit hardware:', row),
              icon: 'edit',
              requiresRole: 'manager',
            },
          ]}
          currentUserRole={userRole}
          variant="icon-only"
        />
      )
    }
  ];

  // Enhanced filtering with performance tracking
  const filteredEmployees = useCallback(() => {
    return measurePerformance('filter', () => {
      return employeeData.filter(emp => {
        const matchesSearch = !searchValue || 
          emp.name.toLowerCase().includes(searchValue.toLowerCase()) ||
          emp.department.toLowerCase().includes(searchValue.toLowerCase()) ||
          emp.email.toLowerCase().includes(searchValue.toLowerCase());
        
        const matchesDepartment = !departmentFilter || emp.department === departmentFilter;
        const matchesStatus = !statusFilter || emp.status === statusFilter;
        
        return matchesSearch && matchesDepartment && matchesStatus;
      });
    });
  }, [employeeData, searchValue, departmentFilter, statusFilter, measurePerformance]);

  const filteredHardware = useCallback(() => {
    return measurePerformance('filter', () => {
      return hardwareData.filter(hw => {
        const matchesSearch = !searchValue || 
          hw.name.toLowerCase().includes(searchValue.toLowerCase()) ||
          hw.type.toLowerCase().includes(searchValue.toLowerCase()) ||
          hw.serialNumber.toLowerCase().includes(searchValue.toLowerCase());
        
        const matchesType = !typeFilter || hw.type === typeFilter;
        
        return matchesSearch && matchesType;
      });
    });
  }, [hardwareData, searchValue, typeFilter, measurePerformance]);

  // Filter options generation
  const departmentOptions = [...new Set(employeeData.map(emp => emp.department))].map(dept => ({
    value: dept,
    label: dept,
  }));

  const statusOptions = [...new Set(employeeData.map(emp => emp.status))].map(status => ({
    value: status,
    label: status,
  }));

  const typeOptions = [...new Set(hardwareData.map(hw => hw.type))].map(type => ({
    value: type,
    label: type,
  }));

  // Performance effect tracking
  useEffect(() => {
    setTestMetrics(prev => ({
      ...prev,
      rowCount: currentTab === 'employee' ? employeeData.length : hardwareData.length,
    }));
  }, [currentTab, employeeData.length, hardwareData.length]);

  return (
    <Box>
      <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
        테이블 컴포넌트 성능 테스트
      </Typography>

      {/* Test Control Panel */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={8}>
          <Card>
            <CardHeader title="테스트 설정" />
            <CardContent>
              <Stack spacing={2}>
                <Stack direction="row" spacing={2} alignItems="center">
                  <Typography variant="body2" sx={{ minWidth: 100 }}>
                    데이터 크기:
                  </Typography>
                  {(['small', 'medium', 'large'] as const).map((size) => (
                    <Button
                      key={size}
                      variant={dataSize === size ? 'contained' : 'outlined'}
                      size="small"
                      onClick={() => regenerateData(size)}
                      disabled={loading}
                    >
                      {size === 'small' ? '소 (직원 50, 자산 30)' : 
                       size === 'medium' ? '중 (직원 500, 자산 300)' : 
                       '대 (직원 2000, 자산 1000)'}
                    </Button>
                  ))}
                </Stack>
                
                <Stack direction="row" spacing={2} alignItems="center">
                  <Typography variant="body2" sx={{ minWidth: 100 }}>
                    테스트 테이블:
                  </Typography>
                  <Button
                    variant={currentTab === 'employee' ? 'contained' : 'outlined'}
                    size="small"
                    onClick={() => setCurrentTab('employee')}
                  >
                    직원 관리
                  </Button>
                  <Button
                    variant={currentTab === 'hardware' ? 'contained' : 'outlined'}
                    size="small"
                    onClick={() => setCurrentTab('hardware')}
                  >
                    하드웨어 관리
                  </Button>
                </Stack>

                {loading && <LinearProgress />}
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Performance Metrics */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardHeader 
              title="성능 메트릭" 
              action={
                <SpeedIcon color="primary" />
              }
            />
            <CardContent>
              <Stack spacing={2}>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    데이터 행 수
                  </Typography>
                  <Typography variant="h6">
                    {testMetrics.rowCount.toLocaleString()}
                  </Typography>
                </Box>
                
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    렌더링 시간
                  </Typography>
                  <Typography variant="h6" color={testMetrics.renderTime > 100 ? 'error' : 'success'}>
                    {testMetrics.renderTime}ms
                  </Typography>
                </Box>
                
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    필터링 시간
                  </Typography>
                  <Typography variant="h6" color={testMetrics.filterTime > 50 ? 'warning' : 'success'}>
                    {testMetrics.filterTime}ms
                  </Typography>
                </Box>

                <Alert 
                  severity={testMetrics.renderTime < 100 ? 'success' : testMetrics.renderTime < 300 ? 'warning' : 'error'}
                  icon={testMetrics.renderTime < 100 ? <CheckIcon /> : <ErrorIcon />}
                >
                  <Typography variant="caption">
                    {testMetrics.renderTime < 100 ? '성능 우수' : 
                     testMetrics.renderTime < 300 ? '성능 보통' : '성능 개선 필요'}
                  </Typography>
                </Alert>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Employee Table Section */}
      {currentTab === 'employee' && (
        <Paper sx={{ mb: 3 }}>
          <Box sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              직원 관리 테이블 ({employeeData.length}명)
            </Typography>
            
            <SearchFilter
              searchValue={searchValue}
              onSearchChange={(value) => {
                measurePerformance('search', () => setSearchValue(value));
              }}
              placeholder="직원명, 부서, 이메일로 검색..."
              filters={[
                {
                  label: '부서',
                  value: departmentFilter,
                  onChange: setDepartmentFilter,
                  options: departmentOptions
                },
                {
                  label: '상태',
                  value: statusFilter,
                  onChange: setStatusFilter,
                  options: statusOptions
                }
              ]}
              onClearAll={() => {
                setDepartmentFilter('');
                setStatusFilter('');
                setSearchValue('');
              }}
              showResultCount
              resultCount={filteredEmployees().length}
            />

            <DataTable
              columns={employeeColumns}
              data={filteredEmployees()}
              loading={loading}
              pagination
              pageSize={20}
              stickyHeader
              onRowClick={(row) => console.log('Employee clicked:', row)}
              emptyMessage="검색 조건에 맞는 직원이 없습니다."
              maxHeight={600}
              actions={[
                {
                  label: '직원 추가',
                  onClick: () => console.log('Add employee'),
                  icon: 'add',
                  variant: 'contained',
                  color: 'primary',
                },
                {
                  label: '엑셀 내보내기',
                  onClick: () => console.log('Export employees'),
                  icon: 'download',
                },
                {
                  label: '새로고침',
                  onClick: () => regenerateData(dataSize),
                  icon: 'refresh',
                },
              ]}
              currentUserRole={userRole}
            />
          </Box>
        </Paper>
      )}

      {/* Hardware Table Section */}
      {currentTab === 'hardware' && (
        <Paper>
          <Box sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              하드웨어 자산 테이블 ({hardwareData.length}개)
            </Typography>
            
            <SearchFilter
              searchValue={searchValue}
              onSearchChange={(value) => {
                measurePerformance('search', () => setSearchValue(value));
              }}
              placeholder="자산명, 시리얼번호, 유형으로 검색..."
              filters={[
                {
                  label: '자산 유형',
                  value: typeFilter,
                  onChange: setTypeFilter,
                  options: typeOptions
                }
              ]}
              onClearAll={() => {
                setTypeFilter('');
                setSearchValue('');
              }}
              dense
              showResultCount
              resultCount={filteredHardware().length}
            />

            <DataTable
              columns={hardwareColumns}
              data={filteredHardware()}
              loading={loading}
              pagination
              pageSize={15}
              dense
              stickyHeader
              onRowClick={(row) => console.log('Hardware clicked:', row)}
              emptyMessage="검색 조건에 맞는 하드웨어가 없습니다."
              maxHeight={500}
              actions={[
                {
                  label: '자산 추가',
                  onClick: () => console.log('Add hardware'),
                  icon: 'add',
                  variant: 'contained',
                  color: 'primary',
                },
                {
                  label: '대량 가져오기',
                  onClick: () => console.log('Import hardware'),
                  icon: 'upload',
                },
                {
                  label: '리포트 생성',
                  onClick: () => console.log('Generate report'),
                  icon: 'assessment',
                },
              ]}
              currentUserRole={userRole}
            />
          </Box>
        </Paper>
      )}
    </Box>
  );
}