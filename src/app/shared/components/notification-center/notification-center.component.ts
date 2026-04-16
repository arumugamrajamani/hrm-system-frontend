import { Component, inject, ChangeDetectionStrategy, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatBadgeModule } from '@angular/material/badge';
import { NotificationService } from '../../../core/services/notification.service';
import { Notification } from '../../../core/models/notification.model';

@Component({
  selector: 'app-notification-center',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule, MatMenuModule, MatBadgeModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <button
      mat-icon-button
      [matMenuTriggerFor]="notificationMenu"
      [matBadge]="notificationService.unreadCount() > 0 ? notificationService.unreadCount() : null"
      matBadgeColor="warn"
      matBadgeSize="small"
      matTooltip="Notifications"
      aria-label="Notifications"
    >
      <mat-icon>notifications</mat-icon>
    </button>

    <mat-menu #notificationMenu="matMenu" class="notification-menu">
      <div class="notification-header" (click)="$event.stopPropagation()">
        <h3>Notifications</h3>
        <div class="header-actions">
          @if (notificationService.unreadCount() > 0) {
            <button mat-button (click)="markAllAsRead()">Mark all as read</button>
          }
          <button mat-icon-button [matMenuTriggerFor]="filterMenu">
            <mat-icon>filter_list</mat-icon>
          </button>
        </div>
      </div>

      <mat-menu #filterMenu="matMenu">
        <button mat-menu-item (click)="filterBy = 'all'">
          <mat-icon>list</mat-icon>
          <span>All</span>
        </button>
        <button mat-menu-item (click)="filterBy = 'unread'">
          <mat-icon>mark_email_unread</mat-icon>
          <span>Unread</span>
        </button>
        <button mat-menu-item (click)="filterBy = 'read'">
          <mat-icon>mark_email_read</mat-icon>
          <span>Read</span>
        </button>
      </mat-menu>

      <div class="notification-list" (click)="$event.stopPropagation()">
        @if (filteredNotifications.length === 0) {
          <div class="empty-state">
            <mat-icon>notifications_none</mat-icon>
            <p>No notifications</p>
          </div>
        } @else {
          @for (notification of filteredNotifications; track notification.id) {
            <div
              class="notification-item"
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
                <div class="notification-title">{{ notification.title }}</div>
                <div class="notification-message">{{ notification.message }}</div>
                <div class="notification-time">{{ getTimeAgo(notification.createdAt) }}</div>
              </div>
              <div class="notification-actions">
                @if (!notification.read) {
                  <button mat-icon-button (click)="markAsRead($event, notification)">
                    <mat-icon>check</mat-icon>
                  </button>
                }
                <button mat-icon-button (click)="removeNotification($event, notification)">
                  <mat-icon>close</mat-icon>
                </button>
              </div>
            </div>
          }
        }
      </div>

      <div class="notification-footer" (click)="$event.stopPropagation()">
        <button mat-button color="primary" (click)="viewAll()">View All Notifications</button>
        @if (notificationService.notifications().length > 0) {
          <button mat-button color="warn" (click)="clearAll()">Clear All</button>
        }
      </div>
    </mat-menu>
  `,
  styles: [
    `
      .notification-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 12px 16px;
        border-bottom: 1px solid #e0e0e0;
        background: #f5f5f5;
      }

      .notification-header h3 {
        margin: 0;
        font-size: 16px;
        font-weight: 600;
      }

      .header-actions {
        display: flex;
        align-items: center;
        gap: 4px;
      }

      .notification-list {
        max-height: 400px;
        overflow-y: auto;
      }

      .empty-state {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 40px 20px;
        color: #757575;
      }

      .empty-state mat-icon {
        font-size: 48px;
        width: 48px;
        height: 48px;
        margin-bottom: 12px;
        opacity: 0.5;
      }

      .empty-state p {
        margin: 0;
        font-size: 14px;
      }

      .notification-item {
        display: flex;
        align-items: flex-start;
        padding: 12px 16px;
        border-bottom: 1px solid #f0f0f0;
        cursor: pointer;
        transition: background 0.2s;
      }

      .notification-item:hover {
        background: #f5f5f5;
      }

      .notification-item.unread {
        background: #e3f2fd;
      }

      .notification-item.unread:hover {
        background: #bbdefb;
      }

      .notification-item.priority-urgent {
        border-left: 3px solid #f44336;
      }

      .notification-item.priority-high {
        border-left: 3px solid #ff9800;
      }

      .notification-icon {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        margin-right: 12px;
      }

      .notification-icon mat-icon {
        color: white;
        font-size: 20px;
        width: 20px;
        height: 20px;
      }

      .notification-content {
        flex: 1;
        min-width: 0;
      }

      .notification-title {
        font-weight: 600;
        font-size: 14px;
        color: #212121;
        margin-bottom: 4px;
      }

      .notification-message {
        font-size: 13px;
        color: #616161;
        margin-bottom: 4px;
        overflow: hidden;
        text-overflow: ellipsis;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
      }

      .notification-time {
        font-size: 11px;
        color: #9e9e9e;
      }

      .notification-actions {
        display: flex;
        align-items: center;
        gap: 4px;
        opacity: 0;
        transition: opacity 0.2s;
      }

      .notification-item:hover .notification-actions {
        opacity: 1;
      }

      .notification-actions button {
        width: 28px;
        height: 28px;
      }

      .notification-actions mat-icon {
        font-size: 18px;
        width: 18px;
        height: 18px;
      }

      .notification-footer {
        display: flex;
        justify-content: space-between;
        padding: 8px 16px;
        border-top: 1px solid #e0e0e0;
        background: #f5f5f5;
      }

      ::ng-deep .notification-menu {
        max-width: 400px !important;
      }
    `,
  ],
})
export class NotificationCenterComponent {
  notificationService = inject(NotificationService);

  @Output() notificationClick = new EventEmitter<Notification>();
  @Output() viewAllClick = new EventEmitter<void>();

  filterBy: 'all' | 'unread' | 'read' = 'all';

  get filteredNotifications(): Notification[] {
    const notifications = this.notificationService.notifications();
    switch (this.filterBy) {
      case 'unread':
        return notifications.filter((n) => !n.read);
      case 'read':
        return notifications.filter((n) => n.read);
      default:
        return notifications;
    }
  }

  getIcon(notification: Notification): string {
    return this.notificationService.getNotificationIcon(notification.type);
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
    this.notificationClick.emit(notification);
  }

  markAsRead(event: Event, notification: Notification): void {
    event.stopPropagation();
    this.notificationService.markAsRead(notification.id);
  }

  removeNotification(event: Event, notification: Notification): void {
    event.stopPropagation();
    this.notificationService.removeNotification(notification.id);
  }

  markAllAsRead(): void {
    this.notificationService.markAllAsRead();
  }

  clearAll(): void {
    this.notificationService.clearAll();
  }

  viewAll(): void {
    this.viewAllClick.emit();
  }
}
