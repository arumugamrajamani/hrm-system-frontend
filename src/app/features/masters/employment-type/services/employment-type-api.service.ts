import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { EmploymentType, EmploymentTypeFilters } from '../models/employment-type.model';
import {
  ListResponse,
  DetailResponse,
  ApiResponse,
} from '../../../../shared/models/api-response.model';

interface ApiEmploymentType {
  id: number;
  employment_type_name: string;
  employment_type_code: string;
  description?: string;
  is_permanent: boolean;
  probation_months?: number;
  notice_period_days?: number;
  max_contract_duration?: number;
  benefits?: string[];
  is_active: boolean;
  status: 'active' | 'inactive';
  employee_count?: number;
}

@Injectable({ providedIn: 'root' })
export class EmploymentTypeApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/employment-types`;

  private mapApiToEmploymentType(api: ApiEmploymentType): EmploymentType {
    return {
      id: api.id,
      name: api.employment_type_name,
      code: api.employment_type_code,
      description: api.description,
      isPermanent: api.is_permanent,
      probationMonths: api.probation_months,
      noticePeriodDays: api.notice_period_days,
      maxContractDuration: api.max_contract_duration,
      benefits: api.benefits,
      isActive: api.is_active,
      status: api.status,
      employeeCount: api.employee_count,
    };
  }

  list(params?: Record<string, unknown>): Observable<ListResponse<EmploymentType>> {
    let httpParams = new HttpParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          httpParams = httpParams.set(key, String(value));
        }
      });
    }
    return this.http
      .get<ListResponse<ApiEmploymentType>>(this.baseUrl, { params: httpParams })
      .pipe(
        map((response) => ({
          ...response,
          data: response.data.map((item) => this.mapApiToEmploymentType(item)),
        })),
      );
  }

  getActiveEmploymentTypes(): Observable<ListResponse<EmploymentType>> {
    return this.http.get<ListResponse<ApiEmploymentType>>(`${this.baseUrl}/active`).pipe(
      map((response) => ({
        ...response,
        data: response.data.map((item) => this.mapApiToEmploymentType(item)),
      })),
    );
  }

  getById(id: number): Observable<DetailResponse<EmploymentType>> {
    return this.http.get<DetailResponse<ApiEmploymentType>>(`${this.baseUrl}/${id}`).pipe(
      map((response) => ({
        ...response,
        data: this.mapApiToEmploymentType(response.data),
      })),
    );
  }

  create(data: Partial<EmploymentType>): Observable<DetailResponse<EmploymentType>> {
    const payload = {
      employment_type_name: data.name,
      employment_type_code: data.code,
      description: data.description,
      is_permanent: data.isPermanent,
      probation_months: data.probationMonths,
      notice_period_days: data.noticePeriodDays,
      max_contract_duration: data.maxContractDuration,
      benefits: data.benefits,
      is_active: data.status === 'active',
    };
    return this.http.post<DetailResponse<ApiEmploymentType>>(this.baseUrl, payload).pipe(
      map((response) => ({
        ...response,
        data: this.mapApiToEmploymentType(response.data),
      })),
    );
  }

  update(id: number, data: Partial<EmploymentType>): Observable<DetailResponse<EmploymentType>> {
    const payload = {
      employment_type_name: data.name,
      employment_type_code: data.code,
      description: data.description,
      is_permanent: data.isPermanent,
      probation_months: data.probationMonths,
      notice_period_days: data.noticePeriodDays,
      max_contract_duration: data.maxContractDuration,
      benefits: data.benefits,
      is_active: data.status === 'active',
    };
    return this.http.put<DetailResponse<ApiEmploymentType>>(`${this.baseUrl}/${id}`, payload).pipe(
      map((response) => ({
        ...response,
        data: this.mapApiToEmploymentType(response.data),
      })),
    );
  }

  delete(id: number): Observable<ApiResponse<EmploymentType>> {
    return this.http.delete<ApiResponse<ApiEmploymentType>>(`${this.baseUrl}/${id}`).pipe(
      map((response) => ({
        ...response,
        data: response.data ? this.mapApiToEmploymentType(response.data) : undefined,
      })),
    );
  }

  updateStatus(id: number, status: string): Observable<ApiResponse<EmploymentType>> {
    return this.http
      .patch<
        ApiResponse<ApiEmploymentType>
      >(`${this.baseUrl}/${id}/${status === 'active' ? 'activate' : 'deactivate'}`, {})
      .pipe(
        map((response) => ({
          ...response,
          data: response.data ? this.mapApiToEmploymentType(response.data) : undefined,
        })),
      );
  }
}
