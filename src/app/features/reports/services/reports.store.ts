import { Injectable, inject, signal, computed } from '@angular/core';
import { Observable, tap, catchError, finalize, of } from 'rxjs';
import { ReportsApiService } from './reports-api.service';
import {
  Report,
  ReportFilter,
  ReportType,
  DashboardWidget,
  MetricData,
  ChartData,
  AttendanceSummaryReport,
  LeaveSummaryReport,
  PayrollSummaryReport,
  EmployeeReport,
} from '../models/report.model';
import { RbacService } from '../../../core/services/rbac.service';
import { Permission } from '../../../core/models/rbac.models';

@Injectable({ providedIn: 'root' })
export class ReportsStore {
  private readonly api = inject(ReportsApiService);
  private readonly rbacService = inject(RbacService);

  private readonly _reports = signal<Report[]>([]);
  private readonly _widgets = signal<DashboardWidget[]>([]);
  private readonly _attendanceSummary = signal<AttendanceSummaryReport | null>(null);
  private readonly _leaveSummary = signal<LeaveSummaryReport | null>(null);
  private readonly _payrollSummary = signal<PayrollSummaryReport | null>(null);
  private readonly _employeeReport = signal<EmployeeReport | null>(null);
  private readonly _loading = signal<boolean>(false);
  private readonly _error = signal<string | null>(null);

  readonly reports = this._reports.asReadonly();
  readonly widgets = this._widgets.asReadonly();
  readonly attendanceSummary = this._attendanceSummary.asReadonly();
  readonly leaveSummary = this._leaveSummary.asReadonly();
  readonly payrollSummary = this._payrollSummary.asReadonly();
  readonly employeeReport = this._employeeReport.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly error = this._error.asReadonly();

  readonly canView = computed(() => this.rbacService.hasPermission(Permission.READ));
  readonly canExport = computed(() => this.rbacService.hasPermission(Permission.CREATE));

  loadReports(params?: Partial<{ type: ReportType }>): void {
    this._loading.set(true);
    this.api.listReports(params).subscribe({
      next: (response) => {
        if (response.success) {
          this._reports.set(response.data || []);
        }
        this._loading.set(false);
      },
      error: () => this._loading.set(false),
    });
  }

  loadWidgets(): void {
    this.api.getDashboardWidgets().subscribe({
      next: (response) => {
        if (response.success) {
          this._widgets.set(response.data || []);
        }
      },
    });
  }

  loadAttendanceSummary(fromDate?: string, toDate?: string, departmentId?: number): void {
    this._loading.set(true);
    this.api.getAttendanceSummary({ fromDate, toDate, departmentId }).subscribe({
      next: (response) => {
        if (response.success) {
          this._attendanceSummary.set(response.data);
        }
        this._loading.set(false);
      },
      error: () => this._loading.set(false),
    });
  }

  loadLeaveSummary(fromDate?: string, toDate?: string, departmentId?: number): void {
    this._loading.set(true);
    this.api.getLeaveSummary({ fromDate, toDate, departmentId }).subscribe({
      next: (response) => {
        if (response.success) {
          this._leaveSummary.set(response.data);
        }
        this._loading.set(false);
      },
      error: () => this._loading.set(false),
    });
  }

  loadPayrollSummary(month?: number, year?: number): void {
    this._loading.set(true);
    this.api.getPayrollSummary({ month, year }).subscribe({
      next: (response) => {
        if (response.success) {
          this._payrollSummary.set(response.data);
        }
        this._loading.set(false);
      },
      error: () => this._loading.set(false),
    });
  }

  loadEmployeeReport(): void {
    this._loading.set(true);
    this.api.getEmployeeReport({}).subscribe({
      next: (response) => {
        if (response.success) {
          this._employeeReport.set(response.data);
        }
        this._loading.set(false);
      },
      error: () => this._loading.set(false),
    });
  }

  generateReport(reportId: number, filters: ReportFilter): void {
    this._loading.set(true);
    this.api.generateReport(reportId, filters).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `report-${reportId}.${filters.format || 'pdf'}`;
        a.click();
        window.URL.revokeObjectURL(url);
        this._loading.set(false);
      },
      error: () => this._loading.set(false),
    });
  }

  reset(): void {
    this._reports.set([]);
    this._widgets.set([]);
    this._attendanceSummary.set(null);
    this._leaveSummary.set(null);
    this._payrollSummary.set(null);
    this._employeeReport.set(null);
    this._loading.set(false);
    this._error.set(null);
  }
}
