import { Injectable, inject, signal, computed } from '@angular/core';
import { Observable, tap, catchError, finalize, of } from 'rxjs';
import { PayrollApiService } from './payroll-api.service';
import {
  PayrollRun,
  PayrollRecord,
  PayrollFilter,
  SalaryComponent,
  PayrollStatus,
} from '../models/payroll.model';
import { RbacService } from '../../../core/services/rbac.service';
import { Permission } from '../../../core/models/rbac.models';

@Injectable({ providedIn: 'root' })
export class PayrollStore {
  private readonly api = inject(PayrollApiService);
  private readonly rbacService = inject(RbacService);

  private readonly _payrollRuns = signal<PayrollRun[]>([]);
  private readonly _currentRun = signal<PayrollRun | null>(null);
  private readonly _runRecords = signal<PayrollRecord[]>([]);
  private readonly _components = signal<SalaryComponent[]>([]);
  private readonly _loading = signal<boolean>(false);
  private readonly _error = signal<string | null>(null);
  private readonly _filters = signal<PayrollFilter>({});

  readonly payrollRuns = this._payrollRuns.asReadonly();
  readonly currentRun = this._currentRun.asReadonly();
  readonly runRecords = this._runRecords.asReadonly();
  readonly components = this._components.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly error = this._error.asReadonly();
  readonly filters = this._filters.asReadonly();

  readonly canCreateRun = computed(() => this.rbacService.hasPermission(Permission.CREATE));
  readonly canApprove = computed(() => this.rbacService.hasPermission(Permission.EDIT));
  readonly canViewAll = computed(
    () => this.rbacService.isAdmin() || this.rbacService.isSuperAdmin(),
  );

  loadPayrollRuns(params?: Partial<PayrollFilter>): void {
    this._loading.set(true);
    this._error.set(null);
    this.api.listRuns(params).subscribe({
      next: (response) => {
        if (response.success) {
          this._payrollRuns.set(response.data || []);
        } else {
          this._error.set(response.message || 'Failed to load payroll runs');
        }
        this._loading.set(false);
      },
      error: (err) => {
        this._error.set(err.error?.message || 'An error occurred');
        this._loading.set(false);
      },
    });
  }

  loadRunDetails(id: number): void {
    this._loading.set(true);
    this.api.getRunById(id).subscribe({
      next: (response) => {
        if (response.success) {
          this._currentRun.set(response.data);
        }
        this._loading.set(false);
      },
      error: () => this._loading.set(false),
    });
  }

  loadRunRecords(runId: number): void {
    this._loading.set(true);
    this.api.getRunRecords(runId).subscribe({
      next: (response) => {
        if (response.success) {
          this._runRecords.set(response.data || []);
        }
        this._loading.set(false);
      },
      error: () => this._loading.set(false),
    });
  }

  createRun(month: number, year: number): Observable<any> {
    this._loading.set(true);
    return this.api.createRun(month, year).pipe(
      tap((response) => {
        if (response.success) {
          this._payrollRuns.update((list) => [response.data, ...list]);
        } else {
          this._error.set(response.message || 'Failed to create payroll run');
        }
      }),
      catchError((err) => {
        this._error.set(err.error?.message || 'An error occurred');
        return of({ success: false, message: err.error?.message });
      }),
      finalize(() => this._loading.set(false)),
    );
  }

  processRun(id: number): Observable<any> {
    this._loading.set(true);
    return this.api.processRun(id).pipe(
      tap((response) => {
        if (response.success) {
          this._currentRun.update((run) =>
            run?.id === id ? { ...run, status: PayrollStatus.PROCESSING } : run,
          );
        }
      }),
      catchError((err) => of({ success: false, message: err.error?.message })),
      finalize(() => this._loading.set(false)),
    );
  }

  approveRun(id: number): Observable<any> {
    this._loading.set(true);
    return this.api.approveRun(id).pipe(
      tap((response) => {
        if (response.success) {
          this._payrollRuns.update((list) =>
            list.map((r) => (r.id === id ? { ...r, status: PayrollStatus.APPROVED } : r)),
          );
        }
      }),
      catchError((err) => of({ success: false, message: err.error?.message })),
      finalize(() => this._loading.set(false)),
    );
  }

  markAsPaid(id: number): Observable<any> {
    this._loading.set(true);
    return this.api.markAsPaid(id).pipe(
      tap((response) => {
        if (response.success) {
          this._payrollRuns.update((list) =>
            list.map((r) => (r.id === id ? { ...r, status: PayrollStatus.PAID } : r)),
          );
        }
      }),
      catchError((err) => of({ success: false, message: err.error?.message })),
      finalize(() => this._loading.set(false)),
    );
  }

  loadComponents(): void {
    this.api.listComponents().subscribe({
      next: (response) => {
        if (response.success) {
          this._components.set(response.data || []);
        }
      },
    });
  }

  createComponent(data: Partial<SalaryComponent>): Observable<any> {
    return this.api.createComponent(data).pipe(
      tap((response) => {
        if (response.success) {
          this._components.update((list) => [...list, response.data]);
        }
      }),
    );
  }

  updateComponent(id: number, data: Partial<SalaryComponent>): Observable<any> {
    return this.api.updateComponent(id, data).pipe(
      tap((response) => {
        if (response.success) {
          this._components.update((list) => list.map((c) => (c.id === id ? { ...c, ...data } : c)));
        }
      }),
    );
  }

  deleteComponent(id: number): Observable<any> {
    return this.api.deleteComponent(id).pipe(
      tap((response) => {
        if (response.success) {
          this._components.update((list) => list.filter((c) => c.id !== id));
        }
      }),
    );
  }

  generateSlip(runId: number, employeeId: number): void {
    this.api.generateSlip(runId, employeeId).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `salary-slip-${runId}-${employeeId}.pdf`;
        a.click();
        window.URL.revokeObjectURL(url);
      },
    });
  }

  reset(): void {
    this._payrollRuns.set([]);
    this._currentRun.set(null);
    this._runRecords.set([]);
    this._components.set([]);
    this._loading.set(false);
    this._error.set(null);
    this._filters.set({});
  }
}
