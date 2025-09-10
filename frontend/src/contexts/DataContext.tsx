/**
 * Data Context
 * Global state management for IT Asset & Software Inventory Management System
 * Based on the original vanilla JavaScript dataStore pattern
 */

'use client';

import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useCallback,
} from 'react';
import { apiService } from '@/services/api.service';
import type { ApiResponse } from '@/types/api';
import type { Employee } from '@/types/employee';
import type { Hardware } from '@/types/hardware';
import type { Software } from '@/types/software';
import type { Assignment } from '@/types/assignment';
import type { User } from '@/types/user';
import type { Activity } from '@/types/activity';

// State interface
export interface DataState {
  employees: Employee[];
  hardware: Hardware[];
  software: Software[];
  assignments: Assignment[];
  users: User[];
  activities: Activity[];
  loading: {
    employees: boolean;
    hardware: boolean;
    software: boolean;
    assignments: boolean;
    users: boolean;
    activities: boolean;
  };
  errors: {
    employees: string | null;
    hardware: string | null;
    software: string | null;
    assignments: string | null;
    users: string | null;
    activities: string | null;
  };
  lastUpdated: {
    employees: number | null;
    hardware: number | null;
    software: number | null;
    assignments: number | null;
    users: number | null;
    activities: number | null;
  };
}

// Action types
type DataAction =
  | {
      type: 'SET_LOADING';
      payload: { key: keyof DataState['loading']; loading: boolean };
    }
  | {
      type: 'SET_ERROR';
      payload: { key: keyof DataState['errors']; error: string | null };
    }
  | { type: 'SET_EMPLOYEES'; payload: Employee[] }
  | { type: 'SET_HARDWARE'; payload: Hardware[] }
  | { type: 'SET_SOFTWARE'; payload: Software[] }
  | { type: 'SET_ASSIGNMENTS'; payload: Assignment[] }
  | { type: 'SET_USERS'; payload: User[] }
  | { type: 'SET_ACTIVITIES'; payload: Activity[] }
  | { type: 'ADD_EMPLOYEE'; payload: Employee }
  | { type: 'UPDATE_EMPLOYEE'; payload: Employee }
  | { type: 'REMOVE_EMPLOYEE'; payload: string }
  | { type: 'ADD_HARDWARE'; payload: Hardware }
  | { type: 'UPDATE_HARDWARE'; payload: Hardware }
  | { type: 'REMOVE_HARDWARE'; payload: string }
  | { type: 'ADD_SOFTWARE'; payload: Software }
  | { type: 'UPDATE_SOFTWARE'; payload: Software }
  | { type: 'REMOVE_SOFTWARE'; payload: string }
  | { type: 'ADD_ASSIGNMENT'; payload: Assignment }
  | { type: 'UPDATE_ASSIGNMENT'; payload: Assignment }
  | { type: 'REMOVE_ASSIGNMENT'; payload: string }
  | { type: 'ADD_USER'; payload: User }
  | { type: 'UPDATE_USER'; payload: User }
  | { type: 'REMOVE_USER'; payload: string }
  | { type: 'ADD_ACTIVITY'; payload: Activity }
  | { type: 'CLEAR_ALL_DATA' };

// Initial state
const initialState: DataState = {
  employees: [],
  hardware: [],
  software: [],
  assignments: [],
  users: [],
  activities: [],
  loading: {
    employees: false,
    hardware: false,
    software: false,
    assignments: false,
    users: false,
    activities: false,
  },
  errors: {
    employees: null,
    hardware: null,
    software: null,
    assignments: null,
    users: null,
    activities: null,
  },
  lastUpdated: {
    employees: null,
    hardware: null,
    software: null,
    assignments: null,
    users: null,
    activities: null,
  },
};

// Reducer function
function dataReducer(state: DataState, action: DataAction): DataState {
  switch (action.type) {
    case 'SET_LOADING':
      return {
        ...state,
        loading: {
          ...state.loading,
          [action.payload.key]: action.payload.loading,
        },
      };

    case 'SET_ERROR':
      return {
        ...state,
        errors: {
          ...state.errors,
          [action.payload.key]: action.payload.error,
        },
      };

    case 'SET_EMPLOYEES':
      return {
        ...state,
        employees: action.payload,
        lastUpdated: {
          ...state.lastUpdated,
          employees: Date.now(),
        },
      };

    case 'SET_HARDWARE':
      return {
        ...state,
        hardware: action.payload,
        lastUpdated: {
          ...state.lastUpdated,
          hardware: Date.now(),
        },
      };

    case 'SET_SOFTWARE':
      return {
        ...state,
        software: action.payload,
        lastUpdated: {
          ...state.lastUpdated,
          software: Date.now(),
        },
      };

    case 'SET_ASSIGNMENTS':
      return {
        ...state,
        assignments: action.payload,
        lastUpdated: {
          ...state.lastUpdated,
          assignments: Date.now(),
        },
      };

    case 'SET_USERS':
      return {
        ...state,
        users: action.payload,
        lastUpdated: {
          ...state.lastUpdated,
          users: Date.now(),
        },
      };

    case 'SET_ACTIVITIES':
      return {
        ...state,
        activities: action.payload,
        lastUpdated: {
          ...state.lastUpdated,
          activities: Date.now(),
        },
      };

    case 'ADD_EMPLOYEE':
      return {
        ...state,
        employees: [...state.employees, action.payload],
      };

    case 'UPDATE_EMPLOYEE':
      return {
        ...state,
        employees: state.employees.map(item =>
          item.id === action.payload.id ? action.payload : item
        ),
      };

    case 'REMOVE_EMPLOYEE':
      return {
        ...state,
        employees: state.employees.filter(item => item.id !== action.payload),
      };

    case 'ADD_HARDWARE':
      return {
        ...state,
        hardware: [...state.hardware, action.payload],
      };

    case 'UPDATE_HARDWARE':
      return {
        ...state,
        hardware: state.hardware.map(item =>
          item.id === action.payload.id ? action.payload : item
        ),
      };

    case 'REMOVE_HARDWARE':
      return {
        ...state,
        hardware: state.hardware.filter(item => item.id !== action.payload),
      };

    case 'ADD_SOFTWARE':
      return {
        ...state,
        software: [...state.software, action.payload],
      };

    case 'UPDATE_SOFTWARE':
      return {
        ...state,
        software: state.software.map(item =>
          item.id === action.payload.id ? action.payload : item
        ),
      };

    case 'REMOVE_SOFTWARE':
      return {
        ...state,
        software: state.software.filter(item => item.id !== action.payload),
      };

    case 'ADD_ASSIGNMENT':
      return {
        ...state,
        assignments: [...state.assignments, action.payload],
      };

    case 'UPDATE_ASSIGNMENT':
      return {
        ...state,
        assignments: state.assignments.map(item =>
          item.id === action.payload.id ? action.payload : item
        ),
      };

    case 'REMOVE_ASSIGNMENT':
      return {
        ...state,
        assignments: state.assignments.filter(
          item => item.id !== action.payload
        ),
      };

    case 'ADD_USER':
      return {
        ...state,
        users: [...state.users, action.payload],
      };

    case 'UPDATE_USER':
      return {
        ...state,
        users: state.users.map(item =>
          item.id === action.payload.id ? action.payload : item
        ),
      };

    case 'REMOVE_USER':
      return {
        ...state,
        users: state.users.filter(item => item.id !== action.payload),
      };

    case 'ADD_ACTIVITY':
      return {
        ...state,
        activities: [action.payload, ...state.activities].slice(0, 100), // Keep only last 100 activities
      };

    case 'CLEAR_ALL_DATA':
      return {
        ...initialState,
      };

    default:
      return state;
  }
}

// Context interface
interface DataContextType extends DataState {
  // Data loading functions
  loadAllData: () => Promise<void>;
  loadEmployees: () => Promise<void>;
  loadHardware: () => Promise<void>;
  loadSoftware: () => Promise<void>;
  loadAssignments: () => Promise<void>;
  loadUsers: () => Promise<void>;
  loadActivities: () => Promise<void>;

  // Data manipulation functions
  addEmployee: (employee: Employee) => void;
  updateEmployee: (employee: Employee) => void;
  removeEmployee: (id: string) => void;
  addHardware: (hardware: Hardware) => void;
  updateHardware: (hardware: Hardware) => void;
  removeHardware: (id: string) => void;
  addSoftware: (software: Software) => void;
  updateSoftware: (software: Software) => void;
  removeSoftware: (id: string) => void;
  addAssignment: (assignment: Assignment) => void;
  updateAssignment: (assignment: Assignment) => void;
  removeAssignment: (id: string) => void;
  addUser: (user: User) => void;
  updateUser: (user: User) => void;
  removeUser: (id: string) => void;
  addActivity: (activity: Activity) => void;

  // Utility functions
  clearAllData: () => void;
  isDataStale: (
    key: keyof DataState['lastUpdated'],
    maxAge?: number
  ) => boolean;
}

// Create context
const DataContext = createContext<DataContextType | undefined>(undefined);

// Provider component
export function DataProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(dataReducer, initialState);

  // Helper function to handle API calls with loading and error states
  const handleApiCall = useCallback(
    async <T,>(
      key: keyof DataState['loading'],
      apiCall: () => Promise<ApiResponse<T>>,
      successAction: (data: T) => DataAction
    ) => {
      dispatch({ type: 'SET_LOADING', payload: { key, loading: true } });
      dispatch({ type: 'SET_ERROR', payload: { key, error: null } });

      try {
        const response = await apiCall();
        if (response.success && response.data) {
          dispatch(successAction(response.data));
        } else {
          const errorMessage =
            response.error || response.message || 'Failed to load data';
          dispatch({
            type: 'SET_ERROR',
            payload: { key, error: errorMessage },
          });
        }
      } catch (error: any) {
        const errorMessage = error.message || 'An error occurred';
        dispatch({ type: 'SET_ERROR', payload: { key, error: errorMessage } });
        console.error(`Error loading ${key}:`, error);
      } finally {
        dispatch({ type: 'SET_LOADING', payload: { key, loading: false } });
      }
    },
    []
  );

  // Data loading functions
  const loadEmployees = useCallback(async () => {
    await handleApiCall(
      'employees',
      () => apiService.employees.getAll(),
      data => ({ type: 'SET_EMPLOYEES', payload: data })
    );
  }, [handleApiCall]);

  const loadHardware = useCallback(async () => {
    await handleApiCall(
      'hardware',
      () => apiService.hardware.getAll(),
      data => ({ type: 'SET_HARDWARE', payload: data })
    );
  }, [handleApiCall]);

  const loadSoftware = useCallback(async () => {
    await handleApiCall(
      'software',
      () => apiService.software.getAll(),
      data => ({ type: 'SET_SOFTWARE', payload: data })
    );
  }, [handleApiCall]);

  const loadAssignments = useCallback(async () => {
    await handleApiCall(
      'assignments',
      () => apiService.assignments.getAll(),
      data => ({ type: 'SET_ASSIGNMENTS', payload: data })
    );
  }, [handleApiCall]);

  const loadUsers = useCallback(async () => {
    await handleApiCall(
      'users',
      () => apiService.users.getAll(),
      data => ({ type: 'SET_USERS', payload: data })
    );
  }, [handleApiCall]);

  const loadActivities = useCallback(async () => {
    await handleApiCall(
      'activities',
      () => apiService.activities.getRecent(50),
      data => ({ type: 'SET_ACTIVITIES', payload: data })
    );
  }, [handleApiCall]);

  // Load all data
  const loadAllData = useCallback(async () => {
    await Promise.all([
      loadEmployees(),
      loadHardware(),
      loadSoftware(),
      loadAssignments(),
      loadActivities(),
    ]);
  }, [
    loadEmployees,
    loadHardware,
    loadSoftware,
    loadAssignments,
    loadActivities,
  ]);

  // Data manipulation functions
  const addEmployee = useCallback((employee: Employee) => {
    dispatch({ type: 'ADD_EMPLOYEE', payload: employee });
  }, []);

  const updateEmployee = useCallback((employee: Employee) => {
    dispatch({ type: 'UPDATE_EMPLOYEE', payload: employee });
  }, []);

  const removeEmployee = useCallback((id: string) => {
    dispatch({ type: 'REMOVE_EMPLOYEE', payload: id });
  }, []);

  const addHardware = useCallback((hardware: Hardware) => {
    dispatch({ type: 'ADD_HARDWARE', payload: hardware });
  }, []);

  const updateHardware = useCallback((hardware: Hardware) => {
    dispatch({ type: 'UPDATE_HARDWARE', payload: hardware });
  }, []);

  const removeHardware = useCallback((id: string) => {
    dispatch({ type: 'REMOVE_HARDWARE', payload: id });
  }, []);

  const addSoftware = useCallback((software: Software) => {
    dispatch({ type: 'ADD_SOFTWARE', payload: software });
  }, []);

  const updateSoftware = useCallback((software: Software) => {
    dispatch({ type: 'UPDATE_SOFTWARE', payload: software });
  }, []);

  const removeSoftware = useCallback((id: string) => {
    dispatch({ type: 'REMOVE_SOFTWARE', payload: id });
  }, []);

  const addAssignment = useCallback((assignment: Assignment) => {
    dispatch({ type: 'ADD_ASSIGNMENT', payload: assignment });
  }, []);

  const updateAssignment = useCallback((assignment: Assignment) => {
    dispatch({ type: 'UPDATE_ASSIGNMENT', payload: assignment });
  }, []);

  const removeAssignment = useCallback((id: string) => {
    dispatch({ type: 'REMOVE_ASSIGNMENT', payload: id });
  }, []);

  const addUser = useCallback((user: User) => {
    dispatch({ type: 'ADD_USER', payload: user });
  }, []);

  const updateUser = useCallback((user: User) => {
    dispatch({ type: 'UPDATE_USER', payload: user });
  }, []);

  const removeUser = useCallback((id: string) => {
    dispatch({ type: 'REMOVE_USER', payload: id });
  }, []);

  const addActivity = useCallback((activity: Activity) => {
    dispatch({ type: 'ADD_ACTIVITY', payload: activity });
  }, []);

  const clearAllData = useCallback(() => {
    dispatch({ type: 'CLEAR_ALL_DATA' });
  }, []);

  // Check if data is stale
  const isDataStale = useCallback(
    (key: keyof DataState['lastUpdated'], maxAge: number = 300000): boolean => {
      const lastUpdated = state.lastUpdated[key];
      if (!lastUpdated) return true;
      return Date.now() - lastUpdated > maxAge;
    },
    [state.lastUpdated]
  );

  // Context value
  const value: DataContextType = {
    ...state,
    loadAllData,
    loadEmployees,
    loadHardware,
    loadSoftware,
    loadAssignments,
    loadUsers,
    loadActivities,
    addEmployee,
    updateEmployee,
    removeEmployee,
    addHardware,
    updateHardware,
    removeHardware,
    addSoftware,
    updateSoftware,
    removeSoftware,
    addAssignment,
    updateAssignment,
    removeAssignment,
    addUser,
    updateUser,
    removeUser,
    addActivity,
    clearAllData,
    isDataStale,
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

// Hook to use the data context
export function useData() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}
