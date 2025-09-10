// Role-based access control components
export { AdminGuard } from './AdminGuard';
export { ManagerGuard } from './ManagerGuard';

// Re-export comprehensive role guards
export {
  AdminOnlyGuard,
  ManagerGuard as ManagerRoleGuard,
  ConditionalRender,
  RoleBasedButton,
  withAdminGuard,
  withManagerGuard,
} from '../guards/RoleGuards';
