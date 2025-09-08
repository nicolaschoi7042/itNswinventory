import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Enable TypeScript strict mode checking
  typescript: {
    tsconfigPath: './tsconfig.json',
  },
  
  // Enable experimental features for better performance
  experimental: {
    // Enable optimized loading
    optimizePackageImports: ['@mui/material', '@mui/icons-material'],
  },
  
  // Configure webpack for better module resolution
  webpack: (config, { dev, isServer }) => {
    // Enable source maps in development
    if (dev && !isServer) {
      config.devtool = 'cheap-module-source-map';
    }
    
    return config;
  },
  
  // Environment variables
  env: {
    CUSTOM_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
  },
  
  // Performance optimizations
  compiler: {
    // Remove console logs in production
    removeConsole: process.env.NODE_ENV === 'production' ? { exclude: ['error'] } : false,
  },
  
  // Image optimization
  images: {
    domains: ['localhost'],
    formats: ['image/webp', 'image/avif'],
  },
  
  // Security headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
