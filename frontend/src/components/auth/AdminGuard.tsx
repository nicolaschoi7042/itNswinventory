'use client';

import React from 'react';
import { AdminOnlyGuard } from '../guards/RoleGuards';

interface AdminGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * Simplified AdminGuard component for easy imports
 * Wraps AdminOnlyGuard with a more convenient interface
 */
export function AdminGuard({ children, fallback }: AdminGuardProps) {
  return <AdminOnlyGuard fallback={fallback}>{children}</AdminOnlyGuard>;
}

export default AdminGuard;
