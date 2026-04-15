import { Injectable, inject, signal, computed } from '@angular/core';
import { Observable, tap, catchError, finalize, of } from 'rxjs';
import { EmployeeApiService } from './employee-api.service';
import { Employee, EmployeeFilters, EmployeeListItem } from '../models/employee.model';
import { RbacService } from '../../../core/services/rbac.service';
import { Permission } from '../../../core/models/rbac.models';

@Injectable({ providedIn: 'root' })
export class EmployeeStore {
  private readonly api = inject(EmployeeApiService);
  private readonly rbacService = inject(RbacService);

  private readonly _employees = signal<EmployeeListItem[]>([]);
  private readonly _selectedEmployee = signal<Employee | null>(null);
  private readonly _loading = signal<boolean>(false);
  private readonly _error = signal<string | null>(null);
  private readonly _filters = signal<EmployeeFilters>({});
  private readonly _pagination = signal({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  readonly employees = this._employees.asReadonly();
  readonly selectedEmployee = this._selectedEmployee.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly error = this._error.asReadonly();
  readonly filters = this._filters.asReadonly();
  readonly pagination = this._pagination.asReadonly();

  readonly page = computed(() => this._pagination().page);
  readonly limit = computed(() => this._pagination().limit);
  readonly total = computed(() => this._pagination().total);
  readonly hasData = computed(() => this._employees().length > 0);

  readonly canViewSalary = computed(() => this.rbacService.hasPermission('manage'));
  readonly canEdit = computed(() => this.rbacService.hasPermission(Permission.EDIT));
  readonly canDelete = computed(() => this.rbacService.hasPermission(Permission.DELETE));
  readonly canCreate = computed(() => this.rbacService.hasPermission(Permission.CREATE));

  loadEmployees(params?: Partial<EmployeeFilters & { page: number; limit: number }>): void {
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
        if (response.success) {
          this._employees.set(response.data || []);
          if (response.pagination) {
            this._pagination.set({
              page: response.pagination.page,
              limit: response.pagination.limit,
              total: response.pagination.total,
              totalPages: response.pagination.totalPages,
            });
          }
        } else {
          this._error.set(response.message || 'Failed to load employees');
        }
        this._loading.set(false);
      },
      error: (err) => {
        this._error.set(err.error?.message || 'An error occurred');
        this._loading.set(false);
      },
    });
  }

  loadEmployeeById(id: number): void {
    this._loading.set(true);
    this._error.set(null);

    this.api.getById(id).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this._selectedEmployee.set(response.data);
        } else {
          this._error.set(response.message || 'Failed to load employee');
        }
        this._loading.set(false);
      },
      error: (err) => {
        this._error.set(err.error?.message || 'An error occurred');
        this._loading.set(false);
      },
    });
  }

  createEmployee(data: Partial<Employee>): Observable<any> {
    this._loading.set(true);
    return this.api.create(data).pipe(
      tap((response) => {
        if (!response.success) {
          this._error.set(response.message || 'Failed to create employee');
        }
      }),
      catchError((err) => {
        this._error.set(err.error?.message || 'An error occurred');
        return of({ success: false, message: err.error?.message });
      }),
      finalize(() => this._loading.set(false)),
    );
  }

  updateEmployee(id: number, data: Partial<Employee>): Observable<any> {
    this._loading.set(true);
    return this.api.update(id, data).pipe(
      tap((response) => {
        if (!response.success) {
          this._error.set(response.message || 'Failed to update employee');
        }
      }),
      catchError((err) => {
        this._error.set(err.error?.message || 'An error occurred');
        return of({ success: false, message: err.error?.message });
      }),
      finalize(() => this._loading.set(false)),
    );
  }

  deleteEmployee(id: number): Observable<any> {
    this._loading.set(true);
    return this.api.delete(id).pipe(
      tap((response) => {
        if (response.success) {
          this._employees.update((list) => list.filter((e) => e.id !== id));
        } else {
          this._error.set(response.message || 'Failed to delete employee');
        }
      }),
      catchError((err) => {
        this._error.set(err.error?.message || 'An error occurred');
        return of({ success: false, message: err.error?.message });
      }),
      finalize(() => this._loading.set(false)),
    );
  }

  updateStatus(id: number, status: 'active' | 'inactive'): Observable<any> {
    return this.api.updateStatus(id, status).pipe(
      tap((response) => {
        if (response.success) {
          this._employees.update((list) => list.map((e) => (e.id === id ? { ...e, status } : e)));
        }
      }),
    );
  }

  setFilters(filters: EmployeeFilters): void {
    this._filters.set(filters);
    this.loadEmployees({ ...filters, page: 1 });
  }

  clearFilters(): void {
    this._filters.set({});
    this.loadEmployees();
  }

  setSelectedEmployee(employee: Employee | null): void {
    this._selectedEmployee.set(employee);
  }

  clearSelectedEmployee(): void {
    this._selectedEmployee.set(null);
  }

  reset(): void {
    this._employees.set([]);
    this._selectedEmployee.set(null);
    this._loading.set(false);
    this._error.set(null);
    this._filters.set({});
    this._pagination.set({ page: 1, limit: 10, total: 0, totalPages: 0 });
  }

  maskSalary(salary: number | undefined): string {
    if (!salary) return '---';
    if (!this.canViewSalary()) {
      return '*****';
    }
    return salary.toLocaleString();
  }

  canViewField(field: 'salary' | 'bankDetails' | 'taxDetails'): boolean {
    return this.rbacService.hasPermission('manage');
  }
}
