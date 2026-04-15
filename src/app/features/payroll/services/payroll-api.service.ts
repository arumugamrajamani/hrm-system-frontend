import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  PayrollRun,
  PayrollRecord,
  PayrollFilter,
  SalaryComponent,
  SalaryStructure,
  PayrollStatus,
} from '../models/payroll.model';

interface ListResponse<T> {
  data: T[];
  success: boolean;
  message?: string;
  pagination?: { page: number; limit: number; total: number; totalPages: number };
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
export class PayrollApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = '/api/payroll';

  listRuns(params?: Record<string, unknown>): Observable<ListResponse<PayrollRun>> {
    let httpParams = new HttpParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          httpParams = httpParams.set(key, String(value));
        }
      });
    }
    return this.http.get<ListResponse<PayrollRun>>(`${this.baseUrl}/runs`, { params: httpParams });
  }

  getRunById(id: number): Observable<DetailResponse<PayrollRun>> {
    return this.http.get<DetailResponse<PayrollRun>>(`${this.baseUrl}/runs/${id}`);
  }

  createRun(month: number, year: number): Observable<DetailResponse<PayrollRun>> {
    return this.http.post<DetailResponse<PayrollRun>>(`${this.baseUrl}/runs`, { month, year });
  }

  processRun(id: number): Observable<ApiResponse<PayrollRun>> {
    return this.http.post<ApiResponse<PayrollRun>>(`${this.baseUrl}/runs/${id}/process`, {});
  }

  approveRun(id: number): Observable<ApiResponse<PayrollRun>> {
    return this.http.post<ApiResponse<PayrollRun>>(`${this.baseUrl}/runs/${id}/approve`, {});
  }

  markAsPaid(id: number): Observable<ApiResponse<PayrollRun>> {
    return this.http.post<ApiResponse<PayrollRun>>(`${this.baseUrl}/runs/${id}/paid`, {});
  }

  getRunRecords(
    runId: number,
    params?: Record<string, unknown>,
  ): Observable<ListResponse<PayrollRecord>> {
    let httpParams = new HttpParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          httpParams = httpParams.set(key, String(value));
        }
      });
    }
    return this.http.get<ListResponse<PayrollRecord>>(`${this.baseUrl}/runs/${runId}/records`, {
      params: httpParams,
    });
  }

  getRecordById(id: number): Observable<DetailResponse<PayrollRecord>> {
    return this.http.get<DetailResponse<PayrollRecord>>(`${this.baseUrl}/records/${id}`);
  }

  listComponents(): Observable<ListResponse<SalaryComponent>> {
    return this.http.get<ListResponse<SalaryComponent>>(`${this.baseUrl}/components`);
  }

  createComponent(data: Partial<SalaryComponent>): Observable<DetailResponse<SalaryComponent>> {
    return this.http.post<DetailResponse<SalaryComponent>>(`${this.baseUrl}/components`, data);
  }

  updateComponent(
    id: number,
    data: Partial<SalaryComponent>,
  ): Observable<DetailResponse<SalaryComponent>> {
    return this.http.put<DetailResponse<SalaryComponent>>(`${this.baseUrl}/components/${id}`, data);
  }

  deleteComponent(id: number): Observable<ApiResponse<SalaryComponent>> {
    return this.http.delete<ApiResponse<SalaryComponent>>(`${this.baseUrl}/components/${id}`);
  }

  getSalaryStructure(employeeId: number): Observable<DetailResponse<SalaryStructure>> {
    return this.http.get<DetailResponse<SalaryStructure>>(
      `${this.baseUrl}/structure/${employeeId}`,
    );
  }

  updateSalaryStructure(
    employeeId: number,
    data: Partial<SalaryStructure>,
  ): Observable<DetailResponse<SalaryStructure>> {
    return this.http.put<DetailResponse<SalaryStructure>>(
      `${this.baseUrl}/structure/${employeeId}`,
      data,
    );
  }

  generateSlip(runId: number, employeeId: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/slip/${runId}/${employeeId}`, { responseType: 'blob' });
  }
}
