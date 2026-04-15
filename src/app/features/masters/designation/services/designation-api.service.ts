import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { Observable, map, catchError, throwError } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import {
  Designation,
  CreateDesignationDto,
  UpdateDesignationDto,
  CodeResponse,
} from '../models/designation.model';

interface ApiDesignation {
  id: number;
  designation_name: string;
  designation_code: string;
  department_id?: number;
  department_name?: string;
  grade_level?: number;
  description?: string;
  status: 'active' | 'inactive';
  created_at?: string;
  updated_at?: string;
  created_by?: number;
  updated_by?: number;
  created_by_username?: string;
  updated_by_username?: string;
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
export class DesignationApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.designationsApiUrl;

  private mapApiToDesignation(api: ApiDesignation): Designation {
    return {
      id: api.id,
      name: api.designation_name,
      code: api.designation_code,
      departmentId: api.department_id,
      departmentName: api.department_name,
      gradeLevel: api.grade_level,
      description: api.description,
      status: api.status,
      createdAt: api.created_at,
      updatedAt: api.updated_at,
      createdBy: api.created_by,
      updatedBy: api.updated_by,
      createdByUsername: api.created_by_username,
      updatedByUsername: api.updated_by_username,
    };
  }

  list(params?: Record<string, unknown>): Observable<ListResponse<Designation>> {
    let httpParams = new HttpParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          httpParams = httpParams.set(key, String(value));
        }
      });
    }
    return this.http.get<ListResponse<ApiDesignation>>(this.baseUrl, { params: httpParams }).pipe(
      map((response) => ({
        ...response,
        data: Array.isArray(response.data)
          ? response.data.map((item) => this.mapApiToDesignation(item))
          : [],
      })),
      catchError((error: HttpErrorResponse) => {
        console.error('API Error in list:', error);
        if (error.error && typeof error.error === 'object') {
          return throwError(() => error.error);
        }
        return throwError(() => error);
      }),
    );
  }

  getByDepartment(departmentId: number): Observable<{ data: Designation[]; success: boolean }> {
    return this.http
      .get<{
        data: ApiDesignation[];
        success: boolean;
      }>(`${this.baseUrl}/department/${departmentId}`)
      .pipe(
        map((response) => ({
          ...response,
          data: response.data.map((item) => this.mapApiToDesignation(item)),
        })),
        catchError((error: HttpErrorResponse) => {
          console.error('API Error in getByDepartment:', error);
          if (error.error && typeof error.error === 'object') {
            return throwError(() => error.error);
          }
          return throwError(() => error);
        }),
      );
  }

  getById(id: number): Observable<DetailResponse<Designation>> {
    return this.http.get<DetailResponse<ApiDesignation>>(`${this.baseUrl}/${id}`).pipe(
      map((response) => ({
        ...response,
        data: this.mapApiToDesignation(response.data),
      })),
      catchError((error: HttpErrorResponse) => {
        console.error('API Error in getById:', error);
        if (error.error && typeof error.error === 'object') {
          return throwError(() => error.error);
        }
        return throwError(() => error);
      }),
    );
  }

  create(data: CreateDesignationDto): Observable<DetailResponse<Designation>> {
    const payload: Record<string, unknown> = {
      designation_name: data.designation_name,
    };

    if (data.designation_code) payload['designation_code'] = data.designation_code;
    if (data.department_id) payload['department_id'] = data.department_id;
    if (data.grade_level) payload['grade_level'] = data.grade_level;
    if (data.description) payload['description'] = data.description;
    if (data.status) payload['status'] = data.status;

    return this.http.post<DetailResponse<ApiDesignation>>(this.baseUrl, payload).pipe(
      map((response) => ({
        ...response,
        data: this.mapApiToDesignation(response.data),
      })),
      catchError((error: HttpErrorResponse) => {
        console.error('API Error in create:', error);
        if (error.error && typeof error.error === 'object') {
          return throwError(() => error.error);
        }
        return throwError(() => error);
      }),
    );
  }

  update(id: number, data: UpdateDesignationDto): Observable<DetailResponse<Designation>> {
    const payload: Record<string, unknown> = {};

    if (data.designation_name !== undefined) payload['designation_name'] = data.designation_name;
    if (data.designation_code !== undefined) payload['designation_code'] = data.designation_code;
    if (data.department_id !== undefined) payload['department_id'] = data.department_id;
    if (data.grade_level !== undefined) payload['grade_level'] = data.grade_level;
    if (data.description !== undefined) payload['description'] = data.description;
    if (data.status !== undefined) payload['status'] = data.status;

    return this.http.put<DetailResponse<ApiDesignation>>(`${this.baseUrl}/${id}`, payload).pipe(
      map((response) => ({
        ...response,
        data: this.mapApiToDesignation(response.data),
      })),
      catchError((error: HttpErrorResponse) => {
        console.error('API Error in update:', error);
        if (error.error && typeof error.error === 'object') {
          return throwError(() => error.error);
        }
        return throwError(() => error);
      }),
    );
  }

  delete(id: number): Observable<ApiResponse<Designation>> {
    return this.http.delete<ApiResponse<ApiDesignation>>(`${this.baseUrl}/${id}`).pipe(
      map((response) => ({
        ...response,
        data: response.data ? this.mapApiToDesignation(response.data) : undefined,
      })),
      catchError((error: HttpErrorResponse) => {
        console.error('API Error in delete:', error);
        if (error.error && typeof error.error === 'object') {
          return throwError(() => error.error);
        }
        return throwError(() => error);
      }),
    );
  }

  activate(id: number): Observable<ApiResponse<Designation>> {
    return this.http.patch<ApiResponse<ApiDesignation>>(`${this.baseUrl}/${id}/activate`, {}).pipe(
      map((response) => ({
        ...response,
        data: response.data ? this.mapApiToDesignation(response.data) : undefined,
      })),
      catchError((error: HttpErrorResponse) => {
        console.error('API Error in activate:', error);
        if (error.error && typeof error.error === 'object') {
          return throwError(() => error.error);
        }
        return throwError(() => error);
      }),
    );
  }

  deactivate(id: number): Observable<ApiResponse<Designation>> {
    return this.http
      .patch<ApiResponse<ApiDesignation>>(`${this.baseUrl}/${id}/deactivate`, {})
      .pipe(
        map((response) => ({
          ...response,
          data: response.data ? this.mapApiToDesignation(response.data) : undefined,
        })),
        catchError((error: HttpErrorResponse) => {
          console.error('API Error in deactivate:', error);
          if (error.error && typeof error.error === 'object') {
            return throwError(() => error.error);
          }
          return throwError(() => error);
        }),
      );
  }

  generateCode(prefix?: string): Observable<{ data: CodeResponse; success: boolean }> {
    let params = new HttpParams();
    if (prefix) {
      params = params.set('prefix', prefix);
    }
    return this.http
      .get<{
        data: CodeResponse;
        success: boolean;
      }>(`${this.baseUrl}/generate-code/code`, { params })
      .pipe(
        map((response) => ({
          ...response,
          data: { designation_code: response.data.designation_code },
        })),
        catchError((error: HttpErrorResponse) => {
          console.error('API Error in generateCode:', error);
          if (error.error && typeof error.error === 'object') {
            return throwError(() => error.error);
          }
          return throwError(() => error);
        }),
      );
  }
}
