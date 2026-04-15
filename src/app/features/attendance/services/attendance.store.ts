import { Injectable, inject, signal, computed } from '@angular/core';
import { Observable, tap, catchError, finalize, of } from 'rxjs';
import { AttendanceApiService } from './attendance-api.service';
import {
  AttendanceRecord,
  AttendanceSummary,
  AttendanceFilter,
  AttendanceStatus,
} from '../models/attendance.model';
import { RbacService } from '../../../core/services/rbac.service';
import { Permission } from '../../../core/models/rbac.models';

@Injectable({ providedIn: 'root' })
export class AttendanceStore {
  private readonly api = inject(AttendanceApiService);
  private readonly rbacService = inject(RbacService);

  private readonly _records = signal<AttendanceRecord[]>([]);
  private readonly _calendarData = signal<Map<string, AttendanceRecord[]>>(new Map());
  private readonly _summary = signal<AttendanceSummary | null>(null);
  private readonly _loading = signal<boolean>(false);
  private readonly _error = signal<string | null>(null);
  private readonly _filters = signal<AttendanceFilter>({});
  private readonly _currentMonth = signal<number>(new Date().getMonth() + 1);
  private readonly _currentYear = signal<number>(new Date().getFullYear());

  readonly records = this._records.asReadonly();
  readonly calendarData = this._calendarData.asReadonly();
  readonly summary = this._summary.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly error = this._error.asReadonly();
  readonly filters = this._filters.asReadonly();
  readonly currentMonth = this._currentMonth.asReadonly();
  readonly currentYear = this._currentYear.asReadonly();

  readonly canMarkAttendance = computed(() => this.rbacService.hasPermission(Permission.CREATE));
  readonly canApprove = computed(() => this.rbacService.hasPermission(Permission.EDIT));
  readonly canViewAll = computed(
    () => this.rbacService.isAdmin() || this.rbacService.isSuperAdmin(),
  );

  loadRecords(params?: Partial<AttendanceFilter & { page: number; limit: number }>): void {
    this._loading.set(true);
    this._error.set(null);

    this.api.list(params as any).subscribe({
      next: (response) => {
        if (response.success) {
          this._records.set(response.data || []);
        } else {
          this._error.set(response.message || 'Failed to load attendance');
        }
        this._loading.set(false);
      },
      error: (err) => {
        this._error.set(err.error?.message || 'An error occurred');
        this._loading.set(false);
      },
    });
  }

  loadCalendar(employeeId?: number, month?: number, year?: number): void {
    this._loading.set(true);
    this._error.set(null);

    const m = month || this._currentMonth();
    const y = year || this._currentYear();

    const fromDate = `${y}-${String(m).padStart(2, '0')}-01`;
    const lastDay = new Date(y, m, 0).getDate();
    const toDate = `${y}-${String(m).padStart(2, '0')}-${lastDay}`;

    this.api.getCalendar({ employeeId, fromDate, toDate }).subscribe({
      next: (response) => {
        if (response.success) {
          const dataMap = new Map<string, AttendanceRecord[]>();
          (response.data || []).forEach((record) => {
            const existing = dataMap.get(record.date) || [];
            existing.push(record);
            dataMap.set(record.date, existing);
          });
          this._calendarData.set(dataMap);
        }
        this._loading.set(false);
      },
      error: (err) => {
        this._error.set(err.error?.message || 'An error occurred');
        this._loading.set(false);
      },
    });
  }

  loadSummary(employeeId: number, month?: number, year?: number): void {
    this._loading.set(true);
    const m = month || this._currentMonth();
    const y = year || this._currentYear();

    this.api.getSummary(employeeId, m, y).subscribe({
      next: (response) => {
        if (response.success) {
          this._summary.set(response.data);
        }
        this._loading.set(false);
      },
      error: () => {
        this._loading.set(false);
      },
    });
  }

  setMonth(month: number, year: number): void {
    this._currentMonth.set(month);
    this._currentYear.set(year);
  }

  markAttendance(data: Partial<AttendanceRecord>): Observable<any> {
    this._loading.set(true);
    return this.api.markAttendance(data).pipe(
      tap((response) => {
        if (!response.success) {
          this._error.set(response.message || 'Failed to mark attendance');
        }
      }),
      catchError((err) => {
        this._error.set(err.error?.message || 'An error occurred');
        return of({ success: false, message: err.error?.message });
      }),
      finalize(() => this._loading.set(false)),
    );
  }

  updateRecord(id: number, data: Partial<AttendanceRecord>): Observable<any> {
    this._loading.set(true);
    return this.api.update(id, data).pipe(
      tap((response) => {
        if (response.success) {
          this._records.update((list) => list.map((r) => (r.id === id ? { ...r, ...data } : r)));
        }
      }),
      catchError((err) => of({ success: false, message: err.error?.message })),
      finalize(() => this._loading.set(false)),
    );
  }

  reset(): void {
    this._records.set([]);
    this._calendarData.set(new Map());
    this._summary.set(null);
    this._loading.set(false);
    this._error.set(null);
    this._filters.set({});
  }
}
