/**
 * Test Setup Configuration
 *
 * Global test setup for Vitest testing environment
 */

import { vi, beforeEach, afterEach } from 'vitest';

// Mock DOM APIs that might not be available in test environment
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock IntersectionObserver
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock URL.createObjectURL and URL.revokeObjectURL
global.URL.createObjectURL = vi.fn(() => 'mocked-url');
global.URL.revokeObjectURL = vi.fn();

// Mock document.createElement for download functionality
const originalCreateElement = document.createElement;
document.createElement = vi.fn().mockImplementation((tagName: string) => {
  if (tagName === 'a') {
    return {
      href: '',
      download: '',
      click: vi.fn(),
      style: { display: '' },
      setAttribute: vi.fn(),
      getAttribute: vi.fn(),
      remove: vi.fn(),
    };
  }
  return originalCreateElement.call(document, tagName);
});

// Mock fetch API
global.fetch = vi.fn();

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Mock sessionStorage
Object.defineProperty(window, 'sessionStorage', {
  value: localStorageMock,
});

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  // Keep error and warn for debugging, but mock others
  log: vi.fn(),
  debug: vi.fn(),
  info: vi.fn(),
};

// Mock file reading APIs
global.FileReader = vi.fn().mockImplementation(() => ({
  readAsText: vi.fn(),
  readAsArrayBuffer: vi.fn(),
  readAsDataURL: vi.fn(),
  onload: null,
  onerror: null,
  result: null,
}));

// Mock Blob constructor
global.Blob = vi.fn().mockImplementation((content, options) => ({
  size: content ? content.join('').length : 0,
  type: options?.type || '',
  slice: vi.fn(),
  stream: vi.fn(),
  text: vi.fn(),
  arrayBuffer: vi.fn(),
}));

// Mock File constructor
global.File = vi.fn().mockImplementation((bits, name, options) => ({
  ...new Blob(bits, options),
  name,
  lastModified: Date.now(),
  webkitRelativePath: '',
}));

// Setup test timeout
vi.setConfig({ testTimeout: 10000 });

// Clean up after each test
afterEach(() => {
  vi.clearAllMocks();
});
