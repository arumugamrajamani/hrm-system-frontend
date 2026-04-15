import { Injectable, inject, signal, computed } from '@angular/core';
import { Observable, tap, catchError, finalize, of } from 'rxjs';
import { TimesheetApiService } from './timesheet-api.service';
import { Timesheet, TimesheetFilter, TimesheetStatus } from '../models/timesheet.model';
import { RbacService } from '../../../core/services/rbac.service';
import { Permission } from '../../../core/models/rbac.models';

@Injectable({ providedIn: 'root' })
export class TimesheetStore {
  private readonly api = inject(TimesheetApiService);
  private readonly rbacService = inject(RbacService);

  private readonly _timesheets = signal<Timesheet[]>([]);
  private readonly _currentTimesheet = signal<Timesheet | null>(null);
  private readonly _loading = signal<boolean>(false);
  private readonly _error = signal<string | null>(null);
  private readonly _filters = signal<TimesheetFilter>({});

  readonly timesheets = this._timesheets.asReadonly();
  readonly currentTimesheet = this._currentTimesheet.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly error = this._error.asReadonly();
  readonly filters = this._filters.asReadonly();

  readonly canSubmit = computed(() => this.rbacService.hasPermission(Permission.CREATE));
  readonly canApprove = computed(() => this.rbacService.hasPermission(Permission.EDIT));
  readonly canViewAll = computed(
    () => this.rbacService.isAdmin() || this.rbacService.isSuperAdmin(),
  );

  loadTimesheets(params?: Partial<TimesheetFilter>): void {
    this._loading.set(true);
    this._error.set(null);

    this.api.list({ ...this._filters(), ...params }).subscribe({
      next: (response) => {
        if (response.success) {
          this._timesheets.set(response.data || []);
        } else {
          this._error.set(response.message || 'Failed to load timesheets');
        }
        this._loading.set(false);
      },
      error: (err) => {
        this._error.set(err.error?.message || 'An error occurred');
        this._loading.set(false);
      },
    });
  }

  loadCurrentWeek(employeeId?: number): void {
    this._loading.set(true);
    this.api.getCurrentWeek(employeeId).subscribe({
      next: (response) => {
        if (response.success) {
          this._currentTimesheet.set(response.data);
        }
        this._loading.set(false);
      },
      error: () => {
        this._loading.set(false);
      },
    });
  }

  loadByWeek(weekStartDate: string, employeeId?: number): void {
    this._loading.set(true);
    this.api.getByWeek(weekStartDate, employeeId).subscribe({
      next: (response) => {
        if (response.success) {
          this._currentTimesheet.set(response.data);
        }
        this._loading.set(false);
      },
      error: () => {
        this._loading.set(false);
      },
    });
  }

  saveTimesheet(data: any): Observable<any> {
    this._loading.set(true);
    return this.api.save(data).pipe(
      tap((response) => {
        if (!response.success) {
          this._error.set(response.message || 'Failed to save timesheet');
        }
      }),
      catchError((err) => {
        this._error.set(err.error?.message || 'An error occurred');
        return of({ success: false, message: err.error?.message });
      }),
      finalize(() => this._loading.set(false)),
    );
  }

  submitTimesheet(id: number): Observable<any> {
    this._loading.set(true);
    return this.api.submit(id).pipe(
      tap((response) => {
        if (response.success) {
          this._timesheets.update((list) =>
            list.map((t) => (t.id === id ? { ...t, status: TimesheetStatus.SUBMITTED } : t)),
          );
        }
      }),
      catchError((err) => of({ success: false, message: err.error?.message })),
      finalize(() => this._loading.set(false)),
    );
  }

  approveTimesheet(id: number, comments?: string): Observable<any> {
    this._loading.set(true);
    return this.api.approve(id, comments).pipe(
      tap((response) => {
        if (response.success) {
          this._timesheets.update((list) =>
            list.map((t) => (t.id === id ? { ...t, status: TimesheetStatus.APPROVED } : t)),
          );
        }
      }),
      catchError((err) => of({ success: false, message: err.error?.message })),
      finalize(() => this._loading.set(false)),
    );
  }

  rejectTimesheet(id: number, comments: string): Observable<any> {
    this._loading.set(true);
    return this.api.reject(id, comments).pipe(
      tap((response) => {
        if (response.success) {
          this._timesheets.update((list) =>
            list.map((t) => (t.id === id ? { ...t, status: TimesheetStatus.REJECTED } : t)),
          );
        }
      }),
      catchError((err) => of({ success: false, message: err.error?.message })),
      finalize(() => this._loading.set(false)),
    );
  }

  reset(): void {
    this._timesheets.set([]);
    this._currentTimesheet.set(null);
    this._loading.set(false);
    this._error.set(null);
    this._filters.set({});
  }
}
