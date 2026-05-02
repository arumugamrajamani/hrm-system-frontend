import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
  LeaveRequest,
  LeaveBalance,
  LeaveFilter,
  LeavePolicy,
  LeavePolicyFilter,
  LeaveAccrual,
  LeaveAccrualRule,
  LeaveEncashment,
} from '../models/leave.model';
import {
  ListResponse,
  DetailResponse,
  ApiResponse,
} from '../../../shared/models/api-response.model';

@Injectable({ providedIn: 'root' })
export class LeaveApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/leaves`;

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

  getAccruals(
    params?: Record<string, unknown>,
  ): Observable<{ data: LeaveAccrual[]; success: boolean }> {
    let httpParams = new HttpParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          httpParams = httpParams.set(key, String(value));
        }
      });
    }
    return this.http.get<{ data: LeaveAccrual[]; success: boolean }>(`${this.baseUrl}/accruals`, {
      params: httpParams,
    });
  }

  getAccrualRules(
    params?: Record<string, unknown>,
  ): Observable<{ data: LeaveAccrualRule[]; success: boolean }> {
    let httpParams = new HttpParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          httpParams = httpParams.set(key, String(value));
        }
      });
    }
    return this.http.get<{ data: LeaveAccrualRule[]; success: boolean }>(
      `${this.baseUrl}/accrual-rules`,
      { params: httpParams },
    );
  }

  getEncashments(
    params?: Record<string, unknown>,
  ): Observable<{ data: LeaveEncashment[]; success: boolean }> {
    let httpParams = new HttpParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          httpParams = httpParams.set(key, String(value));
        }
      });
    }
    return this.http.get<{ data: LeaveEncashment[]; success: boolean }>(
      `${this.baseUrl}/encashments`,
      { params: httpParams },
    );
  }

  approveEncashment(id: number, remarks?: string): Observable<ApiResponse<LeaveEncashment>> {
    return this.http.post<ApiResponse<LeaveEncashment>>(
      `${this.baseUrl}/encashments/${id}/approve`,
      { remarks },
    );
  }

  rejectEncashment(id: number, remarks: string): Observable<ApiResponse<LeaveEncashment>> {
    return this.http.post<ApiResponse<LeaveEncashment>>(
      `${this.baseUrl}/encashments/${id}/reject`,
      { remarks },
    );
  }
}
