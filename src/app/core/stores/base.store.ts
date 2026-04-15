import { signal, computed, Injectable, type Signal } from '@angular/core';
import { Observable, catchError, finalize, tap, of } from 'rxjs';

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
}

export interface DetailResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

export interface ApiResponse<T> {
  data?: T;
  success: boolean;
  message?: string;
}

export interface BaseApiMethods<T> {
  list: (params: Record<string, unknown>) => Observable<ListResponse<T>>;
  get: (id: number) => Observable<DetailResponse<T>>;
  create: (data: Partial<T>) => Observable<DetailResponse<T>>;
  update: (id: number, data: Partial<T>) => Observable<DetailResponse<T>>;
  delete: (id: number) => Observable<ApiResponse<T>>;
}

@Injectable()
export class BaseStore<T> {
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

  readonly items: Signal<T[]> = this._items.asReadonly();
  readonly selected: Signal<T | null> = this._selected.asReadonly();
  readonly loading: Signal<boolean> = this._loading.asReadonly();
  readonly error: Signal<string | null> = this._error.asReadonly();
  readonly pagination: Signal<PaginationState> = this._pagination.asReadonly();
  readonly filters: Signal<Record<string, unknown>> = this._filters.asReadonly();

  readonly page = computed(() => this._pagination().page);
  readonly limit = computed(() => this._pagination().limit);
  readonly total = computed(() => this._pagination().total);
  readonly totalPages = computed(() => this._pagination().totalPages);
  readonly hasData = computed(() => this._items().length > 0);
  readonly hasError = computed(() => !!this._error());

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

  protected setPagination(pagination: PaginationState): void {
    this._pagination.set(pagination);
  }

  protected setFilters(filters: Record<string, unknown>): void {
    this._filters.set(filters);
  }

  updateItemInList(updatedItem: T & { id: number | string }): void {
    this._items.update((items) =>
      items.map((item: any) => (item.id === updatedItem.id ? { ...item, ...updatedItem } : item)),
    );
  }

  addItemToList(item: T): void {
    this._items.update((items) => [item, ...items]);
  }

  removeItemFromList(id: number | string): void {
    this._items.update((items) => items.filter((item: any) => item.id !== id));
  }

  reset(): void {
    this._items.set([]);
    this._selected.set(null);
    this._loading.set(false);
    this._error.set(null);
    this._pagination.set({ page: 1, limit: 10, total: 0, totalPages: 0 });
    this._filters.set({});
  }
}
