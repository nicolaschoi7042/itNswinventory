// API Response Types

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Employee Types
export interface Employee {
  id: string;
  employeeId: string;
  name: string;
  department: string;
  position: string;
  email: string;
  phone: string;
  hireDate: string;
  status: 'active' | 'inactive' | 'terminated';
  createdAt: string;
  updatedAt: string;
}

export interface CreateEmployeeData {
  employeeId: string;
  name: string;
  department: string;
  position: string;
  email: string;
  phone: string;
  hireDate: string;
}

// Hardware Types
export interface Hardware {
  id: string;
  assetTag: string;
  type: string;
  model: string;
  manufacturer: string;
  serialNumber: string;
  purchaseDate: string;
  warrantyExpiry?: string;
  cost: number;
  status: 'available' | 'assigned' | 'maintenance' | 'retired';
  location?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateHardwareData {
  assetTag: string;
  type: string;
  model: string;
  manufacturer: string;
  serialNumber: string;
  purchaseDate: string;
  warrantyExpiry?: string;
  cost: number;
  location?: string;
  notes?: string;
}

// Software Types
export interface Software {
  id: string;
  name: string;
  version: string;
  publisher: string;
  licenseType: 'perpetual' | 'subscription' | 'freeware';
  totalLicenses: number;
  availableLicenses: number;
  usedLicenses: number;
  costPerLicense: number;
  purchaseDate: string;
  expiryDate?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSoftwareData {
  name: string;
  version: string;
  publisher: string;
  licenseType: 'perpetual' | 'subscription' | 'freeware';
  totalLicenses: number;
  costPerLicense: number;
  purchaseDate: string;
  expiryDate?: string;
  notes?: string;
}

// Assignment Types
export interface Assignment {
  id: string;
  employeeId: string;
  assetType: 'hardware' | 'software';
  assetId: string;
  assignedDate: string;
  returnDate?: string;
  status: 'active' | 'returned' | 'terminated';
  notes?: string;
  createdAt: string;
  updatedAt: string;

  // Populated data
  employee?: Employee;
  hardware?: Hardware;
  software?: Software;
}

export interface CreateAssignmentData {
  employeeId: string;
  assetType: 'hardware' | 'software';
  assetId: string;
  assignedDate: string;
  notes?: string;
}

// Activity Types
export interface Activity {
  id: string;
  type: 'create' | 'update' | 'delete' | 'assign' | 'return';
  entityType: 'employee' | 'hardware' | 'software' | 'assignment' | 'user';
  entityId: string;
  userId: string;
  userName: string;
  description: string;
  metadata?: Record<string, any>;
  createdAt: string;
}

// User Types (for user management)
export interface SystemUser {
  id: string;
  username: string;
  email?: string;
  role: 'Admin' | 'Manager' | 'User';
  name: string;
  department?: string;
  isActive: boolean;
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserData {
  username: string;
  password: string;
  email?: string;
  role: 'Admin' | 'Manager' | 'User';
  name: string;
  department?: string;
}

// Authentication API types
export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: {
    id: number;
    username: string;
    full_name: string;
    email: string;
    role: 'admin' | 'manager' | 'user';
    ldap: boolean;
  };
}

export interface TokenRefreshResponse {
  token: string;
  user: {
    id: number;
    username: string;
    full_name: string;
    email: string;
    role: 'admin' | 'manager' | 'user';
    ldap: boolean;
  };
}

export interface CurrentUserResponse {
  user: {
    id: number;
    username: string;
    full_name: string;
    email: string;
    role: 'admin' | 'manager' | 'user';
    is_active: boolean;
    last_login?: string;
    ldap: boolean;
  };
}

export interface AuthError {
  error: string;
}
