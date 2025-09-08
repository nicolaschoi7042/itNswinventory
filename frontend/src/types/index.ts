// 기존 IT 인벤토리 시스템의 타입 정의
// 기존 시스템의 데이터 구조를 유지하면서 TypeScript 타입으로 정의

export interface User {
  id: number;
  username: string;
  email: string;
  fullName: string;
  role: 'admin' | 'manager' | 'user';
  isLdapUser: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Employee {
  id: number;
  name: string;
  email: string;
  department: string;
  position: string;
  phone?: string;
  createdAt: string;
  updatedAt: string;
}

export interface HardwareAsset {
  id: number;
  assetTag: string;
  type: string;
  brand: string;
  model: string;
  serialNumber: string;
  status: 'available' | 'assigned' | 'maintenance' | 'retired';
  purchaseDate: string;
  warrantyExpiry?: string;
  price?: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SoftwareLicense {
  id: number;
  name: string;
  version: string;
  vendor: string;
  licenseType: 'perpetual' | 'subscription' | 'oem';
  totalLicenses: number;
  usedLicenses: number;
  price?: number;
  purchaseDate: string;
  expiryDate?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Assignment {
  id: string; // AS + number format
  employeeId: number;
  employeeName: string;
  assetType: 'hardware' | 'software';
  assetId: number;
  assetName: string;
  status: '사용중' | '반납완료' | '대기중';
  assignedDate: string;
  returnedDate?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Activity {
  id: number;
  type: 'assignment' | 'return' | 'create' | 'update' | 'delete';
  description: string;
  userId: number;
  userName: string;
  entityType: 'employee' | 'hardware' | 'software' | 'assignment' | 'user';
  entityId: string | number;
  createdAt: string;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

// Form types
export interface LoginForm {
  username: string;
  password: string;
}

export interface EmployeeForm {
  name: string;
  email: string;
  department: string;
  position: string;
  phone?: string;
}

export interface HardwareForm {
  assetTag: string;
  type: string;
  brand: string;
  model: string;
  serialNumber: string;
  status: HardwareAsset['status'];
  purchaseDate: string;
  warrantyExpiry?: string;
  price?: number;
  notes?: string;
}

export interface SoftwareForm {
  name: string;
  version: string;
  vendor: string;
  licenseType: SoftwareLicense['licenseType'];
  totalLicenses: number;
  price?: number;
  purchaseDate: string;
  expiryDate?: string;
  notes?: string;
}

// UI State types
export interface AppState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

export interface DataStore {
  employees: Employee[];
  hardware: HardwareAsset[];
  software: SoftwareLicense[];
  assignments: Assignment[];
  activities: Activity[];
  users: User[];
}
