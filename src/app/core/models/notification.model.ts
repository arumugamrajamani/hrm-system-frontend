export type NotificationType =
  | 'leave_request'
  | 'leave_approved'
  | 'leave_rejected'
  | 'leave_cancelled'
  | 'payroll_processed'
  | 'payroll_approved'
  | 'announcement'
  | 'reminder'
  | 'system';

export type NotificationPriority = 'low' | 'normal' | 'high' | 'urgent';

export interface NotificationAction {
  label: string;
  action: string;
  params?: Record<string, any>;
}

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  priority: NotificationPriority;
  read: boolean;
  createdAt: Date;
  expiresAt?: Date;
  action?: NotificationAction;
  data?: Record<string, any>;
  icon?: string;
  color?: string;
}

export interface NotificationFilter {
  type?: NotificationType;
  read?: boolean;
  priority?: NotificationPriority;
  fromDate?: Date;
  toDate?: Date;
}

export interface NotificationPreferences {
  email: boolean;
  push: boolean;
  inApp: boolean;
  types: {
    [key in NotificationType]: {
      enabled: boolean;
      email: boolean;
      push: boolean;
    };
  };
}
