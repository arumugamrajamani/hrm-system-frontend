import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { Shift, ShiftFilters } from '../models/shift.model';
import {
  ListResponse,
  DetailResponse,
  ApiResponse,
} from '../../../../shared/models/api-response.model';

interface ApiShift {
  id: number;
  shift_name: string;
  start_time: string;
  end_time: string;
  break_duration?: number;
  weekoff_days?: string;
  is_flexible: boolean;
  grace_period_minutes?: number;
  status: 'active' | 'inactive';
  created_by?: number;
  updated_by?: number;
  created_at?: string;
  updated_at?: string;
  usage_count?: number;
}

@Injectable({ providedIn: 'root' })
export class ShiftApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/shifts`;

  private mapApiToShift(api: ApiShift): Shift {
    return {
      id: api.id,
      name: api.shift_name,
      code: '', // API doesn't return shift_code
      startTime: api.start_time,
      endTime: api.end_time,
      workingHours: 0, // API doesn't return working_hours
      breakDuration: api.break_duration,
      isFlexible: api.is_flexible,
      gracePeriodMinutes: api.grace_period_minutes,
      lateThresholdMinutes: undefined,
      color: undefined,
      description: undefined,
      isActive: api.status === 'active',
      status: api.status,
      employeeCount: api.usage_count,
    };
  }

  list(params?: Record<string, unknown>): Observable<any> {
    let httpParams = new HttpParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          httpParams = httpParams.set(key, String(value));
        }
      });
    }
    return this.http.get<any>(this.baseUrl, { params: httpParams }).pipe(
      map((response) => {
        // API returns: {success, data: [rawApiShifts], meta: {pagination}}
        console.log('Raw API Response:', response);
        const rawData = response?.data || [];
        const shifts = rawData.map((item: ApiShift) => this.mapApiToShift(item));

        return {
          ...response,
          data: shifts,
          pagination: response?.meta?.pagination,
        };
      }),
    );
  }

  getActiveShifts(): Observable<ListResponse<Shift>> {
    return this.http.get<ListResponse<ApiShift>>(`${this.baseUrl}/active`).pipe(
      map((response) => ({
        ...response,
        data: response.data.map((item: ApiShift) => this.mapApiToShift(item)),
      })),
    );
  }

  getById(id: number): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/${id}`).pipe(
      map((response) => {
        // API returns: {success, data: rawApiShift}
        const shift = response?.data ? this.mapApiToShift(response.data) : null;
        return {
          ...response,
          data: shift,
        };
      }),
    );
  }

  create(data: any): Observable<DetailResponse<Shift>> {
    const payload = {
      shift_name: data.shift_name,
      shift_code: data.shift_code,
      start_time: data.start_time,
      end_time: data.end_time,
      working_hours: data.working_hours,
      break_duration: data.break_duration,
      is_flexible: Boolean(data.is_flexible), // Ensure boolean
      grace_period_minutes: data.grace_period_minutes,
      late_threshold_minutes: data.late_threshold_minutes,
      color: data.color,
      description: data.description,
      is_active: data.status === 'active',
    };
    return this.http.post<DetailResponse<ApiShift>>(this.baseUrl, payload).pipe(
      map((response) => ({
        ...response,
        data: this.mapApiToShift(response.data),
      })),
    );
  }

  update(id: number, data: any): Observable<DetailResponse<Shift>> {
    const payload = {
      shift_name: data.shift_name,
      shift_code: data.shift_code,
      start_time: data.start_time,
      end_time: data.end_time,
      working_hours: data.working_hours,
      break_duration: data.break_duration,
      is_flexible: Boolean(data.is_flexible), // Ensure boolean
      grace_period_minutes: data.grace_period_minutes,
      late_threshold_minutes: data.late_threshold_minutes,
      color: data.color,
      description: data.description,
      is_active: data.status === 'active',
    };
    return this.http.put<DetailResponse<ApiShift>>(`${this.baseUrl}/${id}`, payload).pipe(
      map((response) => ({
        ...response,
        data: this.mapApiToShift(response.data),
      })),
    );
  }

  delete(id: number): Observable<ApiResponse<Shift>> {
    return this.http.delete<ApiResponse<ApiShift>>(`${this.baseUrl}/${id}`).pipe(
      map((response) => ({
        ...response,
        data: response.data ? this.mapApiToShift(response.data) : undefined,
      })),
    );
  }

  updateStatus(id: number, status: string): Observable<ApiResponse<Shift>> {
    return this.http
      .patch<
        ApiResponse<ApiShift>
      >(`${this.baseUrl}/${id}/${status === 'active' ? 'activate' : 'deactivate'}`, {})
      .pipe(
        map((response) => ({
          ...response,
          data: response.data ? this.mapApiToShift(response.data) : undefined,
        })),
      );
  }
}
