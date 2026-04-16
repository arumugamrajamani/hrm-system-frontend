export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  errors?: Record<string, string[]>;
  meta?: Record<string, any>;
}

export interface ListResponse<T> {
  data: T[];
  success: boolean;
  message?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  meta?: Record<string, any>;
}

export interface DetailResponse<T> {
  data: T;
  success: boolean;
  message?: string;
  meta?: Record<string, any>;
}

export interface ErrorResponse {
  success: false;
  message: string;
  errors?: Record<string, string[]>;
  code?: string;
}

export interface BaseApiMethods<T> {
  list: (params: Record<string, any>) => import('rxjs').Observable<ListResponse<T>>;
  get: (id: number | string) => import('rxjs').Observable<DetailResponse<T>>;
  create: (data: Partial<T>) => import('rxjs').Observable<DetailResponse<T>>;
  update: (id: number | string, data: Partial<T>) => import('rxjs').Observable<DetailResponse<T>>;
  delete: (id: number | string) => import('rxjs').Observable<ApiResponse<T>>;
}

export function isSuccessResponse<T>(
  response: any,
): response is ListResponse<T> | DetailResponse<T> | ApiResponse<T> {
  return response && response.success === true;
}

export function extractErrorMessages(error: any): string[] {
  if (error?.errors && typeof error.errors === 'object') {
    return Object.values(error.errors).flat() as string[];
  }
  if (error?.message) {
    return [error.message];
  }
  return ['An unexpected error occurred'];
}
