import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
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
import { ListResponse, DetailResponse } from '../../../shared/models/api-response.model';

@Injectable({ providedIn: 'root' })
export class ReportsApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/reports`;

  listReports(params?: Record<string, unknown>): Observable<ListResponse<Report>> {
    let httpParams = new HttpParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          httpParams = httpParams.set(key, String(value));
        }
      });
    }
    return this.http.get<ListResponse<Report>>(this.baseUrl, { params: httpParams });
  }

  getReport(id: number): Observable<DetailResponse<Report>> {
    return this.http.get<DetailResponse<Report>>(`${this.baseUrl}/${id}`);
  }

  generateReport(reportId: number, filters: ReportFilter): Observable<any> {
    return this.http.post(`${this.baseUrl}/${reportId}/generate`, filters, {
      responseType: 'blob',
    });
  }

  getDashboardWidgets(): Observable<ListResponse<DashboardWidget>> {
    return this.http.get<ListResponse<DashboardWidget>>(`${this.baseUrl}/dashboard/widgets`);
  }

  getMetricData(
    metric: string,
    params?: Record<string, unknown>,
  ): Observable<DetailResponse<MetricData>> {
    return this.http.get<DetailResponse<MetricData>>(`${this.baseUrl}/metrics/${metric}`, {
      params: params as any,
    });
  }

  getChartData(
    chart: string,
    params?: Record<string, unknown>,
  ): Observable<DetailResponse<ChartData>> {
    return this.http.get<DetailResponse<ChartData>>(`${this.baseUrl}/charts/${chart}`, {
      params: params as any,
    });
  }

  getAttendanceSummary(
    params: Record<string, unknown>,
  ): Observable<DetailResponse<AttendanceSummaryReport>> {
    let httpParams = new HttpParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        httpParams = httpParams.set(key, String(value));
      }
    });
    return this.http.get<DetailResponse<AttendanceSummaryReport>>(
      `${this.baseUrl}/attendance-summary`,
      { params: httpParams },
    );
  }

  getLeaveSummary(params: Record<string, unknown>): Observable<DetailResponse<LeaveSummaryReport>> {
    let httpParams = new HttpParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        httpParams = httpParams.set(key, String(value));
      }
    });
    return this.http.get<DetailResponse<LeaveSummaryReport>>(`${this.baseUrl}/leave-summary`, {
      params: httpParams,
    });
  }

  getPayrollSummary(
    params: Record<string, unknown>,
  ): Observable<DetailResponse<PayrollSummaryReport>> {
    let httpParams = new HttpParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        httpParams = httpParams.set(key, String(value));
      }
    });
    return this.http.get<DetailResponse<PayrollSummaryReport>>(`${this.baseUrl}/payroll-summary`, {
      params: httpParams,
    });
  }

  getEmployeeReport(params: Record<string, unknown>): Observable<DetailResponse<EmployeeReport>> {
    let httpParams = new HttpParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        httpParams = httpParams.set(key, String(value));
      }
    });
    return this.http.get<DetailResponse<EmployeeReport>>(`${this.baseUrl}/employee-summary`, {
      params: httpParams,
    });
  }
}
