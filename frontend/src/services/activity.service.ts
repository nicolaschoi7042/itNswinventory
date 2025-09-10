/**
 * Activity Service
 * Handles all activity log-related API operations
 * Based on the original system's activity tracking functionality
 */

import { ApiClient } from '@/lib/api-client';
import type { Activity, CreateActivityData } from '@/types/activity';
import type { ApiResponse } from '@/types/api';

export class ActivityService {
  constructor(private client: ApiClient) {}

  /**
   * Get all activities
   */
  async getAll(
    limit?: number,
    offset?: number
  ): Promise<ApiResponse<Activity[]>> {
    const params = new URLSearchParams();
    if (limit) params.append('limit', limit.toString());
    if (offset) params.append('offset', offset.toString());

    const query = params.toString();
    return this.client.get<Activity[]>(
      `/activities${query ? `?${query}` : ''}`
    );
  }

  /**
   * Get activity by ID
   */
  async getById(id: string): Promise<ApiResponse<Activity>> {
    return this.client.get<Activity>(`/activities/${id}`);
  }

  /**
   * Create new activity log (usually called internally)
   */
  async create(data: CreateActivityData): Promise<ApiResponse<Activity>> {
    return this.client.post<Activity>('/activities', data);
  }

  /**
   * Get activities by user
   */
  async getByUser(
    userId: string,
    limit?: number
  ): Promise<ApiResponse<Activity[]>> {
    const params = new URLSearchParams();
    params.append('user_id', userId);
    if (limit) params.append('limit', limit.toString());

    return this.client.get<Activity[]>(`/activities?${params.toString()}`);
  }

  /**
   * Get activities by type
   */
  async getByType(
    type: string,
    limit?: number
  ): Promise<ApiResponse<Activity[]>> {
    const params = new URLSearchParams();
    params.append('type', type);
    if (limit) params.append('limit', limit.toString());

    return this.client.get<Activity[]>(`/activities?${params.toString()}`);
  }

  /**
   * Get recent activities
   */
  async getRecent(limit: number = 10): Promise<ApiResponse<Activity[]>> {
    return this.client.get<Activity[]>(`/activities/recent?limit=${limit}`);
  }

  /**
   * Get activities by date range
   */
  async getByDateRange(
    startDate: string,
    endDate: string
  ): Promise<ApiResponse<Activity[]>> {
    const params = new URLSearchParams();
    params.append('start_date', startDate);
    params.append('end_date', endDate);

    return this.client.get<Activity[]>(`/activities?${params.toString()}`);
  }

  /**
   * Search activities
   */
  async search(query: string): Promise<ApiResponse<Activity[]>> {
    return this.client.get<Activity[]>(
      `/activities/search?q=${encodeURIComponent(query)}`
    );
  }

  /**
   * Export activities to Excel
   */
  async exportToExcel(
    startDate?: string,
    endDate?: string
  ): Promise<ApiResponse<Blob>> {
    const params = new URLSearchParams();
    if (startDate) params.append('start_date', startDate);
    if (endDate) params.append('end_date', endDate);

    const query = params.toString();
    return this.client.get<Blob>(
      `/activities/export/excel${query ? `?${query}` : ''}`,
      {
        headers: {
          Accept:
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        },
      }
    );
  }
}
