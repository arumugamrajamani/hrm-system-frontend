import { Injectable, inject, signal, computed } from '@angular/core';
import { Observable, tap, catchError, finalize, of } from 'rxjs';
import { ShiftApiService } from './shift-api.service';
import { Shift, ShiftFilters } from '../models/shift.model';
import { RbacService } from '../../../../core/services/rbac.service';
import { Permission } from '../../../../core/models/rbac.models';

@Injectable({ providedIn: 'root' })
export class ShiftStore {
  private readonly api = inject(ShiftApiService);
  private readonly rbacService = inject(RbacService);

  private readonly _shifts = signal<Shift[]>([]);
  private readonly _selectedShift = signal<Shift | null>(null);
  private readonly _loading = signal<boolean>(false);
  private readonly _error = signal<string | null>(null);
  private readonly _filters = signal<ShiftFilters>({});
  private readonly _pagination = signal({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  readonly shifts = this._shifts.asReadonly();
  readonly selectedShift = this._selectedShift.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly error = this._error.asReadonly();
  readonly filters = this._filters.asReadonly();
  readonly pagination = this._pagination.asReadonly();

  readonly page = computed(() => this._pagination().page);
  readonly limit = computed(() => this._pagination().limit);
  readonly total = computed(() => this._pagination().total);
  readonly hasData = computed(() => this._shifts().length > 0);

  readonly canCreate = computed(() => this.rbacService.hasPermission(Permission.CREATE));
  readonly canEdit = computed(() => this.rbacService.hasPermission(Permission.EDIT));
  readonly canDelete = computed(() => this.rbacService.hasPermission(Permission.DELETE));

  loadShifts(params?: Partial<ShiftFilters & { page: number; limit: number }>): void {
    this._loading.set(true);
    this._error.set(null);

    const queryParams = {
      ...this._filters(),
      page: params?.page || this._pagination().page,
      limit: params?.limit || this._pagination().limit,
      ...params,
    };

    this.api.list(queryParams).subscribe({
      next: (response: any) => {
        console.log('API Response in store:', JSON.stringify(response));

        const isSuccess = response && (response.success === true || response.success === undefined);
        const data = response?.data || response?.data || [];

        if (isSuccess && Array.isArray(data)) {
          this._shifts.set(data);

          // Handle pagination from meta.pagination (API structure)
          if (response?.meta?.pagination) {
            this._pagination.set({
              page: response.meta.pagination.page,
              limit: response.meta.pagination.limit,
              total: response.meta.pagination.total,
              totalPages: response.meta.pagination.totalPages,
            });
          } else if (response?.pagination) {
            // Fallback to direct pagination field
            this._pagination.set({
              page: response.pagination.page,
              limit: response.pagination.limit,
              total: response.pagination.total,
              totalPages: response.pagination.totalPages,
            });
          } else {
            const total = response?.total || data.length;
            const page = response?.page || queryParams['page'] || 1;
            const limit = response?.limit || queryParams['limit'] || 10;
            this._pagination.set({
              page: Number(page),
              limit: Number(limit),
              total: Number(total),
              totalPages: Math.ceil(Number(total) / Number(limit)),
            });
          }
        } else {
          this._error.set(response?.message || 'Failed to load shifts');
        }
        this._loading.set(false);
      },
      error: (err) => {
        console.error('API Error:', err);
        this._error.set(err.error?.message || err.message || 'An error occurred');
        this._loading.set(false);
      },
    });
  }

  loadShiftById(id: number): void {
    this._loading.set(true);
    this._error.set(null);

    this.api.getById(id).subscribe({
      next: (response: any) => {
        const data = response?.data || response;
        if (response.success !== false && data) {
          this._selectedShift.set(data);
        } else {
          this._error.set(response?.message || 'Failed to load shift');
        }
        this._loading.set(false);
      },
      error: (err) => {
        this._error.set(err.error?.message || 'An error occurred');
        this._loading.set(false);
      },
    });
  }

  createShift(data: Partial<Shift>): Observable<any> {
    this._loading.set(true);
    return this.api.create(data).pipe(
      tap((response) => {
        if (response.success) {
          this._loading.set(false);
        } else {
          this._error.set(response.message || 'Failed to create shift');
        }
      }),
      catchError((err) => {
        this._error.set(err.error?.message || 'An error occurred');
        return of({ success: false, message: err.error?.message });
      }),
      finalize(() => this._loading.set(false)),
    );
  }

  updateShift(id: number, data: Partial<Shift>): Observable<any> {
    this._loading.set(true);
    return this.api.update(id, data).pipe(
      tap((response) => {
        if (response.success) {
          this._loading.set(false);
        } else {
          this._error.set(response.message || 'Failed to update shift');
        }
      }),
      catchError((err) => {
        this._error.set(err.error?.message || 'An error occurred');
        return of({ success: false, message: err.error?.message });
      }),
      finalize(() => this._loading.set(false)),
    );
  }

  deleteShift(id: number): Observable<any> {
    this._loading.set(true);
    return this.api.updateStatus(id, 'inactive').pipe(
      tap((response) => {
        if (response.success) {
          this._shifts.update((list) => list.filter((s) => s.id !== id));
        } else {
          this._error.set(response.message || 'Failed to deactivate shift');
        }
      }),
      catchError((err) => {
        this._error.set(err.error?.message || 'An error occurred');
        return of({ success: false, message: err.error?.message });
      }),
      finalize(() => this._loading.set(false)),
    );
  }

  toggleStatus(id: number): Observable<any> {
    const shift = this._shifts().find((s) => s.id === id);
    if (!shift) return of({ success: false, message: 'Shift not found' });

    const newStatus = shift.status === 'active' ? 'inactive' : 'active';
    this._loading.set(true);
    return this.api.updateStatus(id, newStatus).pipe(
      tap((response) => {
        if (response.success) {
          this._shifts.update((list) =>
            list.map((s) => (s.id === id ? { ...s, status: newStatus } : s)),
          );
        } else {
          this._error.set(response.message || 'Failed to update status');
        }
      }),
      catchError((err) => {
        this._error.set(err.error?.message || 'An error occurred');
        return of({ success: false, message: err.error?.message });
      }),
      finalize(() => this._loading.set(false)),
    );
  }

  setFilters(filters: ShiftFilters): void {
    this._filters.set(filters);
    this.loadShifts({ ...filters, page: 1 });
  }

  clearFilters(): void {
    this._filters.set({});
    this.loadShifts();
  }

  setSelectedShift(shift: Shift | null): void {
    this._selectedShift.set(shift);
  }

  reset(): void {
    this._shifts.set([]);
    this._selectedShift.set(null);
    this._loading.set(false);
    this._error.set(null);
    this._filters.set({});
    this._pagination.set({ page: 1, limit: 10, total: 0, totalPages: 0 });
  }
}
