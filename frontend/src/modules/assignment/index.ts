/**
 * Assignment Module Index
 * 
 * Central export file for all assignment-related functionality.
 * This makes it easier to import assignment features across the application.
 */

// Types and interfaces
export * from '@/types/assignment';

// Constants and configurations
export * from '@/constants/assignment';

// Utility functions
export * from '@/utils/assignment.utils';

// Re-export commonly used utilities with shorter names
export {
  formatDate as formatAssignmentDate,
  getAssignmentStatusInfo as getStatusInfo,
  isActiveAssignment as isActive,
  isReturnedAssignment as isReturned,
  formatAssignmentDuration as formatDuration,
  calculateAssignmentStats as calculateStats,
  validateCreateAssignmentData as validateCreateData,
  validateReturnAssignmentData as validateReturnData
} from '@/utils/assignment.utils';

// Default configuration object for easy access
export const AssignmentConfig = {
  DEFAULT_PAGE_SIZE: 20,
  MAX_SEARCH_LENGTH: 100,
  VALIDATION_RULES: {
    NOTES_MAX_LENGTH: 500,
    MIN_SEARCH_LENGTH: 2
  }
} as const;