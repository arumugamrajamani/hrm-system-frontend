import { Injectable, inject, computed } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { EmployeeApiService } from './employee-api.service';
import { Employee, EmployeeFilters, EmployeeListItem } from '../models/employee.model';
import { RbacService } from '../../../core/services/rbac.service';
import { Permission } from '../../../core/models/rbac.models';
import { BaseStore } from '../../../core/stores/base.store';

@Injectable({ providedIn: 'root' })
export class EmployeeStore extends BaseStore<EmployeeListItem> {
  private readonly api = inject(EmployeeApiService);
  private readonly rbacService = inject(RbacService);

  readonly canViewSalary = computed(() => this.rbacService.hasPermission(Permission.MANAGE));
  readonly canEdit = computed(() => this.rbacService.hasPermission(Permission.EDIT));
  readonly canDelete = computed(() => this.rbacService.hasPermission(Permission.DELETE));
  readonly canCreate = computed(() => this.rbacService.hasPermission(Permission.CREATE));

  loadEmployees(params?: Partial<EmployeeFilters & { page: number; limit: number }>): void {
    this.setLoading(true);

    const queryParams = {
      ...this.filters(),
      page: params?.page || this.page(),
      limit: params?.limit || this.limit(),
      ...params,
    };

    this.api.list(queryParams).subscribe({
      next: (response) => {
        if (response.success) {
          this.setItems(response.data || []);
          if (response.pagination) {
            this.setPagination({
              page: response.pagination.page,
              limit: response.pagination.limit,
              total: response.pagination.total,
              totalPages: response.pagination.totalPages,
            });
          }
        } else {
          this.setError(response.message || 'Failed to load employees');
        }
        this.setLoading(false);
      },
      error: (err) => {
        this.setError(err.error?.message || 'An error occurred');
        this.setLoading(false);
      },
    });
  }

  loadEmployeeById(id: number): void {
    this.setLoading(true);

    this.api.getById(id).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.setSelected(response.data as any);
        } else {
          this.setError(response.message || 'Failed to load employee');
        }
        this.setLoading(false);
      },
      error: (err) => {
        this.setError(err.error?.message || 'An error occurred');
        this.setLoading(false);
      },
    });
  }

  createEmployee(data: Partial<Employee>): Observable<any> {
    this.setLoading(true);
    return this.api.create(data).pipe(
      tap((response) => {
        if (response.success && response.data) {
          this.addItemToList(response.data as any);
        } else {
          this.setError(response.message || 'Failed to create employee');
        }
        this.setLoading(false);
      }),
    );
  }

  updateEmployee(id: number, data: Partial<Employee>): Observable<any> {
    this.setLoading(true);
    return this.api.update(id, data).pipe(
      tap((response) => {
        if (response.success && response.data) {
          this.updateItemInList({ ...response.data, id } as EmployeeListItem);
        } else {
          this.setError(response.message || 'Failed to update employee');
        }
        this.setLoading(false);
      }),
    );
  }

  deleteEmployee(id: number): Observable<any> {
    this.setLoading(true);
    return this.api.delete(id).pipe(
      tap((response) => {
        if (response.success) {
          this.removeItemFromList(id);
        } else {
          this.setError(response.message || 'Failed to delete employee');
        }
        this.setLoading(false);
      }),
    );
  }

  updateStatus(id: number, status: 'active' | 'inactive'): Observable<any> {
    return this.api.updateStatus(id, status).pipe(
      tap((response) => {
        if (response.success) {
          const item = this.getItemById(id);
          if (item) {
            this.updateItemInList({ ...item, status } as EmployeeListItem);
          }
        }
      }),
    );
  }

  setEmployeeFilters(filters: EmployeeFilters): void {
    this.setFilters(filters as Record<string, unknown>);
    this.setPage(1);
    this.loadEmployees();
  }

  clearFilters(): void {
    this.resetFilters();
    this.loadEmployees();
  }

  setSelectedEmployee(employee: Employee | null): void {
    this.setSelected(employee as any);
  }

  clearSelectedEmployee(): void {
    this.setSelected(null);
  }

  override reset(): void {
    super.reset();
  }

  maskSalary(salary: number | undefined): string {
    if (!salary) return '---';
    if (!this.canViewSalary()) {
      return '*****';
    }
    return salary.toLocaleString();
  }

  canViewField(field: 'salary' | 'bankDetails' | 'taxDetails'): boolean {
    return this.rbacService.hasPermission(Permission.MANAGE);
  }

  getEmployeeById(id: number | string): EmployeeListItem | undefined {
    return this.getItemById(id);
  }

  getEmployees(): EmployeeListItem[] {
    return this.items();
  }

  searchEmployees(query: string): void {
    this.setEmployeeFilters({ search: query } as EmployeeFilters);
    this.loadEmployees();
  }

  filterByStatus(status: 'active' | 'inactive'): void {
    this.setEmployeeFilters({ status } as EmployeeFilters);
    this.loadEmployees();
  }

  filterByEmploymentStatus(employmentStatus: string): void {
    this.setEmployeeFilters({ employmentStatus: employmentStatus as any } as EmployeeFilters);
    this.loadEmployees();
  }

  changePage(page: number): void {
    this.setPage(page);
    this.loadEmployees();
  }

  changePageSize(limit: number): void {
    this.setPageSize(limit);
    this.loadEmployees();
  }
}
