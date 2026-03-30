export interface PaginationState {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface SortState {
  column: string;
  order: 'asc' | 'desc';
}

export const DEFAULT_PAGINATION: PaginationState = {
  page: 1,
  limit: 10,
  total: 0,
  totalPages: 0,
};

export const DEFAULT_SORT: SortState = {
  column: 'createdAt',
  order: 'desc',
};

export function createPaginationParams(
  state: PaginationState,
  sortState?: SortState,
  search?: string,
): {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  search?: string;
} {
  return {
    page: state.page,
    limit: state.limit,
    sortBy: sortState?.column,
    sortOrder: sortState?.order,
    search: search || undefined,
  };
}

export function calculateDisplayedPages(totalPages: number, currentPage: number): number[] {
  const pages: number[] = [];

  if (totalPages <= 5) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
    if (currentPage <= 3) {
      pages.push(1, 2, 3, 4, 5);
    } else if (currentPage >= totalPages - 2) {
      for (let i = totalPages - 4; i <= totalPages; i++) pages.push(i);
    } else {
      for (let i = currentPage - 2; i <= currentPage + 2; i++) pages.push(i);
    }
  }

  return pages;
}

export function updatePaginationFromResponse(
  currentState: PaginationState,
  response: { page: number; limit: number; total: number; totalPages: number },
): PaginationState {
  return {
    page: response.page,
    limit: response.limit,
    total: response.total,
    totalPages: response.totalPages,
  };
}
