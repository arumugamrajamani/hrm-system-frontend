import { Injectable, inject, signal, computed } from '@angular/core';
import { Observable, tap, catchError, finalize, of } from 'rxjs';
import { DepartmentApiService } from './department-api.service';
import { Department, DepartmentFilters, DepartmentTree } from '../models/department.model';
import { RbacService } from '../../../../core/services/rbac.service';
import { Permission } from '../../../../core/models/rbac.models';

@Injectable({ providedIn: 'root' })
export class DepartmentStore {
  private readonly api = inject(DepartmentApiService);
  private readonly rbacService = inject(RbacService);

  private readonly _departments = signal<Department[]>([]);
  private readonly _departmentTree = signal<DepartmentTree[]>([]);
  private readonly _selectedDepartment = signal<Department | null>(null);
  private readonly _loading = signal<boolean>(false);
  private readonly _error = signal<string | null>(null);
  private readonly _filters = signal<DepartmentFilters>({});
  private readonly _pagination = signal({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  readonly departments = this._departments.asReadonly();
  readonly departmentTree = this._departmentTree.asReadonly();
  readonly selectedDepartment = this._selectedDepartment.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly error = this._error.asReadonly();
  readonly filters = this._filters.asReadonly();
  readonly pagination = this._pagination.asReadonly();

  readonly page = computed(() => this._pagination().page);
  readonly limit = computed(() => this._pagination().limit);
  readonly total = computed(() => this._pagination().total);
  readonly hasData = computed(() => this._departments().length > 0);

  readonly canCreate = computed(() => this.rbacService.hasPermission(Permission.CREATE));
  readonly canEdit = computed(() => this.rbacService.hasPermission(Permission.EDIT));
  readonly canDelete = computed(() => this.rbacService.hasPermission(Permission.DELETE));

  loadDepartments(params?: Partial<DepartmentFilters & { page: number; limit: number }>): void {
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

        const isSuccess = response && (response.success === true || response.success === undefined);
        const data = response?.data || [];

        if (isSuccess && Array.isArray(data)) {
          this._departments.set(data);

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
        } else {
          this._error.set((response as any)?.message || 'Failed to load departments');
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

  loadDepartmentTree(): void {
    this._loading.set(true);
    this._error.set(null);

    this.api.getTree().subscribe({
      next: (response) => {
        if (response.success) {
          this._departmentTree.set(response.data || []);
        } else {
          this._error.set('Failed to load department tree');
        }
        this._loading.set(false);
      },
      error: (err) => {
        this._error.set(err.error?.message || 'An error occurred');
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
          this._selectedDepartment.set(response.data);
        } else {
          this._error.set(response.message || 'Failed to load department');
        }
        this._loading.set(false);
      },
      error: (err) => {
        this._error.set(err.error?.message || 'An error occurred');
        this._loading.set(false);
      },
    });
  }

  create(data: Partial<Department>): Observable<any> {
    this._loading.set(true);
    return this.api.create(data).pipe(
      tap((response) => {
        if (response.success) {
          this._loading.set(false);
        } else {
          this._error.set(response.message || 'Failed to create department');
        }
      }),
      catchError((err) => {
        this._error.set(err.error?.message || 'An error occurred');
        return of({ success: false, message: err.error?.message });
      }),
      finalize(() => this._loading.set(false)),
    );
  }

  update(id: number, data: Partial<Department>): Observable<any> {
    this._loading.set(true);
    return this.api.update(id, data).pipe(
      tap((response) => {
        if (response.success) {
          this._loading.set(false);
        } else {
          this._error.set(response.message || 'Failed to update department');
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
    return this.api.updateStatus(id, 'inactive').pipe(
      tap((response) => {
        if (response.success) {
          this._departments.update((list) => list.filter((d) => d.id !== id));
        } else {
          this._error.set(response.message || 'Failed to deactivate department');
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
    const dept = this._departments().find((d) => d.id === id);
    if (!dept) return of({ success: false, message: 'Department not found' });

    const newStatus = dept.status === 'active' ? 'inactive' : 'active';
    this._loading.set(true);
    return this.api.updateStatus(id, newStatus).pipe(
      tap((response) => {
        if (response.success) {
          this._departments.update((list) =>
            list.map((d) => (d.id === id ? { ...d, status: newStatus } : d)),
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

  setFilters(filters: DepartmentFilters): void {
    this._filters.set(filters);
    this.loadDepartments({ ...filters, page: 1 });
  }

  clearFilters(): void {
    this._filters.set({});
    this.loadDepartments();
  }

  setSelectedDepartment(department: Department | null): void {
    this._selectedDepartment.set(department);
  }

  reset(): void {
    this._departments.set([]);
    this._departmentTree.set([]);
    this._selectedDepartment.set(null);
    this._loading.set(false);
    this._error.set(null);
    this._filters.set({});
    this._pagination.set({ page: 1, limit: 10, total: 0, totalPages: 0 });
  }
}
