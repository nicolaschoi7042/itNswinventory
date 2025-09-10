/**
 * Data Fetching Hooks
 * Advanced patterns for data loading, caching, and synchronization
 * Based on the original system's data management patterns with modern React patterns
 */

'use client';

import { useCallback, useRef, useEffect } from 'react';
import { useData } from '@/contexts/DataContext';
import { ApiError } from '@/lib/api-client';

export interface UseFetchOptions {
  // Auto-refresh data when it becomes stale
  autoRefresh?: boolean;
  // Refresh interval in milliseconds (default: 5 minutes)
  refreshInterval?: number;
  // Max age before data is considered stale (default: 5 minutes)
  maxAge?: number;
  // Enable background refresh when tab becomes visible
  refreshOnFocus?: boolean;
  // Enable background refresh when network comes back online
  refreshOnReconnect?: boolean;
}

export interface FetchResult<T = any> {
  data: T;
  loading: boolean;
  error: string | null;
  lastUpdated: number | null;
  isStale: boolean;
  refresh: () => Promise<void>;
}

/**
 * Enhanced data fetching hook with caching, auto-refresh, and error handling
 */
export function useFetch<T = any>(
  key: keyof ReturnType<typeof useData>,
  options: UseFetchOptions = {}
): FetchResult<T> {
  const {
    autoRefresh = true,
    refreshInterval = 5 * 60 * 1000, // 5 minutes
    maxAge = 5 * 60 * 1000, // 5 minutes
    refreshOnFocus = true,
    refreshOnReconnect = true,
  } = options;

  const dataContext = useData();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastFocusTimeRef = useRef<number>(Date.now());

  // Get the appropriate data and methods based on key
  const getData = useCallback(() => {
    switch (key) {
      case 'employees':
        return dataContext.employees as T;
      case 'hardware':
        return dataContext.hardware as T;
      case 'software':
        return dataContext.software as T;
      case 'assignments':
        return dataContext.assignments as T;
      case 'users':
        return dataContext.users as T;
      case 'activities':
        return dataContext.activities as T;
      default:
        return [] as T;
    }
  }, [key, dataContext]);

  const getLoadingState = useCallback(() => {
    const loadingKey = key as keyof typeof dataContext.loading;
    return dataContext.loading[loadingKey] || false;
  }, [key, dataContext.loading]);

  const getErrorState = useCallback(() => {
    const errorKey = key as keyof typeof dataContext.errors;
    return dataContext.errors[errorKey] || null;
  }, [key, dataContext.errors]);

  const getLastUpdated = useCallback(() => {
    const lastUpdatedKey = key as keyof typeof dataContext.lastUpdated;
    return dataContext.lastUpdated[lastUpdatedKey] || null;
  }, [key, dataContext.lastUpdated]);

  const refresh = useCallback(async () => {
    try {
      switch (key) {
        case 'employees':
          await dataContext.loadEmployees();
          break;
        case 'hardware':
          await dataContext.loadHardware();
          break;
        case 'software':
          await dataContext.loadSoftware();
          break;
        case 'assignments':
          await dataContext.loadAssignments();
          break;
        case 'users':
          await dataContext.loadUsers();
          break;
        case 'activities':
          await dataContext.loadActivities();
          break;
      }
    } catch (error) {
      console.error(`Failed to refresh ${key}:`, error);
    }
  }, [key, dataContext]);

  const isStale = useCallback(() => {
    const lastUpdated = getLastUpdated();
    if (!lastUpdated) return true;
    return Date.now() - lastUpdated > maxAge;
  }, [getLastUpdated, maxAge]);

  // Auto-refresh setup
  useEffect(() => {
    if (!autoRefresh) return;

    // Initial load if data is stale or missing
    if (isStale() && !getLoadingState()) {
      refresh();
    }

    // Set up interval for periodic refresh
    if (refreshInterval > 0) {
      intervalRef.current = setInterval(() => {
        if (!getLoadingState() && isStale()) {
          refresh();
        }
      }, refreshInterval);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [autoRefresh, refreshInterval, refresh, isStale, getLoadingState]);

  // Refresh on focus
  useEffect(() => {
    if (!refreshOnFocus) return;

    const handleFocus = () => {
      const now = Date.now();
      // Only refresh if it's been more than 30 seconds since last focus
      if (
        now - lastFocusTimeRef.current > 30000 &&
        isStale() &&
        !getLoadingState()
      ) {
        refresh();
      }
      lastFocusTimeRef.current = now;
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [refreshOnFocus, refresh, isStale, getLoadingState]);

  // Refresh on network reconnect
  useEffect(() => {
    if (!refreshOnReconnect) return;

    const handleOnline = () => {
      if (isStale() && !getLoadingState()) {
        refresh();
      }
    };

    window.addEventListener('online', handleOnline);
    return () => window.removeEventListener('online', handleOnline);
  }, [refreshOnReconnect, refresh, isStale, getLoadingState]);

  return {
    data: getData(),
    loading: getLoadingState(),
    error: getErrorState(),
    lastUpdated: getLastUpdated(),
    isStale: isStale(),
    refresh,
  };
}

/**
 * Hook for bulk data operations with loading coordination
 */
export function useBulkFetch(keys: Array<keyof ReturnType<typeof useData>>) {
  const dataContext = useData();

  const refreshAll = useCallback(async () => {
    const promises = keys.map(key => {
      switch (key) {
        case 'employees':
          return dataContext.loadEmployees();
        case 'hardware':
          return dataContext.loadHardware();
        case 'software':
          return dataContext.loadSoftware();
        case 'assignments':
          return dataContext.loadAssignments();
        case 'users':
          return dataContext.loadUsers();
        case 'activities':
          return dataContext.loadActivities();
        default:
          return Promise.resolve();
      }
    });

    try {
      await Promise.all(promises);
    } catch (error) {
      console.error('Bulk refresh failed:', error);
      throw error;
    }
  }, [keys, dataContext]);

  const isAnyLoading = keys.some(key => {
    const loadingKey = key as keyof typeof dataContext.loading;
    return dataContext.loading[loadingKey];
  });

  const hasAnyError = keys.some(key => {
    const errorKey = key as keyof typeof dataContext.errors;
    return dataContext.errors[errorKey];
  });

  const allLastUpdated = keys.reduce(
    (acc, key) => {
      const lastUpdatedKey = key as keyof typeof dataContext.lastUpdated;
      const lastUpdated = dataContext.lastUpdated[lastUpdatedKey];
      acc[key] = lastUpdated;
      return acc;
    },
    {} as Record<string, number | null>
  );

  return {
    refreshAll,
    isAnyLoading,
    hasAnyError,
    allLastUpdated,
  };
}

/**
 * Hook for smart data preloading based on user navigation patterns
 */
export function usePreloader() {
  const dataContext = useData();

  const preloadForTab = useCallback(
    async (tabName: string) => {
      try {
        switch (tabName) {
          case 'dashboard':
            // Preload summary data
            await Promise.all([
              dataContext.loadEmployees(),
              dataContext.loadHardware(),
              dataContext.loadAssignments(),
              dataContext.loadActivities(),
            ]);
            break;
          case 'employees':
            await dataContext.loadEmployees();
            break;
          case 'hardware':
            await dataContext.loadHardware();
            break;
          case 'software':
            await dataContext.loadSoftware();
            break;
          case 'assignments':
            await Promise.all([
              dataContext.loadAssignments(),
              dataContext.loadEmployees(), // Needed for assignment details
              dataContext.loadHardware(),
              dataContext.loadSoftware(),
            ]);
            break;
          case 'users':
            await dataContext.loadUsers();
            break;
          case 'activities':
            await dataContext.loadActivities();
            break;
        }
      } catch (error) {
        console.error(`Failed to preload data for ${tabName}:`, error);
      }
    },
    [dataContext]
  );

  const preloadAll = useCallback(async () => {
    try {
      await dataContext.loadAllData();
    } catch (error) {
      console.error('Failed to preload all data:', error);
    }
  }, [dataContext]);

  return {
    preloadForTab,
    preloadAll,
  };
}

/**
 * Hook for handling optimistic updates
 */
export function useOptimisticUpdates() {
  const dataContext = useData();

  const updateOptimistically = useCallback(
    (
      type: 'employee' | 'hardware' | 'software' | 'assignment' | 'user',
      item: any,
      operation: 'add' | 'update' | 'remove'
    ) => {
      try {
        switch (type) {
          case 'employee':
            if (operation === 'add') dataContext.addEmployee(item);
            else if (operation === 'update') dataContext.updateEmployee(item);
            else if (operation === 'remove')
              dataContext.removeEmployee(item.id || item);
            break;
          case 'hardware':
            if (operation === 'add') dataContext.addHardware(item);
            else if (operation === 'update') dataContext.updateHardware(item);
            else if (operation === 'remove')
              dataContext.removeHardware(item.id || item);
            break;
          case 'software':
            if (operation === 'add') dataContext.addSoftware(item);
            else if (operation === 'update') dataContext.updateSoftware(item);
            else if (operation === 'remove')
              dataContext.removeSoftware(item.id || item);
            break;
          case 'assignment':
            if (operation === 'add') dataContext.addAssignment(item);
            else if (operation === 'update') dataContext.updateAssignment(item);
            else if (operation === 'remove')
              dataContext.removeAssignment(item.id || item);
            break;
          case 'user':
            if (operation === 'add') dataContext.addUser(item);
            else if (operation === 'update') dataContext.updateUser(item);
            else if (operation === 'remove')
              dataContext.removeUser(item.id || item);
            break;
        }
      } catch (error) {
        console.error(
          `Optimistic update failed for ${type} ${operation}:`,
          error
        );
      }
    },
    [dataContext]
  );

  return {
    updateOptimistically,
  };
}
