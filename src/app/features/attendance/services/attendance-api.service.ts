import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { AttendanceRecord, AttendanceSummary, AttendanceFilter } from '../models/attendance.model';
import {
  ListResponse,
  DetailResponse,
  ApiResponse,
} from '../../../shared/models/api-response.model';

@Injectable({ providedIn: 'root' })
export class AttendanceApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/attendance`;

  // Shifts
  getShifts(params?: {
    page?: number;
    limit?: number;
    status?: string;
  }): Observable<ListResponse<any>> {
    let httpParams = new HttpParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          httpParams = httpParams.set(key, String(value));
        }
      });
    }
    return this.http.get<ListResponse<any>>(`${this.baseUrl}/shifts`, { params: httpParams });
  }

  getShift(id: number | string): Observable<DetailResponse<any>> {
    return this.http.get<DetailResponse<any>>(`${this.baseUrl}/shifts/${id}`);
  }

  createShift(shift: any): Observable<DetailResponse<any>> {
    return this.http.post<DetailResponse<any>>(`${this.baseUrl}/shifts`, shift);
  }

  updateShift(id: number | string, shift: any): Observable<DetailResponse<any>> {
    return this.http.put<DetailResponse<any>>(`${this.baseUrl}/shifts/${id}`, shift);
  }

  // Holidays
  getHolidays(params?: {
    page?: number;
    limit?: number;
    year?: number;
    location_id?: number;
  }): Observable<ListResponse<any>> {
    let httpParams = new HttpParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          httpParams = httpParams.set(key, String(value));
        }
      });
    }
    return this.http.get<ListResponse<any>>(`${this.baseUrl}/holidays`, { params: httpParams });
  }

  getHoliday(id: number | string): Observable<DetailResponse<any>> {
    return this.http.get<DetailResponse<any>>(`${this.baseUrl}/holidays/${id}`);
  }

  createHoliday(holiday: any): Observable<DetailResponse<any>> {
    return this.http.post<DetailResponse<any>>(`${this.baseUrl}/holidays`, holiday);
  }

  updateHoliday(id: number | string, holiday: any): Observable<DetailResponse<any>> {
    return this.http.put<DetailResponse<any>>(`${this.baseUrl}/holidays/${id}`, holiday);
  }

  // Leave Types
  getLeaveTypes(params?: {
    page?: number;
    limit?: number;
    status?: string;
  }): Observable<ListResponse<any>> {
    let httpParams = new HttpParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          httpParams = httpParams.set(key, String(value));
        }
      });
    }
    return this.http.get<ListResponse<any>>(`${this.baseUrl}/leave-types`, { params: httpParams });
  }

  getLeaveType(id: number | string): Observable<DetailResponse<any>> {
    return this.http.get<DetailResponse<any>>(`${this.baseUrl}/leave-types/${id}`);
  }

  createLeaveType(leaveType: any): Observable<DetailResponse<any>> {
    return this.http.post<DetailResponse<any>>(`${this.baseUrl}/leave-types`, leaveType);
  }

  // Leave Balances
  getLeaveBalances(employeeId: number | string, year?: number): Observable<ListResponse<any>> {
    let httpParams = new HttpParams();
    if (year) httpParams = httpParams.set('year', String(year));
    return this.http.get<ListResponse<any>>(`${this.baseUrl}/leave-balances/${employeeId}`, {
      params: httpParams,
    });
  }

  initializeLeaveBalances(
    employeeId: number | string,
    year: number,
  ): Observable<DetailResponse<any>> {
    return this.http.post<DetailResponse<any>>(
      `${this.baseUrl}/leave-balances/${employeeId}/initialize`,
      { year },
    );
  }

  // Leave Requests
  getLeaveRequests(params?: {
    page?: number;
    limit?: number;
    employee_id?: number;
    status?: string;
    start_date?: string;
    end_date?: string;
  }): Observable<ListResponse<any>> {
    let httpParams = new HttpParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          httpParams = httpParams.set(key, String(value));
        }
      });
    }
    return this.http.get<ListResponse<any>>(`${this.baseUrl}/leave-requests`, {
      params: httpParams,
    });
  }

  getLeaveRequest(id: number | string): Observable<DetailResponse<any>> {
    return this.http.get<DetailResponse<any>>(`${this.baseUrl}/leave-requests/${id}`);
  }

  createLeaveRequest(leaveRequest: any): Observable<DetailResponse<any>> {
    return this.http.post<DetailResponse<any>>(`${this.baseUrl}/leave-requests`, leaveRequest);
  }

  updateLeaveRequestStatus(
    id: number | string,
    status: string,
    rejectionReason?: string,
  ): Observable<DetailResponse<any>> {
    return this.http.patch<DetailResponse<any>>(`${this.baseUrl}/leave-requests/${id}/status`, {
      status,
      rejection_reason: rejectionReason,
    });
  }

  // Attendance Records
  getAttendanceRecords(params?: {
    page?: number;
    limit?: number;
    employee_id?: number;
    start_date?: string;
    end_date?: string;
    status?: string;
  }): Observable<ListResponse<any>> {
    let httpParams = new HttpParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          httpParams = httpParams.set(key, String(value));
        }
      });
    }
    return this.http.get<ListResponse<any>>(`${this.baseUrl}/records`, { params: httpParams });
  }

  getAttendanceRecord(id: number | string): Observable<DetailResponse<any>> {
    return this.http.get<DetailResponse<any>>(`${this.baseUrl}/records/${id}`);
  }

  markAttendance(data: any): Observable<DetailResponse<any>> {
    return this.http.post<DetailResponse<any>>(`${this.baseUrl}/mark`, data);
  }

  regularizeAttendance(id: number | string, reason: string): Observable<DetailResponse<any>> {
    return this.http.patch<DetailResponse<any>>(`${this.baseUrl}/regularize/${id}`, {
      regularization_reason: reason,
    });
  }

  // Timesheets
  getTimesheets(params?: {
    page?: number;
    limit?: number;
    employee_id?: number;
    start_date?: string;
    end_date?: string;
    status?: string;
  }): Observable<ListResponse<any>> {
    let httpParams = new HttpParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          httpParams = httpParams.set(key, String(value));
        }
      });
    }
    return this.http.get<ListResponse<any>>(`${this.baseUrl}/timesheets`, { params: httpParams });
  }

  createTimesheet(timesheet: any): Observable<DetailResponse<any>> {
    return this.http.post<DetailResponse<any>>(`${this.baseUrl}/timesheets`, timesheet);
  }

  updateTimesheetStatus(
    id: number | string,
    status: string,
    rejectionReason?: string,
  ): Observable<DetailResponse<any>> {
    return this.http.patch<DetailResponse<any>>(`${this.baseUrl}/timesheets/${id}/status`, {
      status,
      rejection_reason: rejectionReason,
    });
  }

  // Legacy methods
  list(params: Record<string, unknown>): Observable<ListResponse<AttendanceRecord>> {
    let httpParams = new HttpParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        httpParams = httpParams.set(key, String(value));
      }
    });
    return this.http.get<ListResponse<AttendanceRecord>>(this.baseUrl, { params: httpParams });
  }

  getCalendar(params: Record<string, unknown>): Observable<ListResponse<AttendanceRecord>> {
    let httpParams = new HttpParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        httpParams = httpParams.set(key, String(value));
      }
    });
    return this.http.get<ListResponse<AttendanceRecord>>(`${this.baseUrl}/calendar`, {
      params: httpParams,
    });
  }

  getSummary(
    employeeId: number,
    month: number,
    year: number,
  ): Observable<DetailResponse<AttendanceSummary>> {
    return this.http.get<DetailResponse<AttendanceSummary>>(
      `${this.baseUrl}/summary/${employeeId}?month=${month}&year=${year}`,
    );
  }

  getById(id: number): Observable<DetailResponse<AttendanceRecord>> {
    return this.http.get<DetailResponse<AttendanceRecord>>(`${this.baseUrl}/${id}`);
  }

  getByDate(date: string, employeeId?: number): Observable<ListResponse<AttendanceRecord>> {
    const url = employeeId
      ? `${this.baseUrl}/date/${date}?employeeId=${employeeId}`
      : `${this.baseUrl}/date/${date}`;
    return this.http.get<ListResponse<AttendanceRecord>>(url);
  }

  create(data: Partial<AttendanceRecord>): Observable<DetailResponse<AttendanceRecord>> {
    return this.http.post<DetailResponse<AttendanceRecord>>(this.baseUrl, data);
  }

  update(
    id: number,
    data: Partial<AttendanceRecord>,
  ): Observable<DetailResponse<AttendanceRecord>> {
    return this.http.put<DetailResponse<AttendanceRecord>>(`${this.baseUrl}/${id}`, data);
  }

  bulkCreate(data: Partial<AttendanceRecord>[]): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/bulk`, data);
  }
}
