/**
 * Export Scheduler Service
 *
 * Handles scheduling of automated exports, notifications, and recurring reports
 */

import type {
  ScheduledExport,
  ExportSchedule,
  ScheduleConfig,
  ScheduleResult,
  ExportNotification,
  RecurringExportConfig,
  ScheduleValidation,
} from '@/types/export';
import { ExportService } from './export.service';
import { AnalyticsService } from './analytics.service';

export class ExportSchedulerService {
  private exportService: ExportService;
  private analyticsService: AnalyticsService;
  private scheduledJobs: Map<string, any> = new Map();
  private notifications: ExportNotification[] = [];

  constructor() {
    this.exportService = new ExportService();
    this.analyticsService = new AnalyticsService();
  }

  // ============================================================================
  // SCHEDULE MANAGEMENT
  // ============================================================================

  /**
   * Create a new scheduled export
   */
  async createSchedule(config: ScheduleConfig): Promise<ScheduleResult> {
    try {
      // Validate schedule configuration
      const validation = this.validateSchedule(config);
      if (!validation.isValid) {
        return {
          success: false,
          scheduleId: '',
          message: `Schedule validation failed: ${validation.errors.join(', ')}`,
          nextRun: null,
          errors: validation.errors,
        };
      }

      // Generate unique schedule ID
      const scheduleId = this.generateScheduleId(config);

      // Create scheduled export object
      const scheduledExport: ScheduledExport = {
        id: scheduleId,
        name: config.name,
        description: config.description,
        dataType: config.dataType,
        exportFormat: config.exportFormat,
        schedule: config.schedule,
        exportConfig: config.exportConfig,
        notificationConfig: config.notificationConfig,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        lastRun: null,
        nextRun: this.calculateNextRun(config.schedule),
        runCount: 0,
        successCount: 0,
        failureCount: 0,
        lastResult: null,
      };

      // Store schedule (in real app, this would be persisted to database)
      await this.saveSchedule(scheduledExport);

      // Set up the recurring job
      await this.setupRecurringJob(scheduledExport);

      return {
        success: true,
        scheduleId,
        message: 'Export schedule created successfully',
        nextRun: scheduledExport.nextRun,
        schedule: scheduledExport,
      };
    } catch (error) {
      console.error('Error creating export schedule:', error);
      return {
        success: false,
        scheduleId: '',
        message:
          error instanceof Error ? error.message : 'Failed to create schedule',
        nextRun: null,
        errors: [error instanceof Error ? error.message : 'Unknown error'],
      };
    }
  }

  /**
   * Update existing schedule
   */
  async updateSchedule(
    scheduleId: string,
    updates: Partial<ScheduleConfig>
  ): Promise<ScheduleResult> {
    try {
      const existingSchedule = await this.getSchedule(scheduleId);
      if (!existingSchedule) {
        return {
          success: false,
          scheduleId,
          message: 'Schedule not found',
          nextRun: null,
          errors: ['Schedule not found'],
        };
      }

      // Merge updates with existing config
      const updatedConfig = { ...existingSchedule, ...updates };

      // Validate updated configuration
      const validation = this.validateSchedule(updatedConfig);
      if (!validation.isValid) {
        return {
          success: false,
          scheduleId,
          message: `Schedule validation failed: ${validation.errors.join(', ')}`,
          nextRun: null,
          errors: validation.errors,
        };
      }

      // Update schedule
      existingSchedule.name = updatedConfig.name || existingSchedule.name;
      existingSchedule.description =
        updatedConfig.description || existingSchedule.description;
      existingSchedule.schedule =
        updatedConfig.schedule || existingSchedule.schedule;
      existingSchedule.exportConfig =
        updatedConfig.exportConfig || existingSchedule.exportConfig;
      existingSchedule.notificationConfig =
        updatedConfig.notificationConfig || existingSchedule.notificationConfig;
      existingSchedule.updatedAt = new Date();
      existingSchedule.nextRun = this.calculateNextRun(
        existingSchedule.schedule
      );

      // Save updated schedule
      await this.saveSchedule(existingSchedule);

      // Update recurring job
      await this.updateRecurringJob(existingSchedule);

      return {
        success: true,
        scheduleId,
        message: 'Export schedule updated successfully',
        nextRun: existingSchedule.nextRun,
        schedule: existingSchedule,
      };
    } catch (error) {
      console.error('Error updating export schedule:', error);
      return {
        success: false,
        scheduleId,
        message:
          error instanceof Error ? error.message : 'Failed to update schedule',
        nextRun: null,
        errors: [error instanceof Error ? error.message : 'Unknown error'],
      };
    }
  }

  /**
   * Delete schedule
   */
  async deleteSchedule(scheduleId: string): Promise<ScheduleResult> {
    try {
      const schedule = await this.getSchedule(scheduleId);
      if (!schedule) {
        return {
          success: false,
          scheduleId,
          message: 'Schedule not found',
          nextRun: null,
          errors: ['Schedule not found'],
        };
      }

      // Cancel recurring job
      await this.cancelRecurringJob(scheduleId);

      // Delete schedule from storage
      await this.removeSchedule(scheduleId);

      return {
        success: true,
        scheduleId,
        message: 'Export schedule deleted successfully',
        nextRun: null,
      };
    } catch (error) {
      console.error('Error deleting export schedule:', error);
      return {
        success: false,
        scheduleId,
        message:
          error instanceof Error ? error.message : 'Failed to delete schedule',
        nextRun: null,
        errors: [error instanceof Error ? error.message : 'Unknown error'],
      };
    }
  }

  /**
   * Get all schedules
   */
  async getAllSchedules(): Promise<ScheduledExport[]> {
    try {
      // In real app, fetch from database
      const schedules = await this.fetchAllSchedules();
      return schedules;
    } catch (error) {
      console.error('Error fetching schedules:', error);
      return [];
    }
  }

  /**
   * Get schedule by ID
   */
  async getSchedule(scheduleId: string): Promise<ScheduledExport | null> {
    try {
      // In real app, fetch from database
      return await this.fetchSchedule(scheduleId);
    } catch (error) {
      console.error('Error fetching schedule:', error);
      return null;
    }
  }

  // ============================================================================
  // RECURRING JOB MANAGEMENT
  // ============================================================================

  /**
   * Setup recurring job for schedule
   */
  private async setupRecurringJob(schedule: ScheduledExport): Promise<void> {
    // Cancel existing job if it exists
    if (this.scheduledJobs.has(schedule.id)) {
      await this.cancelRecurringJob(schedule.id);
    }

    // Create new recurring job based on schedule type
    const job = this.createRecurringJob(schedule);
    this.scheduledJobs.set(schedule.id, job);
  }

  /**
   * Update recurring job
   */
  private async updateRecurringJob(schedule: ScheduledExport): Promise<void> {
    await this.setupRecurringJob(schedule);
  }

  /**
   * Cancel recurring job
   */
  private async cancelRecurringJob(scheduleId: string): Promise<void> {
    const job = this.scheduledJobs.get(scheduleId);
    if (job) {
      // Clear timeout/interval
      if (job.type === 'timeout') {
        clearTimeout(job.id);
      } else if (job.type === 'interval') {
        clearInterval(job.id);
      }
      this.scheduledJobs.delete(scheduleId);
    }
  }

  /**
   * Create recurring job based on schedule
   */
  private createRecurringJob(schedule: ScheduledExport): any {
    const { schedule: scheduleConfig } = schedule;

    switch (scheduleConfig.type) {
      case 'once':
        const timeoutId = setTimeout(() => {
          this.executeScheduledExport(schedule);
        }, scheduleConfig.executeAt!.getTime() - Date.now());
        return { type: 'timeout', id: timeoutId };

      case 'daily':
        return this.createDailyJob(schedule);

      case 'weekly':
        return this.createWeeklyJob(schedule);

      case 'monthly':
        return this.createMonthlyJob(schedule);

      case 'cron':
        return this.createCronJob(schedule);

      default:
        throw new Error(`Unsupported schedule type: ${scheduleConfig.type}`);
    }
  }

  /**
   * Create daily recurring job
   */
  private createDailyJob(schedule: ScheduledExport): any {
    const executeDaily = () => {
      const now = new Date();
      const scheduleTime = schedule.schedule.time!;
      const [hours, minutes] = scheduleTime.split(':').map(Number);

      const nextRun = new Date();
      nextRun.setHours(hours, minutes, 0, 0);

      // If time has passed today, schedule for tomorrow
      if (nextRun <= now) {
        nextRun.setDate(nextRun.getDate() + 1);
      }

      const timeUntilNext = nextRun.getTime() - now.getTime();

      setTimeout(() => {
        this.executeScheduledExport(schedule);
        // Set up next execution
        const intervalId = setInterval(
          () => {
            this.executeScheduledExport(schedule);
          },
          24 * 60 * 60 * 1000
        ); // 24 hours

        this.scheduledJobs.set(schedule.id, {
          type: 'interval',
          id: intervalId,
        });
      }, timeUntilNext);
    };

    executeDaily();
    return { type: 'custom', execute: executeDaily };
  }

  /**
   * Create weekly recurring job
   */
  private createWeeklyJob(schedule: ScheduledExport): any {
    const executeWeekly = () => {
      const now = new Date();
      const scheduleTime = schedule.schedule.time!;
      const dayOfWeek = schedule.schedule.dayOfWeek!;
      const [hours, minutes] = scheduleTime.split(':').map(Number);

      const nextRun = new Date();
      nextRun.setHours(hours, minutes, 0, 0);

      // Calculate days until target day of week
      const daysUntilTarget = (dayOfWeek - now.getDay() + 7) % 7;
      if (daysUntilTarget === 0 && nextRun <= now) {
        nextRun.setDate(nextRun.getDate() + 7);
      } else {
        nextRun.setDate(nextRun.getDate() + daysUntilTarget);
      }

      const timeUntilNext = nextRun.getTime() - now.getTime();

      setTimeout(() => {
        this.executeScheduledExport(schedule);
        // Set up next execution
        const intervalId = setInterval(
          () => {
            this.executeScheduledExport(schedule);
          },
          7 * 24 * 60 * 60 * 1000
        ); // 7 days

        this.scheduledJobs.set(schedule.id, {
          type: 'interval',
          id: intervalId,
        });
      }, timeUntilNext);
    };

    executeWeekly();
    return { type: 'custom', execute: executeWeekly };
  }

  /**
   * Create monthly recurring job
   */
  private createMonthlyJob(schedule: ScheduledExport): any {
    const executeMonthly = () => {
      const now = new Date();
      const scheduleTime = schedule.schedule.time!;
      const dayOfMonth = schedule.schedule.dayOfMonth!;
      const [hours, minutes] = scheduleTime.split(':').map(Number);

      const nextRun = new Date();
      nextRun.setDate(dayOfMonth);
      nextRun.setHours(hours, minutes, 0, 0);

      // If date has passed this month, schedule for next month
      if (nextRun <= now) {
        nextRun.setMonth(nextRun.getMonth() + 1);
      }

      const timeUntilNext = nextRun.getTime() - now.getTime();

      setTimeout(() => {
        this.executeScheduledExport(schedule);
        // Schedule next month
        this.scheduleNextMonthlyExecution(schedule);
      }, timeUntilNext);
    };

    executeMonthly();
    return { type: 'custom', execute: executeMonthly };
  }

  /**
   * Schedule next monthly execution
   */
  private scheduleNextMonthlyExecution(schedule: ScheduledExport): void {
    const scheduleTime = schedule.schedule.time!;
    const dayOfMonth = schedule.schedule.dayOfMonth!;
    const [hours, minutes] = scheduleTime.split(':').map(Number);

    const nextRun = new Date();
    nextRun.setMonth(nextRun.getMonth() + 1);
    nextRun.setDate(dayOfMonth);
    nextRun.setHours(hours, minutes, 0, 0);

    const timeUntilNext = nextRun.getTime() - Date.now();

    const timeoutId = setTimeout(() => {
      this.executeScheduledExport(schedule);
      this.scheduleNextMonthlyExecution(schedule);
    }, timeUntilNext);

    this.scheduledJobs.set(schedule.id, { type: 'timeout', id: timeoutId });
  }

  /**
   * Create cron-based job
   */
  private createCronJob(schedule: ScheduledExport): any {
    // Simplified cron implementation
    // In production, use a proper cron library like node-cron
    const cronExpression = schedule.schedule.cronExpression!;

    // This is a simplified implementation
    // Real implementation would parse cron expression properly
    const intervalId = setInterval(() => {
      if (this.shouldExecuteCron(cronExpression)) {
        this.executeScheduledExport(schedule);
      }
    }, 60000); // Check every minute

    return { type: 'interval', id: intervalId };
  }

  /**
   * Check if cron expression should execute now
   */
  private shouldExecuteCron(cronExpression: string): boolean {
    // Simplified cron checking
    // Real implementation would use proper cron parser
    const now = new Date();
    const parts = cronExpression.split(' ');

    if (parts.length !== 5) return false;

    const [minute, hour, dayOfMonth, month, dayOfWeek] = parts;

    // Basic matching (simplified)
    const matches = [
      minute === '*' || parseInt(minute) === now.getMinutes(),
      hour === '*' || parseInt(hour) === now.getHours(),
      dayOfMonth === '*' || parseInt(dayOfMonth) === now.getDate(),
      month === '*' || parseInt(month) === now.getMonth() + 1,
      dayOfWeek === '*' || parseInt(dayOfWeek) === now.getDay(),
    ];

    return matches.every(match => match);
  }

  // ============================================================================
  // EXPORT EXECUTION
  // ============================================================================

  /**
   * Execute scheduled export
   */
  private async executeScheduledExport(
    schedule: ScheduledExport
  ): Promise<void> {
    try {
      console.log(`Executing scheduled export: ${schedule.name}`);

      // Update schedule run information
      schedule.lastRun = new Date();
      schedule.runCount++;
      schedule.nextRun = this.calculateNextRun(schedule.schedule);

      // Prepare export data based on data type
      const exportData = await this.prepareExportData(schedule);

      // Execute export
      const result = await this.exportService.exportData(
        exportData,
        schedule.exportFormat,
        {
          ...schedule.exportConfig,
          filename: this.generateScheduledFilename(schedule),
        }
      );

      // Update schedule result
      if (result.success) {
        schedule.successCount++;
        schedule.lastResult = {
          success: true,
          executedAt: new Date(),
          fileSize: result.fileSize,
          recordCount: result.recordCount,
          message: result.message,
        };
      } else {
        schedule.failureCount++;
        schedule.lastResult = {
          success: false,
          executedAt: new Date(),
          error: result.message,
          message: result.message,
        };
      }

      // Save updated schedule
      await this.saveSchedule(schedule);

      // Send notifications if configured
      if (schedule.notificationConfig?.enabled) {
        await this.sendNotification(schedule, result);
      }
    } catch (error) {
      console.error(
        `Error executing scheduled export ${schedule.name}:`,
        error
      );

      // Update failure count
      schedule.failureCount++;
      schedule.lastResult = {
        success: false,
        executedAt: new Date(),
        error: error instanceof Error ? error.message : 'Unknown error',
        message: 'Export execution failed',
      };

      await this.saveSchedule(schedule);

      // Send error notification
      if (schedule.notificationConfig?.enabled) {
        await this.sendErrorNotification(schedule, error);
      }
    }
  }

  /**
   * Prepare export data based on schedule configuration
   */
  private async prepareExportData(schedule: ScheduledExport): Promise<any[]> {
    // In real implementation, this would fetch data from appropriate services
    // For now, return mock data based on data type

    switch (schedule.dataType) {
      case 'hardware':
        return []; // Would fetch from hardware service
      case 'software':
        return []; // Would fetch from software service
      case 'employees':
        return []; // Would fetch from employee service
      case 'assignments':
        return []; // Would fetch from assignment service
      case 'analytics':
        // Generate analytics report
        return await this.analyticsService.generateCustomReport(
          {} as any, // Would pass real analytics data
          schedule.exportConfig.analyticsConfig || {}
        );
      default:
        throw new Error(`Unsupported data type: ${schedule.dataType}`);
    }
  }

  /**
   * Generate filename for scheduled export
   */
  private generateScheduledFilename(schedule: ScheduledExport): string {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const extension = this.getFileExtension(schedule.exportFormat);
    return `${schedule.name}_${timestamp}.${extension}`;
  }

  /**
   * Get file extension for export format
   */
  private getFileExtension(format: string): string {
    switch (format) {
      case 'excel':
        return 'xlsx';
      case 'csv':
        return 'csv';
      case 'pdf':
        return 'pdf';
      case 'json':
        return 'json';
      default:
        return 'txt';
    }
  }

  // ============================================================================
  // NOTIFICATION SYSTEM
  // ============================================================================

  /**
   * Send notification for completed export
   */
  private async sendNotification(
    schedule: ScheduledExport,
    result: any
  ): Promise<void> {
    const notification: ExportNotification = {
      id: this.generateNotificationId(),
      scheduleId: schedule.id,
      scheduleName: schedule.name,
      type: result.success ? 'success' : 'error',
      title: result.success ? 'Export Completed Successfully' : 'Export Failed',
      message: result.message,
      timestamp: new Date(),
      read: false,
      data: {
        fileName: result.fileName,
        fileSize: result.fileSize,
        recordCount: result.recordCount,
        executionTime: result.executionTime,
      },
    };

    this.notifications.push(notification);

    // In real implementation, send actual notifications
    // (email, push notifications, webhooks, etc.)
    await this.deliverNotification(notification, schedule.notificationConfig!);
  }

  /**
   * Send error notification
   */
  private async sendErrorNotification(
    schedule: ScheduledExport,
    error: any
  ): Promise<void> {
    const notification: ExportNotification = {
      id: this.generateNotificationId(),
      scheduleId: schedule.id,
      scheduleName: schedule.name,
      type: 'error',
      title: 'Scheduled Export Failed',
      message:
        error instanceof Error ? error.message : 'Unknown error occurred',
      timestamp: new Date(),
      read: false,
      data: {
        error: error instanceof Error ? error.stack : String(error),
      },
    };

    this.notifications.push(notification);

    // Deliver error notification
    if (schedule.notificationConfig?.enabled) {
      await this.deliverNotification(notification, schedule.notificationConfig);
    }
  }

  /**
   * Deliver notification through configured channels
   */
  private async deliverNotification(
    notification: ExportNotification,
    config: any
  ): Promise<void> {
    try {
      // Email notification
      if (config.email?.enabled) {
        await this.sendEmailNotification(notification, config.email);
      }

      // Push notification
      if (config.push?.enabled) {
        await this.sendPushNotification(notification, config.push);
      }

      // Webhook notification
      if (config.webhook?.enabled) {
        await this.sendWebhookNotification(notification, config.webhook);
      }
    } catch (error) {
      console.error('Error delivering notification:', error);
    }
  }

  /**
   * Send email notification
   */
  private async sendEmailNotification(
    notification: ExportNotification,
    config: any
  ): Promise<void> {
    // In real implementation, integrate with email service
    console.log('Email notification sent:', {
      to: config.recipients,
      subject: notification.title,
      body: notification.message,
    });
  }

  /**
   * Send push notification
   */
  private async sendPushNotification(
    notification: ExportNotification,
    config: any
  ): Promise<void> {
    // In real implementation, integrate with push notification service
    console.log('Push notification sent:', {
      title: notification.title,
      body: notification.message,
    });
  }

  /**
   * Send webhook notification
   */
  private async sendWebhookNotification(
    notification: ExportNotification,
    config: any
  ): Promise<void> {
    try {
      const response = await fetch(config.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...config.headers,
        },
        body: JSON.stringify(notification),
      });

      if (!response.ok) {
        throw new Error(
          `Webhook failed: ${response.status} ${response.statusText}`
        );
      }
    } catch (error) {
      console.error('Webhook notification failed:', error);
    }
  }

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================

  /**
   * Validate schedule configuration
   */
  private validateSchedule(config: ScheduleConfig): ScheduleValidation {
    const errors: string[] = [];

    // Basic validation
    if (!config.name?.trim()) {
      errors.push('Schedule name is required');
    }

    if (!config.dataType) {
      errors.push('Data type is required');
    }

    if (!config.exportFormat) {
      errors.push('Export format is required');
    }

    if (!config.schedule) {
      errors.push('Schedule configuration is required');
    } else {
      // Validate schedule specific fields
      switch (config.schedule.type) {
        case 'once':
          if (!config.schedule.executeAt) {
            errors.push('Execute date is required for one-time schedule');
          } else if (config.schedule.executeAt <= new Date()) {
            errors.push('Execute date must be in the future');
          }
          break;

        case 'daily':
        case 'weekly':
        case 'monthly':
          if (!config.schedule.time) {
            errors.push('Time is required for recurring schedule');
          }
          if (
            config.schedule.type === 'weekly' &&
            config.schedule.dayOfWeek === undefined
          ) {
            errors.push('Day of week is required for weekly schedule');
          }
          if (
            config.schedule.type === 'monthly' &&
            config.schedule.dayOfMonth === undefined
          ) {
            errors.push('Day of month is required for monthly schedule');
          }
          break;

        case 'cron':
          if (!config.schedule.cronExpression) {
            errors.push('Cron expression is required for cron schedule');
          }
          break;
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Calculate next run time based on schedule
   */
  private calculateNextRun(schedule: ExportSchedule): Date | null {
    const now = new Date();

    switch (schedule.type) {
      case 'once':
        return schedule.executeAt && schedule.executeAt > now
          ? schedule.executeAt
          : null;

      case 'daily':
        const nextDaily = new Date();
        const [dailyHours, dailyMinutes] = schedule
          .time!.split(':')
          .map(Number);
        nextDaily.setHours(dailyHours, dailyMinutes, 0, 0);
        if (nextDaily <= now) {
          nextDaily.setDate(nextDaily.getDate() + 1);
        }
        return nextDaily;

      case 'weekly':
        const nextWeekly = new Date();
        const [weeklyHours, weeklyMinutes] = schedule
          .time!.split(':')
          .map(Number);
        nextWeekly.setHours(weeklyHours, weeklyMinutes, 0, 0);
        const daysUntilTarget = (schedule.dayOfWeek! - now.getDay() + 7) % 7;
        if (daysUntilTarget === 0 && nextWeekly <= now) {
          nextWeekly.setDate(nextWeekly.getDate() + 7);
        } else {
          nextWeekly.setDate(nextWeekly.getDate() + daysUntilTarget);
        }
        return nextWeekly;

      case 'monthly':
        const nextMonthly = new Date();
        const [monthlyHours, monthlyMinutes] = schedule
          .time!.split(':')
          .map(Number);
        nextMonthly.setDate(schedule.dayOfMonth!);
        nextMonthly.setHours(monthlyHours, monthlyMinutes, 0, 0);
        if (nextMonthly <= now) {
          nextMonthly.setMonth(nextMonthly.getMonth() + 1);
        }
        return nextMonthly;

      case 'cron':
        // Simplified - in real implementation, use proper cron parser
        const nextCron = new Date();
        nextCron.setMinutes(nextCron.getMinutes() + 1);
        return nextCron;

      default:
        return null;
    }
  }

  /**
   * Generate unique schedule ID
   */
  private generateScheduleId(config: ScheduleConfig): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    return `schedule_${timestamp}_${random}`;
  }

  /**
   * Generate unique notification ID
   */
  private generateNotificationId(): string {
    return `notification_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
  }

  // ============================================================================
  // STORAGE METHODS (In real app, these would interact with database)
  // ============================================================================

  private async saveSchedule(schedule: ScheduledExport): Promise<void> {
    // In real implementation, save to database
    console.log('Saving schedule:', schedule.id);
  }

  private async fetchSchedule(
    scheduleId: string
  ): Promise<ScheduledExport | null> {
    // In real implementation, fetch from database
    return null;
  }

  private async fetchAllSchedules(): Promise<ScheduledExport[]> {
    // In real implementation, fetch from database
    return [];
  }

  private async removeSchedule(scheduleId: string): Promise<void> {
    // In real implementation, delete from database
    console.log('Removing schedule:', scheduleId);
  }

  // ============================================================================
  // PUBLIC API METHODS
  // ============================================================================

  /**
   * Get notifications for user
   */
  getNotifications(): ExportNotification[] {
    return this.notifications.sort(
      (a, b) => b.timestamp.getTime() - a.timestamp.getTime()
    );
  }

  /**
   * Mark notification as read
   */
  markNotificationRead(notificationId: string): void {
    const notification = this.notifications.find(n => n.id === notificationId);
    if (notification) {
      notification.read = true;
    }
  }

  /**
   * Clear all notifications
   */
  clearNotifications(): void {
    this.notifications = [];
  }

  /**
   * Pause schedule
   */
  async pauseSchedule(scheduleId: string): Promise<ScheduleResult> {
    const schedule = await this.getSchedule(scheduleId);
    if (!schedule) {
      return {
        success: false,
        scheduleId,
        message: 'Schedule not found',
        nextRun: null,
        errors: ['Schedule not found'],
      };
    }

    schedule.isActive = false;
    await this.cancelRecurringJob(scheduleId);
    await this.saveSchedule(schedule);

    return {
      success: true,
      scheduleId,
      message: 'Schedule paused successfully',
      nextRun: null,
      schedule,
    };
  }

  /**
   * Resume schedule
   */
  async resumeSchedule(scheduleId: string): Promise<ScheduleResult> {
    const schedule = await this.getSchedule(scheduleId);
    if (!schedule) {
      return {
        success: false,
        scheduleId,
        message: 'Schedule not found',
        nextRun: null,
        errors: ['Schedule not found'],
      };
    }

    schedule.isActive = true;
    schedule.nextRun = this.calculateNextRun(schedule.schedule);
    await this.setupRecurringJob(schedule);
    await this.saveSchedule(schedule);

    return {
      success: true,
      scheduleId,
      message: 'Schedule resumed successfully',
      nextRun: schedule.nextRun,
      schedule,
    };
  }

  /**
   * Execute schedule immediately
   */
  async executeNow(scheduleId: string): Promise<ScheduleResult> {
    const schedule = await this.getSchedule(scheduleId);
    if (!schedule) {
      return {
        success: false,
        scheduleId,
        message: 'Schedule not found',
        nextRun: null,
        errors: ['Schedule not found'],
      };
    }

    // Execute immediately
    await this.executeScheduledExport(schedule);

    return {
      success: true,
      scheduleId,
      message: 'Schedule executed successfully',
      nextRun: schedule.nextRun,
      schedule,
    };
  }
}

// Create singleton instance
export const exportSchedulerService = new ExportSchedulerService();
