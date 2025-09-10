/**
 * Loading Components
 * Consistent loading states and indicators for the IT Asset & Software Inventory Management System
 * Based on the original system's loading patterns with modern React implementations
 */

'use client';

import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function LoadingSpinner({
  size = 'md',
  className = '',
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
  };

  return (
    <div
      className={`animate-spin rounded-full border-2 border-gray-300 border-t-blue-600 ${sizeClasses[size]} ${className}`}
    />
  );
}

interface LoadingOverlayProps {
  isLoading: boolean;
  children: React.ReactNode;
  message?: string;
  className?: string;
}

export function LoadingOverlay({
  isLoading,
  children,
  message = 'Loading...',
  className = '',
}: LoadingOverlayProps) {
  return (
    <div className={`relative ${className}`}>
      {children}
      {isLoading && (
        <div className='absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10'>
          <div className='flex flex-col items-center space-y-2'>
            <LoadingSpinner size='lg' />
            <span className='text-sm text-gray-600'>{message}</span>
          </div>
        </div>
      )}
    </div>
  );
}

interface LoadingCardProps {
  title?: string;
  message?: string;
  className?: string;
}

export function LoadingCard({
  title = 'Loading',
  message = 'Please wait...',
  className = '',
}: LoadingCardProps) {
  return (
    <div
      className={`bg-white rounded-lg border border-gray-200 p-6 ${className}`}
    >
      <div className='flex items-center justify-center space-x-3'>
        <LoadingSpinner size='md' />
        <div>
          <h3 className='text-sm font-medium text-gray-900'>{title}</h3>
          <p className='text-sm text-gray-500'>{message}</p>
        </div>
      </div>
    </div>
  );
}

interface LoadingTableRowsProps {
  rows?: number;
  columns?: number;
  className?: string;
}

export function LoadingTableRows({
  rows = 5,
  columns = 4,
  className = '',
}: LoadingTableRowsProps) {
  return (
    <>
      {Array.from({ length: rows }, (_, i) => (
        <tr key={i} className={`animate-pulse ${className}`}>
          {Array.from({ length: columns }, (_, j) => (
            <td key={j} className='px-6 py-4 whitespace-nowrap'>
              <div className='h-4 bg-gray-200 rounded w-full'></div>
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

interface LoadingButtonProps {
  isLoading?: boolean;
  children: React.ReactNode;
  disabled?: boolean;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function LoadingButton({
  isLoading = false,
  children,
  disabled,
  onClick,
  type = 'button',
  variant = 'primary',
  size = 'md',
  className = '',
}: LoadingButtonProps) {
  const baseClasses =
    'inline-flex items-center justify-center font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors';

  const variantClasses = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500',
    secondary:
      'bg-gray-200 hover:bg-gray-300 text-gray-900 focus:ring-gray-500',
    danger: 'bg-red-600 hover:bg-red-700 text-white focus:ring-red-500',
  };

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  };

  const spinnerSizes = {
    sm: 'sm',
    md: 'sm',
    lg: 'md',
  } as const;

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || isLoading}
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
    >
      {isLoading && (
        <LoadingSpinner
          size={spinnerSizes[size]}
          className='mr-2 text-current'
        />
      )}
      {children}
    </button>
  );
}

interface DataLoadingStateProps {
  loading: boolean;
  error: string | null;
  data: any[];
  emptyMessage?: string;
  loadingMessage?: string;
  children: React.ReactNode;
  onRetry?: () => void;
  className?: string;
}

export function DataLoadingState({
  loading,
  error,
  data,
  emptyMessage = 'No data available',
  loadingMessage = 'Loading data...',
  children,
  onRetry,
  className = '',
}: DataLoadingStateProps) {
  if (loading) {
    return (
      <div className={`flex items-center justify-center p-8 ${className}`}>
        <LoadingCard message={loadingMessage} />
      </div>
    );
  }

  if (error) {
    return (
      <div
        className={`bg-red-50 border border-red-200 rounded-lg p-6 ${className}`}
      >
        <div className='flex items-center justify-between'>
          <div className='flex items-center'>
            <div className='text-red-400 mr-3'>
              <svg className='h-5 w-5' fill='currentColor' viewBox='0 0 20 20'>
                <path
                  fillRule='evenodd'
                  d='M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z'
                  clipRule='evenodd'
                />
              </svg>
            </div>
            <div>
              <h3 className='text-sm font-medium text-red-800'>
                Error loading data
              </h3>
              <p className='text-sm text-red-700'>{error}</p>
            </div>
          </div>
          {onRetry && (
            <LoadingButton
              onClick={onRetry}
              variant='secondary'
              size='sm'
              className='ml-4'
            >
              Retry
            </LoadingButton>
          )}
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div
        className={`bg-gray-50 border border-gray-200 rounded-lg p-8 text-center ${className}`}
      >
        <div className='text-gray-400 mb-2'>
          <svg
            className='h-8 w-8 mx-auto'
            fill='none'
            stroke='currentColor'
            viewBox='0 0 24 24'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth={1}
              d='M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2M4 13h2m13-8l-4 4m0 0l-4-4m4 4V3'
            />
          </svg>
        </div>
        <p className='text-sm text-gray-500'>{emptyMessage}</p>
      </div>
    );
  }

  return <>{children}</>;
}

interface ProgressBarProps {
  progress: number; // 0-100
  label?: string;
  showPercentage?: boolean;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  color?: 'blue' | 'green' | 'yellow' | 'red';
}

export function ProgressBar({
  progress,
  label,
  showPercentage = true,
  className = '',
  size = 'md',
  color = 'blue',
}: ProgressBarProps) {
  const sizeClasses = {
    sm: 'h-2',
    md: 'h-3',
    lg: 'h-4',
  };

  const colorClasses = {
    blue: 'bg-blue-600',
    green: 'bg-green-600',
    yellow: 'bg-yellow-600',
    red: 'bg-red-600',
  };

  const clampedProgress = Math.max(0, Math.min(100, progress));

  return (
    <div className={`w-full ${className}`}>
      {(label || showPercentage) && (
        <div className='flex justify-between text-sm text-gray-600 mb-1'>
          {label && <span>{label}</span>}
          {showPercentage && <span>{Math.round(clampedProgress)}%</span>}
        </div>
      )}
      <div className={`w-full bg-gray-200 rounded-full ${sizeClasses[size]}`}>
        <div
          className={`${colorClasses[color]} ${sizeClasses[size]} rounded-full transition-all duration-300 ease-in-out`}
          style={{ width: `${clampedProgress}%` }}
        />
      </div>
    </div>
  );
}
