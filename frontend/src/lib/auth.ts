// Authentication utilities and types

export interface User {
  id: string;
  username: string;
  email?: string;
  role: 'Admin' | 'Manager' | 'User';
  name: string;
  department?: string;
  createdAt: string;
  lastLogin?: string;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  token?: string;
  user?: User;
  message?: string;
}

// Token management
export const AUTH_TOKEN_KEY = 'auth-token';
export const USER_DATA_KEY = 'user-data';

export function getStoredToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(AUTH_TOKEN_KEY);
}

export function setStoredToken(token: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(AUTH_TOKEN_KEY, token);
}

export function removeStoredToken(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(AUTH_TOKEN_KEY);
  localStorage.removeItem(USER_DATA_KEY);
}

export function getStoredUser(): User | null {
  if (typeof window === 'undefined') return null;
  const userData = localStorage.getItem(USER_DATA_KEY);
  return userData ? JSON.parse(userData) : null;
}

export function setStoredUser(user: User): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(USER_DATA_KEY, JSON.stringify(user));
}

// Role checking utilities
export function hasAdminRole(user?: User | null): boolean {
  return user?.role === 'Admin';
}

export function hasManagerRole(user?: User | null): boolean {
  return user?.role === 'Manager' || user?.role === 'Admin';
}

export function canManageUsers(user?: User | null): boolean {
  return hasAdminRole(user);
}

export function canDeleteRecords(user?: User | null): boolean {
  return hasAdminRole(user);
}

export function canCreateRecords(user?: User | null): boolean {
  return hasManagerRole(user);
}

export function canEditRecords(user?: User | null): boolean {
  return hasManagerRole(user);
}
