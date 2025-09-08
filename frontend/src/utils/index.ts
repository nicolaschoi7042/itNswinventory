// 기존 IT 인벤토리 시스템에서 사용하던 유틸리티 함수들
// 기존 script.js의 유틸리티 함수들을 TypeScript로 포팅

/**
 * 날짜를 한국어 형식으로 포맷팅 (기존 시스템 유지)
 */
export const formatDate = (dateString: string): string => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('ko-KR');
};

/**
 * 날짜와 시간을 한국어 형식으로 포맷팅
 */
export const formatDateTime = (dateString: string): string => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleString('ko-KR');
};

/**
 * 기존 시스템의 showAlert 기능을 위한 유틸리티
 */
export const getAlertVariant = (
  type: string
): 'success' | 'error' | 'warning' | 'info' => {
  switch (type) {
    case 'success':
      return 'success';
    case 'error':
      return 'error';
    case 'warning':
      return 'warning';
    default:
      return 'info';
  }
};

/**
 * 기존 시스템의 hasAdminRole 함수 재현
 */
export const hasAdminRole = (userRole?: string): boolean => {
  return userRole === 'admin';
};

/**
 * 기존 시스템의 hasManagerRole 함수 재현
 */
export const hasManagerRole = (userRole?: string): boolean => {
  return userRole === 'admin' || userRole === 'manager';
};

/**
 * 기존 시스템의 토큰 관리 함수들
 */
export const tokenUtils = {
  get: (): string | null => {
    return localStorage.getItem('inventory_token');
  },
  set: (token: string): void => {
    localStorage.setItem('inventory_token', token);
  },
  remove: (): void => {
    localStorage.removeItem('inventory_token');
    localStorage.removeItem('inventory_user');
  },
};

/**
 * 기존 시스템의 사용자 정보 관리
 */
export const userUtils = {
  get: () => {
    const userStr = localStorage.getItem('inventory_user');
    return userStr ? JSON.parse(userStr) : null;
  },
  set: (user: any): void => {
    localStorage.setItem('inventory_user', JSON.stringify(user));
  },
  remove: (): void => {
    localStorage.removeItem('inventory_user');
  },
};

/**
 * 기존 시스템의 API URL 구성 로직 재현
 */
export const getApiUrl = (): string => {
  const origin = window.location.origin;

  if (origin.includes(':8080')) {
    // Development: localhost:8080 -> localhost:3001
    return origin.replace(':8080', ':3001') + '/api';
  } else if (origin.includes('it.roboetech.com')) {
    // Production: https://it.roboetech.com -> https://it.roboetech.com/api
    return origin + '/api';
  } else {
    // Fallback: add port 3001
    return origin + ':3001/api';
  }
};

/**
 * 디바운스 함수
 */
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

/**
 * 기존 시스템의 검색 필터링 로직
 */
export const filterData = <T extends Record<string, any>>(
  data: T[],
  searchTerm: string,
  searchFields: (keyof T)[]
): T[] => {
  if (!searchTerm) return data;

  const term = searchTerm.toLowerCase();
  return data.filter(item =>
    searchFields.some(field => {
      const value = item[field];
      return value && value.toString().toLowerCase().includes(term);
    })
  );
};

/**
 * 기존 시스템의 상태별 색상 매핑
 */
export const getStatusColor = (status: string): string => {
  switch (status) {
    case 'available':
    case '반납완료':
      return 'success';
    case 'assigned':
    case '사용중':
      return 'warning';
    case 'maintenance':
    case '대기중':
      return 'info';
    case 'retired':
      return 'error';
    default:
      return 'default';
  }
};

/**
 * 기존 시스템의 엑셀 내보내기를 위한 데이터 변환
 */
export const prepareExcelData = (data: any[], _type: string): any[] => {
  // 기존 시스템의 exportToExcel 함수 로직 재현
  return data.map(item => {
    const baseItem = { ...item };

    // 날짜 필드 포맷팅
    if (baseItem.createdAt) baseItem.createdAt = formatDate(baseItem.createdAt);
    if (baseItem.updatedAt) baseItem.updatedAt = formatDate(baseItem.updatedAt);
    if (baseItem.purchaseDate)
      baseItem.purchaseDate = formatDate(baseItem.purchaseDate);
    if (baseItem.warrantyExpiry)
      baseItem.warrantyExpiry = formatDate(baseItem.warrantyExpiry);
    if (baseItem.expiryDate)
      baseItem.expiryDate = formatDate(baseItem.expiryDate);
    if (baseItem.assignedDate)
      baseItem.assignedDate = formatDate(baseItem.assignedDate);
    if (baseItem.returnedDate)
      baseItem.returnedDate = formatDate(baseItem.returnedDate);

    return baseItem;
  });
};

/**
 * 오류 처리를 위한 헬퍼 함수
 */
export const handleError = (error: any): string => {
  if (error.response?.data?.error) {
    return error.response.data.error;
  }
  if (error.message) {
    return error.message;
  }
  return '알 수 없는 오류가 발생했습니다.';
};
