import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { Department, DepartmentFilters, DepartmentTree } from '../models/department.model';

interface ApiDepartment {
  id: number;
  department_name: string;
  department_code: string;
  description?: string;
  parent_department_id?: number;
  parent_department_name?: string;
  head_id?: number;
  head_name?: string;
  location_id?: number;
  location_name?: string;
  is_active: boolean;
  status: 'active' | 'inactive';
  employee_count?: number;
  created_at?: string;
  updated_at?: string;
}

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
export class DepartmentApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.departmentsApiUrl;

  private mapApiToDepartment(api: ApiDepartment): Department {
    return {
      id: api.id,
      name: api.department_name,
      code: api.department_code,
      description: api.description,
      parentId: api.parent_department_id,
      parentName: api.parent_department_name,
      headId: api.head_id,
      headName: api.head_name,
      locationId: api.location_id,
      locationName: api.location_name,
      isActive: api.is_active,
      status: api.status,
      employeeCount: api.employee_count,
      createdAt: api.created_at,
      updatedAt: api.updated_at,
    };
  }

  list(params?: Record<string, unknown>): Observable<ListResponse<Department>> {
    let httpParams = new HttpParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          httpParams = httpParams.set(key, String(value));
        }
      });
    }
    return this.http.get<ListResponse<ApiDepartment>>(this.baseUrl, { params: httpParams }).pipe(
      map((response) => ({
        ...response,
        data: response.data.map((item) => this.mapApiToDepartment(item)),
      })),
    );
  }

  getTree(): Observable<{ data: DepartmentTree[]; success: boolean }> {
    return this.http
      .get<{ data: ApiDepartment[]; success: boolean }>(`${this.baseUrl}/hierarchy`)
      .pipe(
        map((response) => ({
          ...response,
          data: response.data.map((item) => this.mapApiToDepartment(item) as DepartmentTree),
        })),
      );
  }

  getById(id: number): Observable<DetailResponse<Department>> {
    return this.http.get<DetailResponse<ApiDepartment>>(`${this.baseUrl}/${id}`).pipe(
      map((response) => ({
        ...response,
        data: this.mapApiToDepartment(response.data),
      })),
    );
  }

  create(data: any): Observable<DetailResponse<Department>> {
    const payload = {
      department_name: data.department_name,
      department_code: data.department_code,
      description: data.description,
      parent_department_id: data.parent_department_id,
      head_id: data.head_id,
      location_id: data.location_id,
      is_active: data.status === 'active',
    };
    return this.http.post<DetailResponse<ApiDepartment>>(this.baseUrl, payload).pipe(
      map((response) => ({
        ...response,
        data: this.mapApiToDepartment(response.data),
      })),
    );
  }

  update(id: number, data: any): Observable<DetailResponse<Department>> {
    const payload = {
      department_name: data.department_name,
      department_code: data.department_code,
      description: data.description,
      parent_department_id: data.parent_department_id,
      head_id: data.head_id,
      location_id: data.location_id,
      is_active: data.status === 'active',
    };
    return this.http.put<DetailResponse<ApiDepartment>>(`${this.baseUrl}/${id}`, payload).pipe(
      map((response) => ({
        ...response,
        data: this.mapApiToDepartment(response.data),
      })),
    );
  }

  delete(id: number): Observable<ApiResponse<Department>> {
    return this.http.delete<ApiResponse<ApiDepartment>>(`${this.baseUrl}/${id}`).pipe(
      map((response) => ({
        ...response,
        data: response.data ? this.mapApiToDepartment(response.data) : undefined,
      })),
    );
  }

  updateStatus(id: number, status: string): Observable<ApiResponse<Department>> {
    return this.http
      .patch<
        ApiResponse<ApiDepartment>
      >(`${this.baseUrl}/${id}/${status === 'active' ? 'activate' : 'deactivate'}`, {})
      .pipe(
        map((response) => ({
          ...response,
          data: response.data ? this.mapApiToDepartment(response.data) : undefined,
        })),
      );
  }
}
