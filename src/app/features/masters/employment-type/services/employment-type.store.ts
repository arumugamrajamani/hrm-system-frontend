import { Injectable, inject, signal, computed } from '@angular/core';
import { Observable, tap, catchError, finalize, of } from 'rxjs';
import { EmploymentTypeApiService } from './employment-type-api.service';
import { EmploymentType, EmploymentTypeFilters } from '../models/employment-type.model';
import { RbacService } from '../../../../core/services/rbac.service';
import { Permission } from '../../../../core/models/rbac.models';

@Injectable({ providedIn: 'root' })
export class EmploymentTypeStore {
  private readonly api = inject(EmploymentTypeApiService);
  private readonly rbacService = inject(RbacService);

  private readonly _employmentTypes = signal<EmploymentType[]>([]);
  private readonly _selectedEmploymentType = signal<EmploymentType | null>(null);
  private readonly _loading = signal<boolean>(false);
  private readonly _error = signal<string | null>(null);
  private readonly _filters = signal<EmploymentTypeFilters>({});
  private readonly _pagination = signal({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  readonly employmentTypes = this._employmentTypes.asReadonly();
  readonly selectedEmploymentType = this._selectedEmploymentType.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly error = this._error.asReadonly();
  readonly filters = this._filters.asReadonly();
  readonly pagination = this._pagination.asReadonly();

  readonly page = computed(() => this._pagination().page);
  readonly limit = computed(() => this._pagination().limit);
  readonly total = computed(() => this._pagination().total);
  readonly hasData = computed(() => this._employmentTypes().length > 0);

  readonly canCreate = computed(() => this.rbacService.hasPermission(Permission.CREATE));
  readonly canEdit = computed(() => this.rbacService.hasPermission(Permission.EDIT));
  readonly canDelete = computed(() => this.rbacService.hasPermission(Permission.DELETE));

  loadEmploymentTypes(
    params?: Partial<EmploymentTypeFilters & { page: number; limit: number }>,
  ): void {
    this._loading.set(true);
    this._error.set(null);

    const queryParams = {
      ...this._filters(),
      page: params?.page || this._pagination().page,
      limit: params?.limit || this._pagination().limit,
      ...params,
    };

    this.api.list(queryParams).subscribe({
      next: (response) => {
        const isSuccess = response && (response.success === true || response.success === undefined);
        const data = response?.data || [];

        if (isSuccess && Array.isArray(data)) {
          this._employmentTypes.set(data);
          if (response?.pagination) {
            this._pagination.set({
              page: response.pagination.page,
              limit: response.pagination.limit,
              total: response.pagination.total,
              totalPages: response.pagination.totalPages,
            });
          }
        } else {
          this._error.set((response as any)?.message || 'Failed to load employment types');
        }
        this._loading.set(false);
      },
      error: (err) => {
        this._error.set(err.error?.message || err.message || 'An error occurred');
        this._loading.set(false);
      },
    });
  }

  loadEmploymentTypeById(id: number): void {
    this._loading.set(true);
    this._error.set(null);

    this.api.getById(id).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this._selectedEmploymentType.set(response.data);
        } else {
          this._error.set(response.message || 'Failed to load employment type');
        }
        this._loading.set(false);
      },
      error: (err) => {
        this._error.set(err.error?.message || 'An error occurred');
        this._loading.set(false);
      },
    });
  }

  createEmploymentType(data: Partial<EmploymentType>): Observable<any> {
    this._loading.set(true);
    return this.api.create(data).pipe(
      tap((response) => {
        if (response.success) {
          this._employmentTypes.update((list) => [response.data, ...list]);
        } else {
          this._error.set(response.message || 'Failed to create employment type');
        }
      }),
      catchError((err) => {
        this._error.set(err.error?.message || 'An error occurred');
        return of({ success: false, message: err.error?.message });
      }),
      finalize(() => this._loading.set(false)),
    );
  }

  updateEmploymentType(id: number, data: Partial<EmploymentType>): Observable<any> {
    this._loading.set(true);
    return this.api.update(id, data).pipe(
      tap((response) => {
        if (response.success) {
          this._employmentTypes.update((list) =>
            list.map((item) => (item.id === id ? { ...item, ...response.data } : item)),
          );
        } else {
          this._error.set(response.message || 'Failed to update employment type');
        }
      }),
      catchError((err) => {
        this._error.set(err.error?.message || 'An error occurred');
        return of({ success: false, message: err.error?.message });
      }),
      finalize(() => this._loading.set(false)),
    );
  }

  deleteEmploymentType(id: number): Observable<any> {
    this._loading.set(true);
    return this.api.delete(id).pipe(
      tap((response) => {
        if (response.success) {
          this._employmentTypes.update((list) => list.filter((item) => item.id !== id));
        } else {
          this._error.set(response.message || 'Failed to delete employment type');
        }
      }),
      catchError((err) => {
        this._error.set(err.error?.message || 'An error occurred');
        return of({ success: false, message: err.error?.message });
      }),
      finalize(() => this._loading.set(false)),
    );
  }

  activate(id: number): Observable<any> {
    const item = this._employmentTypes().find((d) => d.id === id);
    if (!item) return of({ success: false, message: 'Employment type not found' });

    this._loading.set(true);
    return this.api.activate(id).pipe(
      tap((response) => {
        if (response.success) {
          this._employmentTypes.update((list) =>
            list.map((d) => (d.id === id ? { ...d, status: 'active' as const } : d)),
          );
        } else {
          this._error.set(response.message || 'Failed to activate');
        }
      }),
      catchError((err) => {
        this._error.set(err.error?.message || 'An error occurred');
        return of({ success: false, message: err.error?.message });
      }),
      finalize(() => this._loading.set(false)),
    );
  }

  deactivate(id: number): Observable<any> {
    const item = this._employmentTypes().find((d) => d.id === id);
    if (!item) return of({ success: false, message: 'Employment type not found' });

    this._loading.set(true);
    return this.api.deactivate(id).pipe(
      tap((response) => {
        if (response.success) {
          this._employmentTypes.update((list) =>
            list.map((d) => (d.id === id ? { ...d, status: 'inactive' as const } : d)),
          );
        } else {
          this._error.set(response.message || 'Failed to deactivate');
        }
      }),
      catchError((err) => {
        this._error.set(err.error?.message || 'An error occurred');
        return of({ success: false, message: err.error?.message });
      }),
      finalize(() => this._loading.set(false)),
    );
  }

  setFilters(filters: EmploymentTypeFilters): void {
    this._filters.set(filters);
    this.loadEmploymentTypes({ ...filters, page: 1 });
  }

  clearFilters(): void {
    this._filters.set({});
    this.loadEmploymentTypes();
  }

  setSelectedEmploymentType(item: EmploymentType | null): void {
    this._selectedEmploymentType.set(item);
  }

  reset(): void {
    this._employmentTypes.set([]);
    this._selectedEmploymentType.set(null);
    this._loading.set(false);
    this._error.set(null);
    this._filters.set({});
    this._pagination.set({ page: 1, limit: 10, total: 0, totalPages: 0 });
  }
}
