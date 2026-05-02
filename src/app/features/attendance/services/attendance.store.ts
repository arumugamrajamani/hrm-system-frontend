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
import { BaseStore } from '../../../core/stores/base.store';

@Injectable({ providedIn: 'root' })
export class AttendanceStore extends BaseStore<AttendanceRecord> {
  private readonly api = inject(AttendanceApiService);
  private readonly rbacService = inject(RbacService);

  private readonly _calendarData = signal<Map<string, AttendanceRecord[]>>(new Map());
  private readonly _summary = signal<AttendanceSummary | null>(null);
  private readonly _currentMonth = signal<number>(new Date().getMonth() + 1);
  private readonly _currentYear = signal<number>(new Date().getFullYear());

  readonly calendarData = this._calendarData.asReadonly();
  readonly summary = this._summary.asReadonly();
  readonly currentMonth = this._currentMonth.asReadonly();
  readonly currentYear = this._currentYear.asReadonly();

  readonly canMarkAttendance = computed(() => this.rbacService.hasPermission(Permission.CREATE));
  readonly canApprove = computed(() => this.rbacService.hasPermission(Permission.EDIT));
  readonly canViewAll = computed(
    () => this.rbacService.isAdmin() || this.rbacService.isSuperAdmin(),
  );

  loadRecords(params?: Partial<AttendanceFilter & { page: number; limit: number }>): void {
    this.setLoading(true);
    this._error.set(null);

    this.api.list(params as any).subscribe({
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
          this.setError(response.message || 'Failed to load attendance');
        }
        this.setLoading(false);
      },
      error: (err) => {
        this.setError(err.error?.message || 'An error occurred');
        this.setLoading(false);
      },
    });
  }

  loadCalendar(employeeId?: number, month?: number, year?: number): void {
    this.setLoading(true);
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
          (response.data || []).forEach((record: AttendanceRecord) => {
            const existing = dataMap.get(record.date) || [];
            existing.push(record);
            dataMap.set(record.date, existing);
          });
          this._calendarData.set(dataMap);
        }
        this.setLoading(false);
      },
      error: (err) => {
        this._error.set(err.error?.message || 'An error occurred');
        this.setLoading(false);
      },
    });
  }

  loadSummary(employeeId: number, month?: number, year?: number): void {
    this.setLoading(true);
    const m = month || this._currentMonth();
    const y = year || this._currentYear();

    this.api.getSummary(employeeId, m, y).subscribe({
      next: (response) => {
        if (response.success) {
          this._summary.set(response.data);
        }
        this.setLoading(false);
      },
      error: () => {
        this.setLoading(false);
      },
    });
  }

  setMonth(month: number, year: number): void {
    this._currentMonth.set(month);
    this._currentYear.set(year);
  }

  markAttendance(data: Partial<AttendanceRecord>): Observable<any> {
    this.setLoading(true);
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
      finalize(() => this.setLoading(false)),
    );
  }

  updateRecord(id: number, data: Partial<AttendanceRecord>): Observable<any> {
    this.setLoading(true);
    return this.api.update(id, data).pipe(
      tap((response) => {
        if (response.success) {
          this.updateItemInList({ ...data, id } as AttendanceRecord);
        }
      }),
      catchError((err) => of({ success: false, message: err.error?.message })),
      finalize(() => this.setLoading(false)),
    );
  }

  override reset(): void {
    super.reset();
    this._calendarData.set(new Map());
    this._summary.set(null);
  }
}
