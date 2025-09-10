'use client';

import React from 'react';
import { ManagerGuard as ManagerRoleGuard } from '../guards/RoleGuards';

interface ManagerGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * Simplified ManagerGuard component for easy imports
 * Allows access for admin and manager roles
 */
export function ManagerGuard({ children, fallback }: ManagerGuardProps) {
  return <ManagerRoleGuard fallback={fallback}>{children}</ManagerRoleGuard>;
}

export default ManagerGuard;
