import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
  Timesheet,
  TimesheetFilter,
  TimesheetStatus,
  TimesheetProject,
  TimesheetTask,
  TimesheetApproval,
} from '../models/timesheet.model';
import { ListResponse, DetailResponse } from '../../../shared/models/api-response.model';

@Injectable({ providedIn: 'root' })
export class TimesheetApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/timesheets`;

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

  getProjects(): Observable<ListResponse<TimesheetProject>> {
    return this.http.get<ListResponse<TimesheetProject>>(`${environment.apiUrl}/projects`);
  }

  getTasksByProject(projectId: number): Observable<ListResponse<TimesheetTask>> {
    return this.http.get<ListResponse<TimesheetTask>>(
      `${environment.apiUrl}/projects/${projectId}/tasks`,
    );
  }

  getPendingApprovals(): Observable<ListResponse<TimesheetApproval>> {
    return this.http.get<ListResponse<TimesheetApproval>>(`${this.baseUrl}/pending-approvals`);
  }

  getTimesheetDetails(timesheetId: number): Observable<DetailResponse<Timesheet>> {
    return this.http.get<DetailResponse<Timesheet>>(`${this.baseUrl}/${timesheetId}`);
  }
}
