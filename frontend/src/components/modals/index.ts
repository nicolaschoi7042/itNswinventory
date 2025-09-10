// Modal and Dialog components exports
export {
  FormModal,
  ConfirmFormModal,
  QuickFormModal,
  useFormModal,
} from './FormModal';

export {
  ConfirmDialog,
  DeleteConfirmDialog,
  LogoutConfirmDialog,
  UnsavedChangesDialog,
  useConfirmDialog,
  withConfirmDialog,
} from './ConfirmDialog';

export {
  InfoDialog,
  InfoField,
  InfoSection,
  EmployeeInfoDialog,
  HardwareInfoDialog,
  SoftwareInfoDialog,
  useInfoDialog,
} from './InfoDialog';

export {
  AlertDialog,
  ToastNotification,
  ErrorAlert,
  SuccessAlert,
  ProgressAlert,
  useAlertDialog,
  useToast,
} from './AlertDialog';

export { EmployeeFormModal, useEmployeeFormModal } from './EmployeeFormModal';

export {
  EmployeeDetailModal,
  useEmployeeDetailModal,
} from './EmployeeDetailModal';

export { HardwareFormModal, useHardwareFormModal } from './HardwareFormModal';

export {
  HardwareDetailModal,
  useHardwareDetailModal,
} from './HardwareDetailModal';

export { SoftwareFormModal } from './SoftwareFormModal';

export { SoftwareDetailModal } from './SoftwareDetailModal';

export {
  SoftwareAssignmentModal,
  useSoftwareAssignmentModal,
} from './SoftwareAssignmentModal';

export {
  SoftwareReturnModal,
  useSoftwareReturnModal,
} from './SoftwareReturnModal';

export { AssignmentFormModal } from './AssignmentFormModal';

export { AssignmentDetailModal } from './AssignmentDetailModal';

export { AssetReturnModal } from './AssetReturnModal';

export { AdvancedSearchModal } from './AdvancedSearchModal';

// Re-export commonly used types
export type { UserRole } from '../tables/TableActions';

// Common modal configurations
export const modalSizes = {
  small: 'xs' as const,
  medium: 'sm' as const,
  large: 'md' as const,
  extraLarge: 'lg' as const,
  full: 'xl' as const,
};

// Common modal utilities
export const modalUtils = {
  /**
   * Create a modal title with subtitle
   */
  createTitle: (title: string, subtitle?: string) => ({
    title,
    subtitle: subtitle || undefined,
  }),

  /**
   * Create standard form modal props
   */
  createFormModalProps: (
    title: string,
    onSubmit: (event: React.FormEvent<HTMLFormElement>) => void | Promise<void>,
    options: {
      subtitle?: string;
      submitLabel?: string;
      cancelLabel?: string;
      loading?: boolean;
      disabled?: boolean;
      size?: keyof typeof modalSizes;
    } = {}
  ) => ({
    title,
    subtitle: options.subtitle,
    onSubmit,
    submitLabel: options.submitLabel || 'Save',
    cancelLabel: options.cancelLabel || 'Cancel',
    loading: options.loading || false,
    disabled: options.disabled || false,
    maxWidth: modalSizes[options.size || 'medium'],
    fullWidth: true,
  }),

  /**
   * Create standard confirm dialog props
   */
  createConfirmProps: (
    title: string,
    message: string,
    onConfirm: () => void | Promise<void>,
    options: {
      variant?: 'warning' | 'error' | 'info' | 'success';
      confirmLabel?: string;
      cancelLabel?: string;
      destructive?: boolean;
      additionalInfo?: string;
    } = {}
  ) => ({
    title,
    message,
    onConfirm,
    variant: options.variant || 'warning',
    confirmLabel: options.confirmLabel || 'Confirm',
    cancelLabel: options.cancelLabel || 'Cancel',
    destructive: options.destructive || false,
    additionalInfo: options.additionalInfo,
  }),

  /**
   * Create standard info dialog props
   */
  createInfoProps: (
    title: string,
    options: {
      subtitle?: string;
      size?: keyof typeof modalSizes;
      onEdit?: () => void;
      onPrint?: () => void;
      onShare?: () => void;
    } = {}
  ) => ({
    title,
    subtitle: options.subtitle,
    maxWidth: modalSizes[options.size || 'large'],
    fullWidth: true,
    onEdit: options.onEdit,
    onPrint: options.onPrint,
    onShare: options.onShare,
  }),

  /**
   * Create standard alert props
   */
  createAlertProps: (
    title: string,
    message: string,
    options: {
      severity?: 'success' | 'error' | 'warning' | 'info';
      autoHideDuration?: number | null;
      onAction?: () => void;
      actionLabel?: string;
      details?: string;
    } = {}
  ) => ({
    title,
    message,
    severity: options.severity || 'info',
    autoHideDuration: options.autoHideDuration,
    onAction: options.onAction,
    actionLabel: options.actionLabel || 'OK',
    details: options.details,
  }),
};

// Pre-configured modal variants for common use cases
export const commonModals = {
  /**
   * Employee form modal
   */
  employeeForm: (
    isEdit: boolean,
    onSubmit: (event: React.FormEvent<HTMLFormElement>) => void | Promise<void>,
    options: { loading?: boolean; disabled?: boolean } = {}
  ) =>
    modalUtils.createFormModalProps(
      isEdit ? 'Edit Employee' : 'Add New Employee',
      onSubmit,
      {
        subtitle: isEdit
          ? 'Update employee information'
          : 'Enter new employee details',
        submitLabel: isEdit ? 'Update Employee' : 'Create Employee',
        ...options,
      }
    ),

  /**
   * Hardware form modal
   */
  hardwareForm: (
    isEdit: boolean,
    onSubmit: (event: React.FormEvent<HTMLFormElement>) => void | Promise<void>,
    options: { loading?: boolean; disabled?: boolean } = {}
  ) =>
    modalUtils.createFormModalProps(
      isEdit ? 'Edit Hardware Asset' : 'Add New Hardware Asset',
      onSubmit,
      {
        subtitle: isEdit
          ? 'Update hardware asset information'
          : 'Enter new hardware asset details',
        submitLabel: isEdit ? 'Update Asset' : 'Create Asset',
        size: 'large',
        ...options,
      }
    ),

  /**
   * Software form modal
   */
  softwareForm: (
    isEdit: boolean,
    onSubmit: (event: React.FormEvent<HTMLFormElement>) => void | Promise<void>,
    options: { loading?: boolean; disabled?: boolean } = {}
  ) =>
    modalUtils.createFormModalProps(
      isEdit ? 'Edit Software License' : 'Add New Software License',
      onSubmit,
      {
        subtitle: isEdit
          ? 'Update software license information'
          : 'Enter new software license details',
        submitLabel: isEdit ? 'Update License' : 'Create License',
        size: 'large',
        ...options,
      }
    ),

  /**
   * Assignment form modal
   */
  assignmentForm: (
    onSubmit: (event: React.FormEvent<HTMLFormElement>) => void | Promise<void>,
    options: { loading?: boolean; disabled?: boolean } = {}
  ) =>
    modalUtils.createFormModalProps('Assign Asset', onSubmit, {
      subtitle: 'Assign an asset to an employee',
      submitLabel: 'Assign Asset',
      ...options,
    }),

  /**
   * User form modal
   */
  userForm: (
    isEdit: boolean,
    onSubmit: (event: React.FormEvent<HTMLFormElement>) => void | Promise<void>,
    options: { loading?: boolean; disabled?: boolean } = {}
  ) =>
    modalUtils.createFormModalProps(
      isEdit ? 'Edit User' : 'Add New User',
      onSubmit,
      {
        subtitle: isEdit
          ? 'Update user information and permissions'
          : 'Create a new user account',
        submitLabel: isEdit ? 'Update User' : 'Create User',
        ...options,
      }
    ),

  /**
   * Delete confirmation dialogs
   */
  deleteEmployee: (
    employeeName: string,
    onConfirm: () => void | Promise<void>
  ) =>
    modalUtils.createConfirmProps(
      'Delete Employee',
      `Are you sure you want to delete "${employeeName}"?`,
      onConfirm,
      {
        variant: 'error',
        confirmLabel: 'Delete Employee',
        destructive: true,
        additionalInfo:
          'This will also remove all asset assignments for this employee.',
      }
    ),

  deleteHardware: (
    hardwareName: string,
    onConfirm: () => void | Promise<void>
  ) =>
    modalUtils.createConfirmProps(
      'Delete Hardware Asset',
      `Are you sure you want to delete "${hardwareName}"?`,
      onConfirm,
      {
        variant: 'error',
        confirmLabel: 'Delete Asset',
        destructive: true,
        additionalInfo: 'This will also remove any assignments for this asset.',
      }
    ),

  deleteSoftware: (
    softwareName: string,
    onConfirm: () => void | Promise<void>
  ) =>
    modalUtils.createConfirmProps(
      'Delete Software License',
      `Are you sure you want to delete "${softwareName}"?`,
      onConfirm,
      {
        variant: 'error',
        confirmLabel: 'Delete License',
        destructive: true,
        additionalInfo:
          'This will also remove any assignments for this software.',
      }
    ),

  deleteUser: (username: string, onConfirm: () => void | Promise<void>) =>
    modalUtils.createConfirmProps(
      'Delete User Account',
      `Are you sure you want to delete user "${username}"?`,
      onConfirm,
      {
        variant: 'error',
        confirmLabel: 'Delete User',
        destructive: true,
        additionalInfo:
          'This action cannot be undone and will revoke all access for this user.',
      }
    ),
};
