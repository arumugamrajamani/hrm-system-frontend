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
  status: 'active' | 'inactive';
  created_at?: string;
  updated_at?: string;
  created_by?: number;
  updated_by?: number;
  created_by_username?: string;
  updated_by_username?: string;
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
      status: api.status,
      created_at: api.created_at,
      updated_at: api.updated_at,
      created_by: api.created_by,
      updated_by: api.updated_by,
      created_by_username: api.created_by_username,
      updated_by_username: api.updated_by_username,
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
      status: data.status,
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
      status: data.status,
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

  activate(id: number): Observable<ApiResponse<EmploymentType>> {
    return this.http
      .patch<ApiResponse<ApiEmploymentType>>(`${this.baseUrl}/${id}/activate`, {})
      .pipe(
        map((response) => ({
          ...response,
          data: response.data ? this.mapApiToEmploymentType(response.data) : undefined,
        })),
      );
  }

  deactivate(id: number): Observable<ApiResponse<EmploymentType>> {
    return this.http
      .patch<ApiResponse<ApiEmploymentType>>(`${this.baseUrl}/${id}/deactivate`, {})
      .pipe(
        map((response) => ({
          ...response,
          data: response.data ? this.mapApiToEmploymentType(response.data) : undefined,
        })),
      );
  }
}
