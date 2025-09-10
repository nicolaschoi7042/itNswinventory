/**
 * Session Synchronization Utilities
 * Synchronizes localStorage with cookies for better SSR support
 */

import { getToken, setToken, clearSession } from './session-storage';

/**
 * Sync token from localStorage to cookies
 * This ensures middleware can access the token on the server-side
 */
export function syncTokenToCookies(): void {
  if (typeof window === 'undefined') return;

  const token = getToken();

  if (token) {
    // Set secure cookie that middleware can read
    // HttpOnly=false so client can access it, but Secure and SameSite for protection
    document.cookie = `inventory_token=${token}; Path=/; Max-Age=${3 * 60 * 60}; SameSite=Lax${
      window.location.protocol === 'https:' ? '; Secure' : ''
    }`;
  } else {
    // Clear the cookie
    document.cookie = 'inventory_token=; Path=/; Max-Age=0';
  }
}

/**
 * Clear token from both localStorage and cookies
 */
export function clearTokenEverywhere(): void {
  if (typeof window === 'undefined') return;

  // Clear localStorage
  clearSession();

  // Clear cookie
  document.cookie = 'inventory_token=; Path=/; Max-Age=0';
}

/**
 * Initialize session sync on app start
 * Should be called when the app loads
 */
export function initializeSessionSync(): void {
  if (typeof window === 'undefined') return;

  // Initial sync
  syncTokenToCookies();

  // Listen for localStorage changes and sync to cookies
  const handleStorageChange = (event: StorageEvent) => {
    if (event.key === 'inventory_token') {
      syncTokenToCookies();
    }
  };

  window.addEventListener('storage', handleStorageChange);

  // Return cleanup function
  return () => {
    window.removeEventListener('storage', handleStorageChange);
  };
}
