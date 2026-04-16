import { Injectable, inject, signal, computed, PLATFORM_ID, NgZone } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Subject, timer } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import type {
  Notification,
  NotificationType,
  NotificationFilter,
  NotificationPriority,
} from '../models/notification.model';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly ngZone = inject(NgZone);
  private destroy$ = new Subject<void>();

  private readonly _notifications = signal<Notification[]>([]);
  private readonly _unreadCount = signal<number>(0);
  private readonly _isConnected = signal<boolean>(false);
  private readonly _isSupported = signal<boolean>(false);

  private webSocket: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 3000;

  readonly notifications = this._notifications.asReadonly();
  readonly unreadCount = this._unreadCount.asReadonly();
  readonly isConnected = this._isConnected.asReadonly();
  readonly isSupported = this._isSupported.asReadonly();

  readonly unreadNotifications = computed(() => this._notifications().filter((n) => !n.read));

  readonly notificationsByType = computed(() => {
    const grouped: Record<string, Notification[]> = {};
    this._notifications().forEach((n) => {
      if (!grouped[n.type]) {
        grouped[n.type] = [];
      }
      grouped[n.type].push(n);
    });
    return grouped;
  });

  private notificationSubject = new Subject<Notification>();
  readonly notification$ = this.notificationSubject.asObservable();

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      this._isSupported.set('WebSocket' in window);
      this.loadFromStorage();
      this.initializeMockNotifications();
    }
  }

  private initializeMockNotifications(): void {
    const mockNotifications: Notification[] = [
      {
        id: '1',
        type: 'leave_request',
        title: 'New Leave Request',
        message: 'John Smith has submitted a leave request for Dec 20-25, 2024',
        priority: 'normal',
        read: false,
        createdAt: new Date(Date.now() - 1000 * 60 * 30),
        icon: 'event_busy',
        color: '#ff9800',
      },
      {
        id: '2',
        type: 'leave_approved',
        title: 'Leave Approved',
        message: 'Your leave request for Dec 15-17 has been approved',
        priority: 'normal',
        read: false,
        createdAt: new Date(Date.now() - 1000 * 60 * 60),
        icon: 'check_circle',
        color: '#4caf50',
      },
      {
        id: '3',
        type: 'payroll_processed',
        title: 'Payroll Processed',
        message: 'December 2024 payroll has been processed successfully',
        priority: 'high',
        read: true,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24),
        icon: 'payments',
        color: '#3f51b5',
      },
      {
        id: '4',
        type: 'announcement',
        title: 'Office Holiday Schedule',
        message: 'Office will be closed from Dec 25 to Jan 1 for holidays',
        priority: 'normal',
        read: false,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2),
        icon: 'campaign',
        color: '#e91e63',
      },
      {
        id: '5',
        type: 'reminder',
        title: 'Timesheet Reminder',
        message: 'Please submit your December timesheet by Dec 28',
        priority: 'high',
        read: false,
        createdAt: new Date(Date.now() - 1000 * 60 * 15),
        icon: 'schedule',
        color: '#00bcd4',
      },
      {
        id: '6',
        type: 'leave_rejected',
        title: 'Leave Request Rejected',
        message: 'Your leave request for Dec 10-12 has been rejected',
        priority: 'normal',
        read: true,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48),
        icon: 'cancel',
        color: '#f44336',
      },
    ];

    this._notifications.set(mockNotifications);
    this.updateUnreadCount();
  }

  private updateUnreadCount(): void {
    const count = this._notifications().filter((n) => !n.read).length;
    this._unreadCount.set(count);
  }

  private loadFromStorage(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    try {
      const stored = localStorage.getItem('hrm_notifications');
      if (stored) {
        const notifications = JSON.parse(stored) as Notification[];
        notifications.forEach((n) => {
          n.createdAt = new Date(n.createdAt);
          if (n.expiresAt) {
            n.expiresAt = new Date(n.expiresAt);
          }
        });
        this._notifications.set(notifications);
        this.updateUnreadCount();
      }
    } catch (e) {
      console.error('Failed to load notifications from storage', e);
    }
  }

  private saveToStorage(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    try {
      localStorage.setItem('hrm_notifications', JSON.stringify(this._notifications()));
    } catch (e) {
      console.error('Failed to save notifications to storage', e);
    }
  }

  connect(url?: string): void {
    if (!this._isSupported()) {
      console.warn('WebSocket is not supported in this browser');
      return;
    }

    if (this.webSocket?.readyState === WebSocket.OPEN) {
      return;
    }

    const wsUrl = url || this.getWebSocketUrl();

    this.ngZone.runOutsideAngular(() => {
      try {
        this.webSocket = new WebSocket(wsUrl);

        this.webSocket.onopen = () => {
          this.ngZone.run(() => {
            this._isConnected.set(true);
            this.reconnectAttempts = 0;
            console.log('WebSocket connected');
          });
        };

        this.webSocket.onmessage = (event) => {
          this.ngZone.run(() => {
            try {
              const data = JSON.parse(event.data);
              this.handleWebSocketMessage(data);
            } catch (e) {
              console.error('Failed to parse WebSocket message', e);
            }
          });
        };

        this.webSocket.onclose = () => {
          this.ngZone.run(() => {
            this._isConnected.set(false);
            this.attemptReconnect();
          });
        };

        this.webSocket.onerror = (error) => {
          this.ngZone.run(() => {
            console.error('WebSocket error', error);
            this._isConnected.set(false);
          });
        };
      } catch (e) {
        console.error('Failed to create WebSocket connection', e);
      }
    });
  }

  disconnect(): void {
    if (this.webSocket) {
      this.webSocket.close();
      this.webSocket = null;
      this._isConnected.set(false);
    }
    this.destroy$.next();
  }

  private attemptReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.log('Max reconnection attempts reached');
      return;
    }

    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);

    timer(delay)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        console.log(
          `Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`,
        );
        this.connect();
      });
  }

  private getWebSocketUrl(): string {
    if (!isPlatformBrowser(this.platformId)) return '';
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    return `${protocol}//${window.location.host}/ws/notifications`;
  }

  private handleWebSocketMessage(data: any): void {
    switch (data.type) {
      case 'notification':
        this.addNotification(data.notification);
        break;
      case 'read_all':
        this.markAllAsRead();
        break;
      default:
        console.log('Unknown WebSocket message type', data.type);
    }
  }

  addNotification(notification: Omit<Notification, 'id' | 'createdAt'>): void {
    const newNotification: Notification = {
      ...notification,
      id: this.generateId(),
      createdAt: new Date(),
    };

    this._notifications.update((notifications) => [newNotification, ...notifications]);
    this.updateUnreadCount();
    this.saveToStorage();
    this.notificationSubject.next(newNotification);

    if (isPlatformBrowser(this.platformId) && globalThis.Notification.permission === 'granted') {
      this.showBrowserNotification(newNotification);
    }
  }

  private showBrowserNotification(notification: Notification): void {
    if (!isPlatformBrowser(this.platformId)) return;
    if (globalThis.Notification.permission !== 'granted') return;

    try {
      new globalThis.Notification(notification.title, {
        body: notification.message,
        icon: '/assets/icons/icon-192x192.svg',
        tag: notification.id,
      });
    } catch (e) {
      console.error('Failed to show browser notification', e);
    }
  }

  requestBrowserPermission(): Promise<NotificationPermission> {
    if (!isPlatformBrowser(this.platformId) || !('Notification' in window)) {
      return Promise.resolve('denied');
    }

    return this.ngZone.runOutsideAngular(() => {
      return globalThis.Notification.requestPermission();
    });
  }

  markAsRead(id: string): void {
    this._notifications.update((notifications) =>
      notifications.map((n) => (n.id === id ? { ...n, read: true } : n)),
    );
    this.updateUnreadCount();
    this.saveToStorage();
  }

  markAllAsRead(): void {
    this._notifications.update((notifications) => notifications.map((n) => ({ ...n, read: true })));
    this.updateUnreadCount();
    this.saveToStorage();
  }

  removeNotification(id: string): void {
    this._notifications.update((notifications) => notifications.filter((n) => n.id !== id));
    this.updateUnreadCount();
    this.saveToStorage();
  }

  clearAll(): void {
    this._notifications.set([]);
    this._unreadCount.set(0);
    this.saveToStorage();
  }

  getFilteredNotifications(filter: NotificationFilter): Notification[] {
    return this._notifications().filter((n) => {
      if (filter.type && n.type !== filter.type) return false;
      if (filter.read !== undefined && n.read !== filter.read) return false;
      if (filter.priority && n.priority !== filter.priority) return false;
      if (filter.fromDate && n.createdAt < filter.fromDate) return false;
      if (filter.toDate && n.createdAt > filter.toDate) return false;
      return true;
    });
  }

  private generateId(): string {
    return `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  getNotificationIcon(type: NotificationType): string {
    const icons: Record<NotificationType, string> = {
      leave_request: 'event_busy',
      leave_approved: 'check_circle',
      leave_rejected: 'cancel',
      leave_cancelled: 'undo',
      payroll_processed: 'payments',
      payroll_approved: 'verified',
      announcement: 'campaign',
      reminder: 'schedule',
      system: 'settings',
    };
    return icons[type] || 'notifications';
  }

  getNotificationColor(type: NotificationType): string {
    const colors: Record<NotificationType, string> = {
      leave_request: '#ff9800',
      leave_approved: '#4caf50',
      leave_rejected: '#f44336',
      leave_cancelled: '#9e9e9e',
      payroll_processed: '#3f51b5',
      payroll_approved: '#2196f3',
      announcement: '#e91e63',
      reminder: '#00bcd4',
      system: '#607d8b',
    };
    return colors[type] || '#757575';
  }

  getNotificationPriorityLabel(priority: NotificationPriority): string {
    const labels: Record<NotificationPriority, string> = {
      low: 'Low',
      normal: 'Normal',
      high: 'High',
      urgent: 'Urgent',
    };
    return labels[priority];
  }

  ngOnDestroy(): void {
    this.disconnect();
    this.destroy$.next();
    this.destroy$.complete();
  }
}
