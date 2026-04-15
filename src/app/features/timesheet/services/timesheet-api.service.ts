import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Timesheet, TimesheetFilter, TimesheetStatus } from '../models/timesheet.model';

interface ListResponse<T> {
  data: T[];
  success: boolean;
  message?: string;
}

interface DetailResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

@Injectable({ providedIn: 'root' })
export class TimesheetApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = '/api/timesheets';

  list(params?: Record<string, unknown>): Observable<ListResponse<Timesheet>> {
    return this.http.get<ListResponse<Timesheet>>(this.baseUrl, { params: params as any });
  }

  getCurrentWeek(employeeId?: number): Observable<DetailResponse<Timesheet>> {
    const url = employeeId
      ? `${this.baseUrl}/current?employeeId=${employeeId}`
      : `${this.baseUrl}/current`;
    return this.http.get<DetailResponse<Timesheet>>(url);
  }

  getByWeek(weekStartDate: string, employeeId?: number): Observable<DetailResponse<Timesheet>> {
    const url = employeeId
      ? `${this.baseUrl}/week/${weekStartDate}?employeeId=${employeeId}`
      : `${this.baseUrl}/week/${weekStartDate}`;
    return this.http.get<DetailResponse<Timesheet>>(url);
  }

  save(data: Partial<Timesheet>): Observable<DetailResponse<Timesheet>> {
    return this.http.post<DetailResponse<Timesheet>>(this.baseUrl, data);
  }

  update(id: number, data: Partial<Timesheet>): Observable<DetailResponse<Timesheet>> {
    return this.http.put<DetailResponse<Timesheet>>(`${this.baseUrl}/${id}`, data);
  }

  submit(id: number): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/${id}/submit`, {});
  }

  approve(id: number, comments?: string): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/${id}/approve`, { comments });
  }

  reject(id: number, comments: string): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/${id}/reject`, { comments });
  }
}
