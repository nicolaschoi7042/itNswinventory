/**
 * API Client for IT Asset & Software Inventory Management System
 * Enhanced TypeScript-based HTTP client with error handling, retry logic, and authentication
 * Based on the original vanilla JavaScript ApiService class
 */

import { getToken, clearSession, isTokenExpired, isTokenExpiringSoon } from '@/lib/session-storage';
import type { ApiResponse } from '@/types/api';

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public response?: any,
    public isRetryable: boolean = false
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

interface RetryOptions {
  maxRetries: number;
  baseDelay: number;
  maxDelay: number;
  backoffFactor: number;
}

const DEFAULT_RETRY_OPTIONS: RetryOptions = {
  maxRetries: 3,
  baseDelay: 1000, // 1 second
  maxDelay: 10000, // 10 seconds
  backoffFactor: 2,
};

class ApiClient {
  private baseURL: string;
  private retryOptions: RetryOptions;

  constructor(retryOptions: Partial<RetryOptions> = {}) {
    // Use environment variable or fallback to localhost:3000 (backend port)
    this.baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
    this.retryOptions = { ...DEFAULT_RETRY_OPTIONS, ...retryOptions };
  }

  /**
   * Check if error is retryable (network issues, 5xx errors, timeout)
   */
  private isRetryableError(error: ApiError): boolean {
    if (error.isRetryable) return true;
    if (error.status === 0) return true; // Network error
    if (error.status >= 500 && error.status < 600) return true; // Server errors
    if (error.status === 408) return true; // Request timeout
    return false;
  }

  /**
   * Calculate retry delay with exponential backoff
   */
  private getRetryDelay(attempt: number): number {
    const delay = this.retryOptions.baseDelay * Math.pow(this.retryOptions.backoffFactor, attempt);
    return Math.min(delay, this.retryOptions.maxDelay);
  }

  /**
   * Sleep for specified milliseconds
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private async request<T = any>(
    endpoint: string,
    options: RequestInit = {},
    attempt: number = 0
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    const token = getToken();

    // Check token expiration before making request
    if (token && isTokenExpired()) {
      clearSession();
      if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
      throw new ApiError(401, 'Token expired', undefined, false);
    }

    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      // Handle different content types
      const contentType = response.headers.get('content-type');
      let data;
      
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else if (contentType && (contentType.includes('application/vnd.openxmlformats') || contentType.includes('application/octet-stream'))) {
        // Handle Excel/binary downloads
        data = await response.blob();
      } else {
        data = { success: response.ok, message: await response.text() };
      }

      // Handle authentication errors
      if (response.status === 401) {
        clearSession();
        if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
          window.location.href = '/login';
        }
        throw new ApiError(401, 'Unauthorized', data, false);
      }

      if (!response.ok) {
        const isRetryable = response.status >= 500 || response.status === 408;
        const error = new ApiError(
          response.status,
          data.message || data.error || `HTTP ${response.status}`,
          data,
          isRetryable
        );

        // Retry logic for retryable errors
        if (this.isRetryableError(error) && attempt < this.retryOptions.maxRetries) {
          const delay = this.getRetryDelay(attempt);
          console.warn(`🔄 API request failed (attempt ${attempt + 1}/${this.retryOptions.maxRetries + 1}), retrying in ${delay}ms:`, {
            url,
            status: response.status,
            error: error.message
          });
          
          await this.sleep(delay);
          return this.request<T>(endpoint, options, attempt + 1);
        }

        throw error;
      }

      // Success - log retry recovery if this was a retry attempt
      if (attempt > 0) {
        console.log(`✅ API request succeeded after ${attempt + 1} attempts:`, { url });
      }

      return data;
    } catch (error) {
      if (error instanceof ApiError) {
        // Retry logic for network errors
        if (this.isRetryableError(error) && attempt < this.retryOptions.maxRetries) {
          const delay = this.getRetryDelay(attempt);
          console.warn(`🔄 Network error (attempt ${attempt + 1}/${this.retryOptions.maxRetries + 1}), retrying in ${delay}ms:`, {
            url,
            error: error.message
          });
          
          await this.sleep(delay);
          return this.request<T>(endpoint, options, attempt + 1);
        }
        
        throw error;
      }
      
      // Network or other errors
      console.error('API Request failed:', error);
      const networkError = new ApiError(
        0,
        error instanceof Error ? error.message : 'Network error occurred',
        undefined,
        true // Network errors are retryable
      );

      // Retry network errors
      if (attempt < this.retryOptions.maxRetries) {
        const delay = this.getRetryDelay(attempt);
        console.warn(`🔄 Network error (attempt ${attempt + 1}/${this.retryOptions.maxRetries + 1}), retrying in ${delay}ms:`, {
          url,
          error: networkError.message
        });
        
        await this.sleep(delay);
        return this.request<T>(endpoint, options, attempt + 1);
      }

      throw networkError;
    }
  }

  // HTTP Methods
  async get<T = any>(endpoint: string, params?: Record<string, string>): Promise<ApiResponse<T>> {
    const url = params 
      ? `${endpoint}?${new URLSearchParams(params).toString()}`
      : endpoint;
    
    return this.request<T>(url, { method: 'GET' });
  }

  async post<T = any>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      ...(data && { body: JSON.stringify(data) }),
    });
  }

  async put<T = any>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      ...(data && { body: JSON.stringify(data) }),
    });
  }

  async patch<T = any>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      ...(data && { body: JSON.stringify(data) }),
    });
  }

  async delete<T = any>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }

  // Upload files (for future use)
  async upload<T = any>(endpoint: string, formData: FormData): Promise<ApiResponse<T>> {
    const token = getToken();
    
    // Check token expiration
    if (token && isTokenExpired()) {
      clearSession();
      if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
      throw new ApiError(401, 'Token expired', undefined, false);
    }

    const url = `${this.baseURL}${endpoint}`;

    const config: RequestInit = {
      method: 'POST',
      body: formData,
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (response.status === 401) {
        clearSession();
        if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
          window.location.href = '/login';
        }
        throw new ApiError(401, 'Unauthorized', data, false);
      }

      if (!response.ok) {
        throw new ApiError(response.status, data.message || `HTTP ${response.status}`, data);
      }

      return data;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(0, error instanceof Error ? error.message : 'Upload failed', undefined, true);
    }
  }
}

// Export singleton instance
export const apiClient = new ApiClient();
export { ApiClient };