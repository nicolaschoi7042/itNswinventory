/**
 * Error Handling Utilities
 *
 * Utilities for consistent API error handling and user feedback
 */

export interface ErrorInfo {
  message: string;
  code?: string;
  details?: string;
  action?: string;
}

/**
 * Extracts user-friendly error message from API error response
 */
export function getApiErrorMessage(
  error: any,
  defaultMessage: string = '처리 중 오류가 발생했습니다.'
): ErrorInfo {
  // Initialize error info
  const errorInfo: ErrorInfo = {
    message: defaultMessage,
    code: error?.code || 'UNKNOWN_ERROR',
  };

  // Server provided specific error message
  if (error?.response?.data?.message) {
    errorInfo.message = error.response.data.message;
    errorInfo.details = error.response.data.details;
    return errorInfo;
  }

  // Handle specific HTTP status codes
  if (error?.response?.status) {
    switch (error.response.status) {
      case 400:
        errorInfo.message = '입력 데이터가 올바르지 않습니다.';
        errorInfo.action = '모든 필드를 확인하고 다시 시도해주세요.';
        errorInfo.code = 'BAD_REQUEST';
        break;
      case 401:
        errorInfo.message = '인증이 필요합니다.';
        errorInfo.action = '다시 로그인해주세요.';
        errorInfo.code = 'UNAUTHORIZED';
        break;
      case 403:
        errorInfo.message = '이 작업을 수행할 권한이 없습니다.';
        errorInfo.action = '관리자에게 문의하세요.';
        errorInfo.code = 'FORBIDDEN';
        break;
      case 404:
        errorInfo.message = '요청한 자원을 찾을 수 없습니다.';
        errorInfo.action = '페이지를 새로고침하고 다시 시도해주세요.';
        errorInfo.code = 'NOT_FOUND';
        break;
      case 409:
        errorInfo.message = '데이터 충돌이 발생했습니다.';
        errorInfo.action = '다른 옵션을 선택하거나 잠시 후 다시 시도해주세요.';
        errorInfo.code = 'CONFLICT';
        break;
      case 422:
        errorInfo.message = '데이터 유효성 검사에 실패했습니다.';
        errorInfo.action = '입력 정보를 확인하고 다시 시도해주세요.';
        errorInfo.code = 'VALIDATION_ERROR';
        break;
      case 429:
        errorInfo.message = '너무 많은 요청이 발생했습니다.';
        errorInfo.action = '잠시 기다린 후 다시 시도해주세요.';
        errorInfo.code = 'RATE_LIMITED';
        break;
      case 500:
        errorInfo.message = '서버 내부 오류가 발생했습니다.';
        errorInfo.action = '잠시 후 다시 시도하거나 관리자에게 문의하세요.';
        errorInfo.code = 'INTERNAL_ERROR';
        break;
      case 502:
        errorInfo.message = '서버 연결에 문제가 있습니다.';
        errorInfo.action = '잠시 후 다시 시도해주세요.';
        errorInfo.code = 'BAD_GATEWAY';
        break;
      case 503:
        errorInfo.message = '서비스를 일시적으로 사용할 수 없습니다.';
        errorInfo.action = '잠시 후 다시 시도해주세요.';
        errorInfo.code = 'SERVICE_UNAVAILABLE';
        break;
      default:
        errorInfo.message = `서버 오류 (${error.response.status})`;
        errorInfo.action = '관리자에게 문의하세요.';
        errorInfo.code = `HTTP_${error.response.status}`;
    }
    return errorInfo;
  }

  // Handle network and timeout errors
  if (error?.code === 'NETWORK_ERROR' || error?.message?.includes('Network')) {
    errorInfo.message = '네트워크 연결에 문제가 있습니다.';
    errorInfo.action = '인터넷 연결을 확인하고 다시 시도해주세요.';
    errorInfo.code = 'NETWORK_ERROR';
    return errorInfo;
  }

  if (error?.code === 'TIMEOUT' || error?.message?.includes('timeout')) {
    errorInfo.message = '요청 시간이 초과되었습니다.';
    errorInfo.action = '잠시 후 다시 시도해주세요.';
    errorInfo.code = 'TIMEOUT';
    return errorInfo;
  }

  // Handle generic JavaScript errors
  if (error instanceof Error) {
    errorInfo.message = error.message || defaultMessage;
    errorInfo.details = error.stack;
    return errorInfo;
  }

  return errorInfo;
}

/**
 * Get error message for specific assignment operations
 */
export function getAssignmentErrorMessage(
  error: any,
  operation: 'create' | 'update' | 'delete' | 'return' | 'load'
): ErrorInfo {
  const baseMessages = {
    create: '할당 생성에 실패했습니다.',
    update: '할당 수정에 실패했습니다.',
    delete: '할당 삭제에 실패했습니다.',
    return: '자산 반납에 실패했습니다.',
    load: '할당 데이터를 불러오는데 실패했습니다.',
  };

  const errorInfo = getApiErrorMessage(error, baseMessages[operation]);

  // Add operation-specific details
  if (operation === 'create' && error?.response?.status === 409) {
    errorInfo.message =
      '이미 할당된 자산이거나 직원의 할당 한도를 초과했습니다.';
    errorInfo.action = '다른 자산을 선택하거나 기존 할당을 확인해주세요.';
  } else if (operation === 'return' && error?.response?.status === 400) {
    errorInfo.message = '반납 처리에 필요한 정보가 부족합니다.';
    errorInfo.action = '반납 정보를 확인하고 다시 시도해주세요.';
  } else if (operation === 'delete' && error?.response?.status === 403) {
    errorInfo.message = '할당 삭제는 관리자만 수행할 수 있습니다.';
    errorInfo.action = '관리자 권한이 필요합니다.';
  }

  return errorInfo;
}

/**
 * Get error message for export operations
 */
export function getExportErrorMessage(
  error: any,
  exportType: 'excel' | 'csv' | 'pdf'
): ErrorInfo {
  const baseMessages = {
    excel: 'Excel 내보내기에 실패했습니다.',
    csv: 'CSV 내보내기에 실패했습니다.',
    pdf: 'PDF 내보내기에 실패했습니다.',
  };

  const errorInfo = getApiErrorMessage(error, baseMessages[exportType]);

  // Add export-specific details
  if (error?.response?.status === 413) {
    errorInfo.message = '내보낼 데이터가 너무 큽니다.';
    errorInfo.action = '필터를 사용하여 데이터를 줄이고 다시 시도해주세요.';
  } else if (error?.code === 'DOWNLOAD_FAILED') {
    errorInfo.message = '파일 다운로드에 실패했습니다.';
    errorInfo.action = '브라우저 설정을 확인하고 다시 시도해주세요.';
  }

  return errorInfo;
}

/**
 * Format error message for display
 */
export function formatErrorMessage(errorInfo: ErrorInfo): string {
  let message = errorInfo.message;

  if (errorInfo.action) {
    message += ` ${errorInfo.action}`;
  }

  if (errorInfo.details && process.env.NODE_ENV === 'development') {
    message += `\n\n개발자 정보: ${errorInfo.details}`;
  }

  return message;
}

/**
 * Log error with context information
 */
export function logError(
  operation: string,
  error: any,
  context?: Record<string, any>
): void {
  const errorInfo = getApiErrorMessage(error);

  console.group(`🚨 ${operation} Error`);
  console.error('Message:', errorInfo.message);
  console.error('Code:', errorInfo.code);
  if (errorInfo.details) {
    console.error('Details:', errorInfo.details);
  }
  if (context) {
    console.error('Context:', context);
  }
  console.error('Original Error:', error);
  console.groupEnd();
}
