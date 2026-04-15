import { Injectable, inject, signal, computed } from '@angular/core';
import { Observable, tap, catchError, finalize, of } from 'rxjs';
import { LeaveApiService } from './leave-api.service';
import {
  LeaveRequest,
  LeaveBalance,
  LeaveFilter,
  LeaveType,
  LeaveStatus,
  LeavePolicy,
  LeavePolicyFilter,
} from '../models/leave.model';
import { RbacService } from '../../../core/services/rbac.service';
import { Permission } from '../../../core/models/rbac.models';

@Injectable({ providedIn: 'root' })
export class LeaveStore {
  private readonly api = inject(LeaveApiService);
  private readonly rbacService = inject(RbacService);

  private readonly _leaveRequests = signal<LeaveRequest[]>([]);
  private readonly _leaveBalances = signal<LeaveBalance[]>([]);
  private readonly _policies = signal<LeavePolicy[]>([]);
  private readonly _selectedRequest = signal<LeaveRequest | null>(null);
  private readonly _loading = signal<boolean>(false);
  private readonly _error = signal<string | null>(null);
  private readonly _filters = signal<LeaveFilter>({});
  private readonly _policyFilters = signal<LeavePolicyFilter>({});
  private readonly _pagination = signal({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  readonly leaveRequests = this._leaveRequests.asReadonly();
  readonly leaveBalances = this._leaveBalances.asReadonly();
  readonly policies = this._policies.asReadonly();
  readonly selectedRequest = this._selectedRequest.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly error = this._error.asReadonly();
  readonly filters = this._filters.asReadonly();
  readonly pagination = this._pagination.asReadonly();

  readonly page = computed(() => this._pagination().page);
  readonly limit = computed(() => this._pagination().limit);
  readonly total = computed(() => this._pagination().total);
  readonly hasData = computed(() => this._leaveRequests().length > 0);

  readonly canCreate = computed(() => this.rbacService.hasPermission(Permission.CREATE));
  readonly canApprove = computed(() => this.rbacService.hasPermission(Permission.EDIT));
  readonly canViewAll = computed(
    () => this.rbacService.isAdmin() || this.rbacService.isSuperAdmin(),
  );
  readonly canManagePolicies = computed(
    () => this.rbacService.isAdmin() || this.rbacService.isSuperAdmin(),
  );

  loadLeaveRequests(params?: Partial<LeaveFilter & { page: number; limit: number }>): void {
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
          this._leaveRequests.set(response.data || []);
          if (response.pagination) {
            this._pagination.set({
              page: response.pagination.page,
              limit: response.pagination.limit,
              total: response.pagination.total,
              totalPages: response.pagination.totalPages,
            });
          }
        } else {
          this._error.set(response.message || 'Failed to load leave requests');
        }
        this._loading.set(false);
      },
      error: (err) => {
        this._error.set(err.error?.message || 'An error occurred');
        this._loading.set(false);
      },
    });
  }

  loadLeaveBalances(employeeId?: number): void {
    this._loading.set(true);
    this.api.getBalances(employeeId).subscribe({
      next: (response) => {
        if (response.success) {
          this._leaveBalances.set(response.data || []);
        }
        this._loading.set(false);
      },
      error: () => {
        this._loading.set(false);
      },
    });
  }

  loadPendingApprovals(): void {
    this._loading.set(true);
    this.api.getPendingApprovals().subscribe({
      next: (response) => {
        if (response.success) {
          this._leaveRequests.set(response.data || []);
        }
        this._loading.set(false);
      },
      error: () => {
        this._loading.set(false);
      },
    });
  }

  createRequest(data: Partial<LeaveRequest>): Observable<any> {
    this._loading.set(true);
    return this.api.create(data).pipe(
      tap((response) => {
        if (!response.success) {
          this._error.set(response.message || 'Failed to create leave request');
        }
      }),
      catchError((err) => {
        this._error.set(err.error?.message || 'An error occurred');
        return of({ success: false, message: err.error?.message });
      }),
      finalize(() => this._loading.set(false)),
    );
  }

  approveRequest(id: number, comments?: string): Observable<any> {
    this._loading.set(true);
    return this.api.approve(id, comments).pipe(
      tap((response) => {
        if (response.success) {
          this._leaveRequests.update((list) =>
            list.map((r) => (r.id === id ? { ...r, status: LeaveStatus.APPROVED } : r)),
          );
        }
      }),
      catchError((err) => of({ success: false, message: err.error?.message })),
      finalize(() => this._loading.set(false)),
    );
  }

  rejectRequest(id: number, comments: string): Observable<any> {
    this._loading.set(true);
    return this.api.reject(id, comments).pipe(
      tap((response) => {
        if (response.success) {
          this._leaveRequests.update((list) =>
            list.map((r) => (r.id === id ? { ...r, status: LeaveStatus.REJECTED } : r)),
          );
        }
      }),
      catchError((err) => of({ success: false, message: err.error?.message })),
      finalize(() => this._loading.set(false)),
    );
  }

  cancelRequest(id: number): Observable<any> {
    return this.api.cancel(id).pipe(
      tap((response) => {
        if (response.success) {
          this._leaveRequests.update((list) =>
            list.map((r) => (r.id === id ? { ...r, status: LeaveStatus.CANCELLED } : r)),
          );
        }
      }),
    );
  }

  setFilters(filters: LeaveFilter): void {
    this._filters.set(filters);
    this.loadLeaveRequests({ ...filters, page: 1 });
  }

  clearFilters(): void {
    this._filters.set({});
    this.loadLeaveRequests();
  }

  loadPolicies(params?: Partial<LeavePolicyFilter>): void {
    this._loading.set(true);
    this.api.listPolicies(params).subscribe({
      next: (response) => {
        if (response.success) {
          this._policies.set(response.data || []);
        }
        this._loading.set(false);
      },
      error: () => {
        this._loading.set(false);
      },
    });
  }

  createPolicy(data: Partial<LeavePolicy>): Observable<any> {
    this._loading.set(true);
    return this.api.createPolicy(data).pipe(
      tap((response) => {
        if (response.success) {
          this._policies.update((list) => [...list, response.data]);
        } else {
          this._error.set(response.message || 'Failed to create policy');
        }
      }),
      catchError((err) => {
        this._error.set(err.error?.message || 'An error occurred');
        return of({ success: false, message: err.error?.message });
      }),
      finalize(() => this._loading.set(false)),
    );
  }

  updatePolicy(id: number, data: Partial<LeavePolicy>): Observable<any> {
    this._loading.set(true);
    return this.api.updatePolicy(id, data).pipe(
      tap((response) => {
        if (response.success) {
          this._policies.update((list) => list.map((p) => (p.id === id ? { ...p, ...data } : p)));
        }
      }),
      catchError((err) => of({ success: false, message: err.error?.message })),
      finalize(() => this._loading.set(false)),
    );
  }

  deletePolicy(id: number): Observable<any> {
    return this.api.deletePolicy(id).pipe(
      tap((response) => {
        if (response.success) {
          this._policies.update((list) => list.filter((p) => p.id !== id));
        }
      }),
    );
  }

  reset(): void {
    this._leaveRequests.set([]);
    this._leaveBalances.set([]);
    this._selectedRequest.set(null);
    this._loading.set(false);
    this._error.set(null);
    this._filters.set({});
    this._pagination.set({ page: 1, limit: 10, total: 0, totalPages: 0 });
  }
}
