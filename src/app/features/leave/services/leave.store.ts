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
  LeaveAccrual,
  LeaveAccrualRule,
  LeaveEncashment,
} from '../models/leave.model';
import { RbacService } from '../../../core/services/rbac.service';
import { Permission } from '../../../core/models/rbac.models';
import { BaseStore } from '../../../core/stores/base.store';

@Injectable({ providedIn: 'root' })
export class LeaveStore extends BaseStore<LeaveRequest> {
  private readonly api = inject(LeaveApiService);
  private readonly rbacService = inject(RbacService);

  private readonly _leaveBalances = signal<LeaveBalance[]>([]);
  private readonly _policies = signal<LeavePolicy[]>([]);
  private readonly _selectedRequest = signal<LeaveRequest | null>(null);
  private readonly _policyFilters = signal<LeavePolicyFilter>({});
  private readonly _accruals = signal<LeaveAccrual[]>([]);
  private readonly _accrualRules = signal<LeaveAccrualRule[]>([]);
  private readonly _encashments = signal<LeaveEncashment[]>([]);

  readonly leaveBalances = this._leaveBalances.asReadonly();
  readonly policies = this._policies.asReadonly();
  readonly selectedRequest = this._selectedRequest.asReadonly();
  readonly policyFilters = this._policyFilters.asReadonly();
  readonly accruals = this._accruals.asReadonly();
  readonly accrualRules = this._accrualRules.asReadonly();
  readonly encashments = this._encashments.asReadonly();

  override readonly hasData = computed(() => this.items().length > 0);

  readonly canCreate = computed(() => this.rbacService.hasPermission(Permission.CREATE));
  readonly canApprove = computed(() => this.rbacService.hasPermission(Permission.EDIT));
  readonly canViewAll = computed(
    () => this.rbacService.isAdmin() || this.rbacService.isSuperAdmin(),
  );
  readonly canManagePolicies = computed(
    () => this.rbacService.isAdmin() || this.rbacService.isSuperAdmin(),
  );

  loadLeaveRequests(params?: Partial<LeaveFilter & { page: number; limit: number }>): void {
    this.setLoading(true);
    this._error.set(null);

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
          this.updatePaginationResponse(response);
        } else {
          this.setError(response.message || 'Failed to load leave requests');
        }
        this.setLoading(false);
      },
      error: (err) => {
        this.setError(err.error?.message || 'An error occurred');
        this.setLoading(false);
      },
    });
  }

  loadLeaveBalances(employeeId?: number): void {
    this.setLoading(true);
    this.api.getBalances(employeeId).subscribe({
      next: (response) => {
        if (response.success) {
          this._leaveBalances.set(response.data || []);
        }
        this.setLoading(false);
      },
      error: () => {
        this.setLoading(false);
      },
    });
  }

  loadPendingApprovals(): void {
    this.setLoading(true);
    this.api.getPendingApprovals().subscribe({
      next: (response) => {
        if (response.success) {
          this.setItems(response.data || []);
        }
        this.setLoading(false);
      },
      error: () => {
        this.setLoading(false);
      },
    });
  }

  createRequest(data: Partial<LeaveRequest>): Observable<any> {
    this.setLoading(true);
    return this.api.create(data).pipe(
      tap((response) => {
        if (response.success && response.data) {
          this.addItemToList(response.data as LeaveRequest);
        } else {
          this.setError(response.message || 'Failed to create leave request');
        }
      }),
      catchError((err) => {
        this.setError(err.error?.message || 'An error occurred');
        return of({ success: false, message: err.error?.message });
      }),
      finalize(() => this.setLoading(false)),
    );
  }

  approveRequest(id: number, comments?: string): Observable<any> {
    this.setLoading(true);
    return this.api.approve(id, comments).pipe(
      tap((response) => {
        if (response.success) {
          this.updateItemInList({ id, status: LeaveStatus.APPROVED } as LeaveRequest);
        }
      }),
      catchError((err) => of({ success: false, message: err.error?.message })),
      finalize(() => this.setLoading(false)),
    );
  }

  rejectRequest(id: number, comments: string): Observable<any> {
    this.setLoading(true);
    return this.api.reject(id, comments).pipe(
      tap((response) => {
        if (response.success) {
          this.updateItemInList({ id, status: LeaveStatus.REJECTED } as LeaveRequest);
        }
      }),
      catchError((err) => of({ success: false, message: err.error?.message })),
      finalize(() => this.setLoading(false)),
    );
  }

  cancelRequest(id: number): Observable<any> {
    return this.api.cancel(id).pipe(
      tap((response) => {
        if (response.success) {
          this.updateItemInList({ id, status: LeaveStatus.CANCELLED } as LeaveRequest);
        }
      }),
    );
  }

  override setFilters(filters: LeaveFilter): void {
    super.setFilters(filters as Record<string, unknown>);
    this.loadLeaveRequests({ ...filters, page: 1 });
  }

  clearFilters(): void {
    this.resetFilters();
    this.loadLeaveRequests();
  }

  loadPolicies(params?: Partial<LeavePolicyFilter>): void {
    this.setLoading(true);
    this.api.listPolicies(params).subscribe({
      next: (response) => {
        if (response.success) {
          this._policies.set(response.data || []);
        }
        this.setLoading(false);
      },
      error: () => {
        this.setLoading(false);
      },
    });
  }

  createPolicy(data: Partial<LeavePolicy>): Observable<any> {
    this.setLoading(true);
    return this.api.createPolicy(data).pipe(
      tap((response) => {
        if (response.success && response.data) {
          this._policies.update((list) => [...list, response.data]);
        } else {
          this.setError(response.message || 'Failed to create policy');
        }
      }),
      catchError((err) => {
        this.setError(err.error?.message || 'An error occurred');
        return of({ success: false, message: err.error?.message });
      }),
      finalize(() => this.setLoading(false)),
    );
  }

  updatePolicy(id: number, data: Partial<LeavePolicy>): Observable<any> {
    this.setLoading(true);
    return this.api.updatePolicy(id, data).pipe(
      tap((response) => {
        if (response.success) {
          this._policies.update((list) => list.map((p) => (p.id === id ? { ...p, ...data } : p)));
        }
      }),
      catchError((err) => of({ success: false, message: err.error?.message })),
      finalize(() => this.setLoading(false)),
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

  override reset(): void {
    super.reset();
    this._leaveBalances.set([]);
    this._selectedRequest.set(null);
  }

  loadAccruals(params?: {
    employeeId?: number;
    leaveTypeId?: number;
    fromDate?: string;
    toDate?: string;
  }): void {
    this.setLoading(true);
    this.api.getAccruals(params).subscribe({
      next: (response) => {
        if (response.success) {
          this._accruals.set(response.data || []);
        }
        this.setLoading(false);
      },
      error: () => {
        this.setLoading(false);
      },
    });
  }

  loadAccrualRules(params?: { leaveTypeId?: number; isActive?: boolean }): void {
    this.setLoading(true);
    this.api.getAccrualRules(params).subscribe({
      next: (response) => {
        if (response.success) {
          this._accrualRules.set(response.data || []);
        }
        this.setLoading(false);
      },
      error: () => {
        this.setLoading(false);
      },
    });
  }

  loadEncashments(params?: { employeeId?: number; leaveTypeId?: number; status?: string }): void {
    this.setLoading(true);
    this.api.getEncashments(params).subscribe({
      next: (response) => {
        if (response.success) {
          this._encashments.set(response.data || []);
        }
        this.setLoading(false);
      },
      error: () => {
        this.setLoading(false);
      },
    });
  }

  approveEncashment(id: number, remarks?: string): Observable<any> {
    this.setLoading(true);
    return this.api.approveEncashment(id, remarks).pipe(
      tap((response) => {
        if (response.success) {
          this._encashments.update((list) =>
            list.map((e) =>
              e.id === id
                ? {
                    ...e,
                    status: 'approved' as const,
                    processedDate: new Date().toISOString().split('T')[0],
                    remarks: remarks || e.remarks,
                  }
                : e,
            ),
          );
        }
      }),
      catchError((err) => of({ success: false, message: err.error?.message })),
      finalize(() => this.setLoading(false)),
    );
  }

  rejectEncashment(id: number, remarks: string): Observable<any> {
    this.setLoading(true);
    return this.api.rejectEncashment(id, remarks).pipe(
      tap((response) => {
        if (response.success) {
          this._encashments.update((list) =>
            list.map((e) =>
              e.id === id
                ? {
                    ...e,
                    status: 'rejected' as const,
                    processedDate: new Date().toISOString().split('T')[0],
                    remarks,
                  }
                : e,
            ),
          );
        }
      }),
      catchError((err) => of({ success: false, message: err.error?.message })),
      finalize(() => this.setLoading(false)),
    );
  }
}
