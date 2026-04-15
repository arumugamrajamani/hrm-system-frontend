import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AttendanceRecord, AttendanceSummary, AttendanceFilter } from '../models/attendance.model';

interface ListResponse<T> {
  data: T[];
  success: boolean;
  message?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

interface DetailResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

@Injectable({ providedIn: 'root' })
export class AttendanceApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = '/api/attendance';

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

  markAttendance(data: Partial<AttendanceRecord>): Observable<DetailResponse<AttendanceRecord>> {
    return this.http.post<DetailResponse<AttendanceRecord>>(`${this.baseUrl}/mark`, data);
  }
}
