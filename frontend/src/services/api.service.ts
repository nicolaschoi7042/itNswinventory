/**
 * Main API Service
 * Coordinates all domain-specific services and provides centralized API access
 * Based on the original script.js ApiService class
 */

import { apiClient, ApiClient } from '@/lib/api-client';
import { AuthService } from './auth.service';
import { EmployeeService } from './employee.service';
import { HardwareService } from './hardware.service';
import { SoftwareService } from './software.service';
import { AssignmentService } from './assignment.service';
import { UserService } from './user.service';
import { ActivityService } from './activity.service';

/**
 * Main API Service class that coordinates all domain services
 * Provides a single entry point for all API operations
 */
export class ApiService {
  // Domain-specific services
  public auth: AuthService;
  public employees: EmployeeService;
  public hardware: HardwareService;
  public software: SoftwareService;
  public assignments: AssignmentService;
  public users: UserService;
  public activities: ActivityService;

  constructor(private client: ApiClient = apiClient) {
    // Initialize all domain services with the API client
    this.auth = new AuthService(this.client);
    this.employees = new EmployeeService(this.client);
    this.hardware = new HardwareService(this.client);
    this.software = new SoftwareService(this.client);
    this.assignments = new AssignmentService(this.client);
    this.users = new UserService(this.client);
    this.activities = new ActivityService(this.client);
  }

  /**
   * Health check endpoint
   */
  async healthCheck() {
    return this.client.get('/health', { requireAuth: false });
  }

  /**
   * Generic request method for custom API calls
   */
  async request<T = any>(endpoint: string, options?: any) {
    return this.client.request<T>(endpoint, options);
  }
}

// Export singleton instance
export const apiService = new ApiService();