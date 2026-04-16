export interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  search?: string;
  [key: string]: any;
}

export interface SortParams {
  column: string;
  direction: 'asc' | 'desc';
}

export interface PaginationState {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface CursorPaginationParams {
  cursor?: string | number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  search?: string;
  [key: string]: any;
}

export const DEFAULT_PAGINATION: PaginationParams = {
  page: 1,
  limit: 10,
};

export const DEFAULT_PAGINATION_STATE: PaginationState = {
  page: 1,
  limit: 10,
  total: 0,
  totalPages: 0,
};

export function calculateTotalPages(total: number, limit: number): number {
  return Math.ceil(total / limit) || 0;
}
