import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  LeaveRequest,
  LeaveBalance,
  LeaveFilter,
  LeavePolicy,
  LeavePolicyFilter,
} from '../models/leave.model';

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

interface ApiResponse<T> {
  data?: T;
  success: boolean;
  message?: string;
}

@Injectable({ providedIn: 'root' })
export class LeaveApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = '/api/leaves';

  list(params: Record<string, unknown>): Observable<ListResponse<LeaveRequest>> {
    let httpParams = new HttpParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        httpParams = httpParams.set(key, String(value));
      }
    });
    return this.http.get<ListResponse<LeaveRequest>>(this.baseUrl, { params: httpParams });
  }

  getBalances(employeeId?: number): Observable<{ data: LeaveBalance[]; success: boolean }> {
    const url = employeeId
      ? `${this.baseUrl}/balances?employeeId=${employeeId}`
      : `${this.baseUrl}/balances`;
    return this.http.get<{ data: LeaveBalance[]; success: boolean }>(url);
  }

  getPendingApprovals(): Observable<ListResponse<LeaveRequest>> {
    return this.http.get<ListResponse<LeaveRequest>>(`${this.baseUrl}/pending-approvals`);
  }

  getById(id: number): Observable<DetailResponse<LeaveRequest>> {
    return this.http.get<DetailResponse<LeaveRequest>>(`${this.baseUrl}/${id}`);
  }

  create(data: Partial<LeaveRequest>): Observable<DetailResponse<LeaveRequest>> {
    return this.http.post<DetailResponse<LeaveRequest>>(this.baseUrl, data);
  }

  update(id: number, data: Partial<LeaveRequest>): Observable<DetailResponse<LeaveRequest>> {
    return this.http.put<DetailResponse<LeaveRequest>>(`${this.baseUrl}/${id}`, data);
  }

  delete(id: number): Observable<ApiResponse<LeaveRequest>> {
    return this.http.delete<ApiResponse<LeaveRequest>>(`${this.baseUrl}/${id}`);
  }

  approve(id: number, comments?: string): Observable<ApiResponse<LeaveRequest>> {
    return this.http.post<ApiResponse<LeaveRequest>>(`${this.baseUrl}/${id}/approve`, { comments });
  }

  reject(id: number, comments: string): Observable<ApiResponse<LeaveRequest>> {
    return this.http.post<ApiResponse<LeaveRequest>>(`${this.baseUrl}/${id}/reject`, { comments });
  }

  cancel(id: number): Observable<ApiResponse<LeaveRequest>> {
    return this.http.post<ApiResponse<LeaveRequest>>(`${this.baseUrl}/${id}/cancel`, {});
  }

  listPolicies(params?: Record<string, unknown>): Observable<ListResponse<LeavePolicy>> {
    let httpParams = new HttpParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          httpParams = httpParams.set(key, String(value));
        }
      });
    }
    return this.http.get<ListResponse<LeavePolicy>>(`${this.baseUrl}/policies`, {
      params: httpParams,
    });
  }

  getPolicyById(id: number): Observable<DetailResponse<LeavePolicy>> {
    return this.http.get<DetailResponse<LeavePolicy>>(`${this.baseUrl}/policies/${id}`);
  }

  createPolicy(data: Partial<LeavePolicy>): Observable<DetailResponse<LeavePolicy>> {
    return this.http.post<DetailResponse<LeavePolicy>>(`${this.baseUrl}/policies`, data);
  }

  updatePolicy(id: number, data: Partial<LeavePolicy>): Observable<DetailResponse<LeavePolicy>> {
    return this.http.put<DetailResponse<LeavePolicy>>(`${this.baseUrl}/policies/${id}`, data);
  }

  deletePolicy(id: number): Observable<ApiResponse<LeavePolicy>> {
    return this.http.delete<ApiResponse<LeavePolicy>>(`${this.baseUrl}/policies/${id}`);
  }

  allocateBalances(employeeId: number, year: number): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.baseUrl}/balances/allocate`, {
      employeeId,
      year,
    });
  }
}
