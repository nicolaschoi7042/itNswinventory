/**
 * Session Storage Utilities
 * Matches the original system's localStorage-based session management
 */

export interface SessionUser {
  id: number;
  username: string;
  full_name: string;
  email: string;
  role: 'admin' | 'manager' | 'user';
  ldap: boolean;
}

export interface SessionData {
  token: string;
  user: SessionUser;
  expiresAt: number; // timestamp
}

// Storage keys matching original system
const STORAGE_KEYS = {
  TOKEN: 'inventory_token',
  USER: 'inventory_user',
  CURRENT_TAB: 'inventory_current_tab',
  EXPIRES_AT: 'inventory_token_expires',
} as const;

/**
 * Check if localStorage is available (SSR-safe)
 */
export function isLocalStorageAvailable(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }
  
  try {
    const test = 'test';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch (e) {
    return false;
  }
}

/**
 * Get token from localStorage
 */
export function getToken(): string | null {
  if (!isLocalStorageAvailable()) {
    return null;
  }
  
  return localStorage.getItem(STORAGE_KEYS.TOKEN);
}

/**
 * Set token in localStorage with expiration
 */
export function setToken(token: string): void {
  if (!isLocalStorageAvailable()) {
    return;
  }
  
  // Calculate expiration time (3 hours from now, matching JWT expiration)
  const expiresAt = Date.now() + (3 * 60 * 60 * 1000);
  
  localStorage.setItem(STORAGE_KEYS.TOKEN, token);
  localStorage.setItem(STORAGE_KEYS.EXPIRES_AT, expiresAt.toString());
}

/**
 * Get user data from localStorage
 */
export function getUser(): SessionUser | null {
  if (!isLocalStorageAvailable()) {
    return null;
  }
  
  const userJson = localStorage.getItem(STORAGE_KEYS.USER);
  if (!userJson) {
    return null;
  }
  
  try {
    return JSON.parse(userJson) as SessionUser;
  } catch (error) {
    console.error('Error parsing user data from localStorage:', error);
    return null;
  }
}

/**
 * Set user data in localStorage
 */
export function setUser(user: SessionUser): void {
  if (!isLocalStorageAvailable()) {
    return;
  }
  
  localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
}

/**
 * Get current tab from localStorage
 */
export function getCurrentTab(): string | null {
  if (!isLocalStorageAvailable()) {
    return null;
  }
  
  return localStorage.getItem(STORAGE_KEYS.CURRENT_TAB);
}

/**
 * Set current tab in localStorage
 */
export function setCurrentTab(tab: string): void {
  if (!isLocalStorageAvailable()) {
    return;
  }
  
  localStorage.setItem(STORAGE_KEYS.CURRENT_TAB, tab);
}

/**
 * Get token expiration time
 */
export function getTokenExpiration(): number | null {
  if (!isLocalStorageAvailable()) {
    return null;
  }
  
  const expiresAtStr = localStorage.getItem(STORAGE_KEYS.EXPIRES_AT);
  if (!expiresAtStr) {
    return null;
  }
  
  const expiresAt = parseInt(expiresAtStr, 10);
  return isNaN(expiresAt) ? null : expiresAt;
}

/**
 * Check if token is expired
 */
export function isTokenExpired(): boolean {
  const expiresAt = getTokenExpiration();
  if (!expiresAt) {
    return true;
  }
  
  return Date.now() >= expiresAt;
}

/**
 * Check if token expires soon (within 5 minutes)
 */
export function isTokenExpiringSoon(): boolean {
  const expiresAt = getTokenExpiration();
  if (!expiresAt) {
    return true;
  }
  
  const fiveMinutes = 5 * 60 * 1000;
  return Date.now() >= (expiresAt - fiveMinutes);
}

/**
 * Get complete session data
 */
export function getSessionData(): SessionData | null {
  const token = getToken();
  const user = getUser();
  const expiresAt = getTokenExpiration();
  
  if (!token || !user || !expiresAt) {
    return null;
  }
  
  return { token, user, expiresAt };
}

/**
 * Set complete session data
 */
export function setSessionData(data: { token: string; user: SessionUser }): void {
  setToken(data.token);
  setUser(data.user);
}

/**
 * Clear all session data (logout)
 */
export function clearSession(): void {
  if (!isLocalStorageAvailable()) {
    return;
  }
  
  localStorage.removeItem(STORAGE_KEYS.TOKEN);
  localStorage.removeItem(STORAGE_KEYS.USER);
  localStorage.removeItem(STORAGE_KEYS.CURRENT_TAB);
  localStorage.removeItem(STORAGE_KEYS.EXPIRES_AT);
  
  console.log('🔒 Session cleared from localStorage');
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated(): boolean {
  const token = getToken();
  const user = getUser();
  
  return !!(token && user && !isTokenExpired());
}

/**
 * Get user role for authorization checks
 */
export function getUserRole(): string | null {
  const user = getUser();
  return user?.role || null;
}

/**
 * Check if user has admin role
 */
export function hasAdminRole(): boolean {
  return getUserRole() === 'admin';
}

/**
 * Check if user has manager role or higher
 */
export function hasManagerRole(): boolean {
  const role = getUserRole();
  return role === 'admin' || role === 'manager';
}

/**
 * Check if user can create records (manager or admin)
 */
export function canCreateRecords(): boolean {
  return hasManagerRole();
}

/**
 * Check if user can delete records (admin only)
 */
export function canDeleteRecords(): boolean {
  return hasAdminRole();
}

/**
 * Get authorization header for API calls
 */
export function getAuthHeader(): Record<string, string> {
  const token = getToken();
  if (!token) {
    return {};
  }
  
  return {
    'Authorization': `Bearer ${token}`
  };
}