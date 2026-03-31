export interface User {
  id?: number;
  username: string;
  email: string;
  mobile: string;
  password?: string;
  role_id?: number;
  role?: UserRole;
  role_name?: string;
  permissions?: string[];
  status?: 'active' | 'inactive' | 'pending';
  profile_photo?: string;
  firstName?: string;
  lastName?: string;
  avatar?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface UserRole {
  id: number;
  name: string;
  permissions: string[];
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data?: {
    user: User;
    token: string;
    refreshToken?: string;
  };
}

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  errors?: any;
}

export interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  search?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface MenuItem {
  label: string;
  icon: string;
  route: string;
  roles?: string[];
  children?: MenuItem[];
}

export interface PasswordStrength {
  score: number;
  level: 'weak' | 'medium' | 'strong';
  color: string;
  message: string;
}

export interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  duration?: number;
  icon?: string;
}

export interface ModalConfig {
  title: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info' | 'confirm';
  confirmText?: string;
  cancelText?: string;
  showCancel?: boolean;
  autoClose?: number;
  onConfirm?: () => void;
  onCancel?: () => void;
}

export * from './rbac.models';
