import { Injectable, inject, signal, computed } from '@angular/core';
import { Observable, tap, catchError, finalize, of } from 'rxjs';
import { DesignationApiService } from './designation-api.service';
import { Designation, DesignationFilters } from '../models/designation.model';
import { RbacService } from '../../../../core/services/rbac.service';
import { Permission } from '../../../../core/models/rbac.models';

@Injectable({ providedIn: 'root' })
export class DesignationStore {
  private readonly api = inject(DesignationApiService);
  private readonly rbacService = inject(RbacService);

  private readonly _designations = signal<Designation[]>([]);
  private readonly _selectedDesignation = signal<Designation | null>(null);
  private readonly _loading = signal<boolean>(false);
  private readonly _error = signal<string | null>(null);
  private readonly _filters = signal<DesignationFilters>({});
  private readonly _pagination = signal({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  readonly designations = this._designations.asReadonly();
  readonly selectedDesignation = this._selectedDesignation.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly error = this._error.asReadonly();
  readonly filters = this._filters.asReadonly();
  readonly pagination = this._pagination.asReadonly();

  readonly page = computed(() => this._pagination().page);
  readonly limit = computed(() => this._pagination().limit);
  readonly total = computed(() => this._pagination().total);
  readonly hasData = computed(() => this._designations().length > 0);

  readonly canCreate = computed(() => this.rbacService.hasPermission(Permission.CREATE));
  readonly canEdit = computed(() => this.rbacService.hasPermission(Permission.EDIT));
  readonly canDelete = computed(() => this.rbacService.hasPermission(Permission.DELETE));

  loadDesignations(params?: Partial<DesignationFilters & { page: number; limit: number }>): void {
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
        console.log('API Response:', JSON.stringify(response));

        const data = response?.data || [];
        const isSuccess = response?.success === true || response?.success === undefined;

        if (Array.isArray(data)) {
          this._designations.set(data);

          if (response?.pagination) {
            this._pagination.set({
              page: response.pagination.page,
              limit: response.pagination.limit,
              total: response.pagination.total,
              totalPages: response.pagination.totalPages,
            });
          } else {
            const total = (response as any).total || data.length;
            const page = (response as any).page || queryParams['page'] || 1;
            const limit = (response as any).limit || queryParams['limit'] || 10;
            this._pagination.set({
              page: Number(page),
              limit: Number(limit),
              total: Number(total),
              totalPages: Math.ceil(Number(total) / Number(limit)),
            });
          }
        }

        if (!isSuccess && data.length === 0) {
          this._error.set((response as any)?.message || 'Unable to load designations');
        } else {
          this._error.set(null);
        }

        this._loading.set(false);
      },
      error: (err: any) => {
        console.error('API Error:', err);
        this._designations.set([]);
        this._pagination.set({
          page: 1,
          limit: 10,
          total: 0,
          totalPages: 0,
        });

        let errorMessage = 'Unable to load designations. Please try again.';

        if (err && typeof err === 'object') {
          if (err.message) {
            errorMessage = err.message;
          } else if (err.error && err.error.message) {
            errorMessage = err.error.message;
          }
        } else if (typeof err === 'string') {
          errorMessage = err;
        }

        this._error.set(errorMessage);
        this._loading.set(false);
      },
    });
  }

  loadById(id: number): void {
    this._loading.set(true);
    this._error.set(null);

    this.api.getById(id).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this._selectedDesignation.set(response.data);
          this._error.set(null);
        } else {
          this._error.set(response.message || 'Failed to load designation');
        }
        this._loading.set(false);
      },
      error: (err: any) => {
        let errorMessage = 'Failed to load designation. Please try again.';
        if (err && typeof err === 'object') {
          if (err.message) {
            errorMessage = err.message;
          } else if (err.error && err.error.message) {
            errorMessage = err.error.message;
          }
        }
        this._error.set(errorMessage);
        this._selectedDesignation.set(null);
        this._loading.set(false);
      },
    });
  }

  create(data: any): Observable<any> {
    this._loading.set(true);
    return this.api.create(data).pipe(
      tap((response) => {
        if (response.success) {
          this._loading.set(false);
        } else {
          this._error.set(response.message || 'Failed to create designation');
        }
      }),
      catchError((err) => {
        this._error.set(err.error?.message || 'An error occurred');
        return of({ success: false, message: err.error?.message });
      }),
      finalize(() => this._loading.set(false)),
    );
  }

  update(id: number, data: any): Observable<any> {
    this._loading.set(true);
    return this.api.update(id, data).pipe(
      tap((response) => {
        if (response.success) {
          this._loading.set(false);
        } else {
          this._error.set(response.message || 'Failed to update designation');
        }
      }),
      catchError((err) => {
        this._error.set(err.error?.message || 'An error occurred');
        return of({ success: false, message: err.error?.message });
      }),
      finalize(() => this._loading.set(false)),
    );
  }

  delete(id: number): Observable<any> {
    this._loading.set(true);
    return this.api.delete(id).pipe(
      tap((response) => {
        if (response.success) {
          this._designations.update((list) => list.filter((d) => d.id !== id));
        } else {
          this._error.set(response.message || 'Failed to delete designation');
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
    this._loading.set(true);
    return this.api.activate(id).pipe(
      tap((response) => {
        if (response.success) {
          this._loading.set(false);
        } else {
          this._error.set(response.message || 'Failed to activate designation');
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
    this._loading.set(true);
    return this.api.deactivate(id).pipe(
      tap((response) => {
        if (response.success) {
          this._designations.update((list) => list.filter((d) => d.id !== id));
        } else {
          this._error.set(response.message || 'Failed to deactivate designation');
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
    const des = this._designations().find((d) => d.id === id);
    if (!des) return of({ success: false, message: 'Designation not found' });

    return des.status === 'active' ? this.deactivate(id) : this.activate(id);
  }

  generateCode(prefix?: string): Observable<any> {
    return this.api.generateCode(prefix);
  }

  setFilters(filters: DesignationFilters): void {
    this._filters.set(filters);
    this.loadDesignations({ ...filters, page: 1 });
  }

  clearFilters(): void {
    this._filters.set({});
    this.loadDesignations();
  }

  setSelectedDesignation(designation: Designation | null): void {
    this._selectedDesignation.set(designation);
  }

  reset(): void {
    this._designations.set([]);
    this._selectedDesignation.set(null);
    this._loading.set(false);
    this._error.set(null);
    this._filters.set({});
    this._pagination.set({ page: 1, limit: 10, total: 0, totalPages: 0 });
  }
}
