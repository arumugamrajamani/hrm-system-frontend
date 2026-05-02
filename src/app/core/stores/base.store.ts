import { signal, computed, Injectable, type Signal } from '@angular/core';
import { Observable, tap, catchError, finalize, of } from 'rxjs';
import type {
  ListResponse,
  DetailResponse,
  ApiResponse,
  BaseApiMethods,
} from '../../shared/models/api-response.model';
import type { PaginationParams } from '../../shared/models/pagination.model';

export interface PaginationState {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface BaseListState<T> {
  items: T[];
  selected: T | null;
  loading: boolean;
  error: string | null;
  pagination: PaginationState;
  filters: Record<string, unknown>;
}

export { ListResponse, DetailResponse, ApiResponse, BaseApiMethods, PaginationParams };

@Injectable()
export class BaseStore<T extends { id?: number | string }> {
  protected readonly _items = signal<T[]>([]);
  protected readonly _selected = signal<T | null>(null);
  protected readonly _loading = signal<boolean>(false);
  protected readonly _error = signal<string | null>(null);
  protected readonly _pagination = signal<PaginationState>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });
  protected readonly _filters = signal<Record<string, unknown>>({});
  protected readonly _sorting = signal<{ column: string; direction: 'asc' | 'desc' } | null>(null);
  protected readonly _selectedIds = signal<Set<number | string>>(new Set());

  readonly items: Signal<T[]> = this._items.asReadonly();
  readonly selected: Signal<T | null> = this._selected.asReadonly();
  readonly loading: Signal<boolean> = this._loading.asReadonly();
  readonly error: Signal<string | null> = this._error.asReadonly();
  readonly pagination: Signal<PaginationState> = this._pagination.asReadonly();
  readonly filters: Signal<Record<string, unknown>> = this._filters.asReadonly();
  readonly sorting = this._sorting.asReadonly();
  readonly selectedIds = this._selectedIds.asReadonly();

  readonly page = computed(() => this._pagination().page);
  readonly limit = computed(() => this._pagination().limit);
  readonly total = computed(() => this._pagination().total);
  readonly totalPages = computed(() => this._pagination().totalPages);
  readonly hasData = computed(() => this._items().length > 0);
  readonly hasError = computed(() => !!this._error());
  readonly isLoading = computed(() => this._loading());
  readonly isEmpty = computed(() => !this._loading() && this._items().length === 0);

  readonly selectedCount = computed(() => this._selectedIds().size);
  readonly allSelected = computed(() => {
    const items = this._items();
    const selectedIds = this._selectedIds();
    return items.length > 0 && items.every((item) => item.id && selectedIds.has(item.id));
  });

  protected setItems(items: T[]): void {
    this._items.set(items);
    this._loading.set(false);
    this._error.set(null);
  }

  protected setSelected(item: T | null): void {
    this._selected.set(item);
  }

  protected setLoading(loading: boolean): void {
    this._loading.set(loading);
    if (loading) {
      this._error.set(null);
    }
  }

  protected setError(error: string | null): void {
    this._error.set(error);
    this._loading.set(false);
  }

  protected setPagination(pagination: Partial<PaginationState>): void {
    this._pagination.update((current) => ({ ...current, ...pagination }));
  }

  protected updatePaginationResponse(response: ListResponse<T>): void {
    if (response.pagination) {
      this._pagination.set({
        page: response.pagination.page,
        limit: response.pagination.limit,
        total: response.pagination.total,
        totalPages: response.pagination.totalPages,
      });
    }
  }

  protected setFilters(filters: Record<string, unknown>): void {
    this._filters.set(filters);
  }

  protected updateFilters(updates: Record<string, unknown>): void {
    this._filters.update((current) => ({ ...current, ...updates }));
  }

  protected setSorting(column: string, direction: 'asc' | 'desc' | null): void {
    if (direction === null) {
      this._sorting.set(null);
    } else {
      this._sorting.set({ column, direction });
    }
  }

  protected setPage(page: number): void {
    this._pagination.update((p) => ({ ...p, page }));
  }

  protected setPageSize(limit: number): void {
    this._pagination.update((p) => ({ ...p, limit, page: 1 }));
  }

  updateItemInList(updatedItem: T): void {
    if (!updatedItem.id) return;
    this._items.update((items) =>
      items.map((item) => (item.id === updatedItem.id ? { ...item, ...updatedItem } : item)),
    );
  }

  addItemToList(item: T): void {
    this._items.update((items) => [item, ...items]);
    this._pagination.update((p) => ({ ...p, total: p.total + 1 }));
  }

  addItemsToList(items: T[]): void {
    this._items.update((current) => [...items, ...current]);
    this._pagination.update((p) => ({ ...p, total: p.total + items.length }));
  }

  removeItemFromList(id: number | string): void {
    this._items.update((items) => items.filter((item) => item.id !== id));
    this._pagination.update((p) => ({ ...p, total: Math.max(0, p.total - 1) }));
    this._selectedIds.update((ids) => {
      const newIds = new Set(ids);
      newIds.delete(id);
      return newIds;
    });
  }

  selectItem(id: number | string): void {
    this._selectedIds.update((ids) => {
      const newIds = new Set(ids);
      newIds.add(id);
      return newIds;
    });
  }

  deselectItem(id: number | string): void {
    this._selectedIds.update((ids) => {
      const newIds = new Set(ids);
      newIds.delete(id);
      return newIds;
    });
  }

  toggleSelection(id: number | string): void {
    this._selectedIds.update((ids) => {
      const newIds = new Set(ids);
      if (newIds.has(id)) {
        newIds.delete(id);
      } else {
        newIds.add(id);
      }
      return newIds;
    });
  }

  selectAll(): void {
    const allIds = new Set(
      this._items()
        .filter((item) => item.id)
        .map((item) => item.id as number | string),
    );
    this._selectedIds.set(allIds);
  }

  deselectAll(): void {
    this._selectedIds.set(new Set());
  }

  isSelected(id: number | string): boolean {
    return this._selectedIds().has(id);
  }

  getSelectedItems(): T[] {
    const selectedIds = this._selectedIds();
    return this._items().filter((item) => item.id && selectedIds.has(item.id));
  }

  getFirstItem(): T | null {
    return this._items()[0] || null;
  }

  getItemById(id: number | string): T | undefined {
    return this._items().find((item) => item.id === id);
  }

  reset(): void {
    this._items.set([]);
    this._selected.set(null);
    this._loading.set(false);
    this._error.set(null);
    this._pagination.set({ page: 1, limit: 10, total: 0, totalPages: 0 });
    this._filters.set({});
    this._sorting.set(null);
    this._selectedIds.set(new Set());
  }

  resetPagination(): void {
    this._pagination.set({ page: 1, limit: 10, total: 0, totalPages: 0 });
  }

  resetFilters(): void {
    this._filters.set({});
    this._pagination.update((p) => ({ ...p, page: 1 }));
  }

  protected handleApiError(error: any): Observable<any> {
    const errorMessage = error?.message || 'An unexpected error occurred';
    this.setError(errorMessage);
    return of(null);
  }

  protected withLoading<T>(observable: Observable<T>): Observable<T> {
    return new Observable<T>((observer) => {
      this.setLoading(true);
      return observable.subscribe({
        next: (value) => {
          this.setLoading(false);
          observer.next(value);
        },
        error: (error) => {
          this.setLoading(false);
          this.setError(error?.message || 'An error occurred');
          observer.error(error);
        },
        complete: () => observer.complete(),
      });
    });
  }

  getPaginationParams(): PaginationParams {
    const pagination = this._pagination();
    const filters = this._filters();
    const sorting = this._sorting();

    return {
      page: pagination.page,
      limit: pagination.limit,
      ...filters,
      sortBy: sorting?.column,
      sortOrder: sorting?.direction,
    };
  }
}
