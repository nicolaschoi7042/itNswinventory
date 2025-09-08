/**
 * Error Boundary Component
 * Graceful error handling for React component errors
 * Based on the original system's error handling patterns
 */

'use client';

import React from 'react';
import { LoadingButton } from './loading';

interface ErrorInfo {
  componentStack: string;
  errorBoundary?: string | null;
  errorBoundaryFound?: boolean;
  errorBoundaryStack?: string | null;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error?: Error; reset: () => void }>;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  resetOnPropsChange?: boolean;
  resetKeys?: Array<string | number>;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  private resetTimeoutId?: number;

  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
    };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    const info: ErrorInfo = {
      componentStack: errorInfo.componentStack,
    };

    this.setState({
      error,
      errorInfo: info,
    });

    // Call the onError callback if provided
    if (this.props.onError) {
      this.props.onError(error, info);
    }

    // Log to console for development
    console.error('ErrorBoundary caught an error:', error);
    console.error('Component stack:', errorInfo.componentStack);
  }

  componentDidUpdate(prevProps: ErrorBoundaryProps) {
    const { resetKeys, resetOnPropsChange } = this.props;
    const { hasError } = this.state;

    // Reset error state if resetOnPropsChange is true and props changed
    if (hasError && resetOnPropsChange && prevProps.children !== this.props.children) {
      this.resetErrorBoundary();
      return;
    }

    // Reset error state if any of the reset keys changed
    if (hasError && resetKeys && prevProps.resetKeys) {
      const hasResetKeyChanged = resetKeys.some((key, index) => key !== prevProps.resetKeys![index]);
      if (hasResetKeyChanged) {
        this.resetErrorBoundary();
      }
    }
  }

  resetErrorBoundary = () => {
    if (this.resetTimeoutId) {
      window.clearTimeout(this.resetTimeoutId);
    }

    this.resetTimeoutId = window.setTimeout(() => {
      this.setState({
        hasError: false,
        error: undefined,
        errorInfo: undefined,
      });
    }, 0);
  };

  render() {
    const { hasError, error } = this.state;
    const { children, fallback: Fallback } = this.props;

    if (hasError) {
      if (Fallback) {
        return <Fallback error={error} reset={this.resetErrorBoundary} />;
      }

      return <DefaultErrorFallback error={error} reset={this.resetErrorBoundary} />;
    }

    return children;
  }
}

interface DefaultErrorFallbackProps {
  error?: Error;
  reset: () => void;
}

function DefaultErrorFallback({ error, reset }: DefaultErrorFallbackProps) {
  return (
    <div className="min-h-96 flex items-center justify-center p-8">
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md w-full">
        <div className="flex items-center mb-4">
          <div className="text-red-400 mr-3">
            <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <h2 className="text-lg font-semibold text-red-800">Something went wrong</h2>
        </div>
        
        <div className="mb-4">
          <p className="text-sm text-red-700 mb-2">
            An unexpected error occurred. This has been logged and will be investigated.
          </p>
          
          {error && process.env.NODE_ENV === 'development' && (
            <details className="bg-red-100 rounded p-3 mt-3">
              <summary className="text-xs font-medium text-red-800 cursor-pointer">
                Error Details (Development Only)
              </summary>
              <pre className="text-xs text-red-700 mt-2 whitespace-pre-wrap overflow-auto max-h-32">
                {error.name}: {error.message}
                {error.stack && '\n\nStack trace:\n' + error.stack}
              </pre>
            </details>
          )}
        </div>

        <div className="flex space-x-3">
          <LoadingButton
            onClick={reset}
            variant="primary"
            size="sm"
            className="flex-1"
          >
            Try Again
          </LoadingButton>
          
          <LoadingButton
            onClick={() => window.location.reload()}
            variant="secondary"
            size="sm"
            className="flex-1"
          >
            Reload Page
          </LoadingButton>
        </div>
      </div>
    </div>
  );
}

/**
 * Hook for error handling within components
 */
export function useErrorHandler() {
  const [error, setError] = React.useState<Error | null>(null);

  const resetError = React.useCallback(() => {
    setError(null);
  }, []);

  const handleError = React.useCallback((error: Error | unknown) => {
    const errorInstance = error instanceof Error ? error : new Error(String(error));
    setError(errorInstance);
    console.error('Component error:', errorInstance);
  }, []);

  // Throw error in render to trigger error boundary
  if (error) {
    throw error;
  }

  return {
    handleError,
    resetError,
  };
}

/**
 * Error boundary specifically for async operations
 */
export function AsyncErrorBoundary({ children, onError }: { 
  children: React.ReactNode; 
  onError?: (error: Error) => void;
}) {
  const handleError = React.useCallback((error: Error, errorInfo: ErrorInfo) => {
    // Log async errors
    console.error('Async operation failed:', error);
    
    if (onError) {
      onError(error);
    }
  }, [onError]);

  return (
    <ErrorBoundary
      onError={handleError}
      fallback={({ error, reset }) => (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="text-yellow-400 mr-3">
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-medium text-yellow-800">Operation Failed</h3>
              <p className="text-sm text-yellow-700">
                {error?.message || 'An error occurred during the operation'}
              </p>
            </div>
            <LoadingButton
              onClick={reset}
              variant="secondary"
              size="sm"
              className="ml-4"
            >
              Retry
            </LoadingButton>
          </div>
        </div>
      )}
    >
      {children}
    </ErrorBoundary>
  );
}

export default ErrorBoundary;