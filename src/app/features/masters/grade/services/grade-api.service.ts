import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { Grade, GradeFilters } from '../models/grade.model';
import {
  ListResponse,
  DetailResponse,
  ApiResponse,
} from '../../../../shared/models/api-response.model';

interface ApiGrade {
  id: number;
  grade_name: string;
  grade_code: string;
  level: number;
  description?: string;
  min_salary?: number;
  max_salary?: number;
  currency?: string;
  is_active: boolean;
  status: 'active' | 'inactive';
  employee_count?: number;
  designation_count?: number;
}

@Injectable({ providedIn: 'root' })
export class GradeApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/grades`;

  private mapApiToGrade(api: ApiGrade): Grade {
    return {
      id: api.id,
      name: api.grade_name,
      code: api.grade_code,
      level: api.level,
      description: api.description,
      minSalary: api.min_salary,
      maxSalary: api.max_salary,
      currency: api.currency,
      isActive: api.is_active,
      status: api.status,
      employeeCount: api.employee_count,
      designationCount: api.designation_count,
    };
  }

  list(params?: Record<string, unknown>): Observable<ListResponse<Grade>> {
    let httpParams = new HttpParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          httpParams = httpParams.set(key, String(value));
        }
      });
    }
    return this.http.get<ListResponse<ApiGrade>>(this.baseUrl, { params: httpParams }).pipe(
      map((response) => ({
        ...response,
        data: response.data.map((item: ApiGrade) => this.mapApiToGrade(item)),
      })),
    );
  }

  getActiveGrades(): Observable<ListResponse<Grade>> {
    return this.http.get<ListResponse<ApiGrade>>(`${this.baseUrl}/active`).pipe(
      map((response) => ({
        ...response,
        data: response.data.map((item: ApiGrade) => this.mapApiToGrade(item)),
      })),
    );
  }

  getById(id: number): Observable<DetailResponse<Grade>> {
    return this.http.get<DetailResponse<ApiGrade>>(`${this.baseUrl}/${id}`).pipe(
      map((response) => ({
        ...response,
        data: this.mapApiToGrade(response.data as ApiGrade),
      })),
    );
  }

  create(data: any): Observable<DetailResponse<Grade>> {
    const payload = {
      grade_name: data.grade_name,
      grade_code: data.grade_code,
      level: data.level,
      description: data.description,
      min_salary: data.min_salary,
      max_salary: data.max_salary,
      currency: data.currency,
      is_active: data.status === 'active',
    };
    return this.http.post<DetailResponse<ApiGrade>>(this.baseUrl, payload).pipe(
      map((response) => ({
        ...response,
        data: this.mapApiToGrade(response.data as ApiGrade),
      })),
    );
  }

  update(id: number, data: any): Observable<DetailResponse<Grade>> {
    const payload = {
      grade_name: data.grade_name,
      grade_code: data.grade_code,
      level: data.level,
      description: data.description,
      min_salary: data.min_salary,
      max_salary: data.max_salary,
      currency: data.currency,
      is_active: data.status === 'active',
    };
    return this.http.put<DetailResponse<ApiGrade>>(`${this.baseUrl}/${id}`, payload).pipe(
      map((response) => ({
        ...response,
        data: this.mapApiToGrade(response.data as ApiGrade),
      })),
    );
  }

  delete(id: number): Observable<ApiResponse<Grade>> {
    return this.http.delete<ApiResponse<ApiGrade>>(`${this.baseUrl}/${id}`).pipe(
      map((response) => ({
        ...response,
        data: response.data ? this.mapApiToGrade(response.data as ApiGrade) : undefined,
      })),
    );
  }

  updateStatus(id: number, status: string): Observable<ApiResponse<Grade>> {
    return this.http
      .patch<
        ApiResponse<ApiGrade>
      >(`${this.baseUrl}/${id}/${status === 'active' ? 'activate' : 'deactivate'}`, {})
      .pipe(
        map((response) => ({
          ...response,
          data: response.data ? this.mapApiToGrade(response.data as ApiGrade) : undefined,
        })),
      );
  }
}
