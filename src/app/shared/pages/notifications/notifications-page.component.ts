import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTabsModule } from '@angular/material/tabs';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { NotificationService } from '../../../core/services/notification.service';
import { Notification, NotificationType } from '../../../core/models/notification.model';

@Component({
  selector: 'app-notifications-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatIconModule,
    MatButtonModule,
    MatTabsModule,
    MatMenuModule,
    MatTooltipModule,
  ],
  template: `
    <div class="notifications-page">
      <div class="page-header">
        <h1>
          <mat-icon>notifications</mat-icon>
          Notifications
        </h1>
        <div class="header-actions">
          @if (notificationService.unreadCount() > 0) {
            <button mat-button (click)="markAllAsRead()">
              <mat-icon>done_all</mat-icon>
              Mark all as read
            </button>
          }
          @if (notificationService.notifications().length > 0) {
            <button mat-button color="warn" (click)="clearAll()">
              <mat-icon>delete_sweep</mat-icon>
              Clear all
            </button>
          }
        </div>
      </div>

      <div class="tabs-container">
        <button class="tab" [class.active]="activeTab === 'all'" (click)="activeTab = 'all'">
          All
          <span class="badge">{{ notificationService.notifications().length }}</span>
        </button>
        <button class="tab" [class.active]="activeTab === 'unread'" (click)="activeTab = 'unread'">
          Unread
          @if (notificationService.unreadCount() > 0) {
            <span class="badge unread">{{ notificationService.unreadCount() }}</span>
          }
        </button>
        <button class="tab" [class.active]="activeTab === 'leave'" (click)="activeTab = 'leave'">
          Leave
        </button>
        <button
          class="tab"
          [class.active]="activeTab === 'payroll'"
          (click)="activeTab = 'payroll'"
        >
          Payroll
        </button>
      </div>

      <div class="notifications-list">
        @if (filteredNotifications.length === 0) {
          <div class="empty-state">
            <mat-icon>notifications_none</mat-icon>
            <h3>No notifications</h3>
            <p>You're all caught up!</p>
          </div>
        } @else {
          @for (notification of filteredNotifications; track notification.id) {
            <div
              class="notification-card"
              [class.unread]="!notification.read"
              [class]="'priority-' + notification.priority"
              (click)="onNotificationClick(notification)"
            >
              <div
                class="notification-icon"
                [style.backgroundColor]="notification.color || '#757575'"
              >
                <mat-icon>{{ getIcon(notification) }}</mat-icon>
              </div>
              <div class="notification-content">
                <div class="notification-header">
                  <span class="notification-title">{{ notification.title }}</span>
                  <span class="notification-time">{{ getTimeAgo(notification.createdAt) }}</span>
                </div>
                <div class="notification-message">{{ notification.message }}</div>
                <div class="notification-meta">
                  <span class="notification-type">{{ getTypeLabel(notification.type) }}</span>
                  @if (notification.priority === 'high' || notification.priority === 'urgent') {
                    <span class="priority-badge" [class]="notification.priority">
                      {{ notification.priority }}
                    </span>
                  }
                </div>
              </div>
              <div class="notification-actions">
                @if (!notification.read) {
                  <button
                    mat-icon-button
                    (click)="markAsRead($event, notification)"
                    matTooltip="Mark as read"
                  >
                    <mat-icon>check_circle_outline</mat-icon>
                  </button>
                }
                <button
                  mat-icon-button
                  [matMenuTriggerFor]="notifMenu"
                  (click)="$event.stopPropagation()"
                >
                  <mat-icon>more_vert</mat-icon>
                </button>
                <mat-menu #notifMenu="matMenu">
                  <button mat-menu-item (click)="removeNotification(notification)">
                    <mat-icon>delete</mat-icon>
                    <span>Remove</span>
                  </button>
                </mat-menu>
              </div>
            </div>
          }
        }
      </div>
    </div>
  `,
  styles: [
    `
      .notifications-page {
        padding: 24px;
        max-width: 900px;
        margin: 0 auto;
      }

      .page-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 24px;
      }

      .page-header h1 {
        font-size: 28px;
        font-weight: 700;
        color: #1a202c;
        margin: 0;
        display: flex;
        align-items: center;
        gap: 12px;
      }

      .page-header h1 mat-icon {
        color: #3f51b5;
      }

      .header-actions {
        display: flex;
        gap: 8px;
      }

      .tabs-container {
        display: flex;
        gap: 8px;
        margin-bottom: 24px;
        border-bottom: 2px solid #e0e0e0;
        padding-bottom: 12px;
      }

      .tab {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 8px 16px;
        background: none;
        border: none;
        border-radius: 8px;
        cursor: pointer;
        font-size: 14px;
        font-weight: 500;
        color: #616161;
        transition: all 0.2s;
      }

      .tab:hover {
        background: #f5f5f5;
      }

      .tab.active {
        background: #3f51b5;
        color: white;
      }

      .tab .badge {
        background: rgba(0, 0, 0, 0.1);
        padding: 2px 8px;
        border-radius: 12px;
        font-size: 12px;
      }

      .tab.active .badge {
        background: rgba(255, 255, 255, 0.2);
      }

      .notifications-list {
        display: flex;
        flex-direction: column;
        gap: 12px;
      }

      .empty-state {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 80px 20px;
        text-align: center;
      }

      .empty-state mat-icon {
        font-size: 80px;
        width: 80px;
        height: 80px;
        color: #bdbdbd;
        margin-bottom: 16px;
      }

      .empty-state h3 {
        font-size: 20px;
        color: #424242;
        margin: 0 0 8px;
      }

      .empty-state p {
        color: #757575;
        margin: 0;
      }

      .notification-card {
        display: flex;
        align-items: flex-start;
        gap: 16px;
        padding: 16px;
        background: white;
        border-radius: 12px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
        cursor: pointer;
        transition: all 0.2s;
        border-left: 4px solid transparent;
      }

      .notification-card:hover {
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
        transform: translateY(-2px);
      }

      .notification-card.unread {
        background: #f3f5ff;
        border-left-color: #3f51b5;
      }

      .notification-card.priority-urgent {
        border-left-color: #f44336;
      }

      .notification-card.priority-high {
        border-left-color: #ff9800;
      }

      .notification-icon {
        width: 48px;
        height: 48px;
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
      }

      .notification-icon mat-icon {
        color: white;
        font-size: 24px;
      }

      .notification-content {
        flex: 1;
        min-width: 0;
      }

      .notification-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 4px;
      }

      .notification-title {
        font-weight: 600;
        font-size: 15px;
        color: #212121;
      }

      .notification-time {
        font-size: 12px;
        color: #9e9e9e;
      }

      .notification-message {
        font-size: 14px;
        color: #616161;
        margin-bottom: 8px;
        line-height: 1.5;
      }

      .notification-meta {
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .notification-type {
        font-size: 12px;
        color: #9e9e9e;
        background: #f5f5f5;
        padding: 2px 8px;
        border-radius: 4px;
      }

      .priority-badge {
        font-size: 10px;
        padding: 2px 8px;
        border-radius: 4px;
        text-transform: uppercase;
        font-weight: 600;
      }

      .priority-badge.high {
        background: #fff3e0;
        color: #ff9800;
      }

      .priority-badge.urgent {
        background: #ffebee;
        color: #f44336;
      }

      .notification-actions {
        display: flex;
        align-items: center;
        gap: 4px;
      }
    `,
  ],
})
export class NotificationsPageComponent {
  notificationService = inject(NotificationService);
  private router = inject(Router);

  activeTab: 'all' | 'unread' | 'leave' | 'payroll' = 'all';

  get filteredNotifications(): Notification[] {
    const notifications = this.notificationService.notifications();

    switch (this.activeTab) {
      case 'unread':
        return notifications.filter((n) => !n.read);
      case 'leave':
        return notifications.filter((n) =>
          ['leave_request', 'leave_approved', 'leave_rejected', 'leave_cancelled'].includes(n.type),
        );
      case 'payroll':
        return notifications.filter((n) =>
          ['payroll_processed', 'payroll_approved'].includes(n.type),
        );
      default:
        return notifications;
    }
  }

  getIcon(notification: Notification): string {
    return this.notificationService.getNotificationIcon(notification.type);
  }

  getTypeLabel(type: NotificationType): string {
    const labels: Record<string, string> = {
      leave_request: 'Leave Request',
      leave_approved: 'Leave Approved',
      leave_rejected: 'Leave Rejected',
      leave_cancelled: 'Leave Cancelled',
      payroll_processed: 'Payroll',
      payroll_approved: 'Payroll Approved',
      announcement: 'Announcement',
      reminder: 'Reminder',
      system: 'System',
    };
    return labels[type] || type;
  }

  getTimeAgo(date: Date): string {
    const now = new Date();
    const diff = now.getTime() - new Date(date).getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return new Date(date).toLocaleDateString();
  }

  onNotificationClick(notification: Notification): void {
    this.notificationService.markAsRead(notification.id);

    if (notification.action?.params?.['route']) {
      this.router.navigate([notification.action.params['route']]);
    }
  }

  markAsRead(event: Event, notification: Notification): void {
    event.stopPropagation();
    this.notificationService.markAsRead(notification.id);
  }

  markAllAsRead(): void {
    this.notificationService.markAllAsRead();
  }

  removeNotification(notification: Notification): void {
    this.notificationService.removeNotification(notification.id);
  }

  clearAll(): void {
    if (confirm('Are you sure you want to clear all notifications?')) {
      this.notificationService.clearAll();
    }
  }
}
