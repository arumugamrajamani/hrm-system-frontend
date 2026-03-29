import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse, PaginatedResponse } from '../../core/models';
import { Department } from '../models/department.model';
import { DepartmentPaginationParams } from '../models/department-pagination-params.model';
import { DepartmentHierarchyResponse } from './department-hierarchy.model';

@Injectable({
  providedIn: 'root',
})
export class DepartmentApiService {
  private readonly apiUrl = environment.departmentsApiUrl;

  constructor(private http: HttpClient) {}

  /**
   * GET /api/departments
   * Get all departments with pagination, search, and filtering
   */
  getDepartments(params: DepartmentPaginationParams): Observable<PaginatedResponse<Department>> {
    let httpParams = new HttpParams()
      .set('page', params.page.toString())
      .set('limit', params.limit.toString());

    if (params.sortBy) {
      httpParams = httpParams.set('sortBy', params.sortBy);
      httpParams = httpParams.set('sortOrder', params.sortOrder || 'asc');
    }

    if (params.search) {
      httpParams = httpParams.set('search', params.search);
    }

    if (params.status && params.status !== 'all') {
      httpParams = httpParams.set('status', params.status);
    }

    return this.http.get<PaginatedResponse<Department>>(this.apiUrl, { params: httpParams });
  }

  /**
   * GET /api/departments/hierarchy
   * Get department hierarchy as a nested tree structure
   */
  getDepartmentHierarchy(): Observable<ApiResponse<DepartmentHierarchyResponse[]>> {
    return this.http.get<ApiResponse<DepartmentHierarchyResponse[]>>(`${this.apiUrl}/hierarchy`);
  }

  /**
   * GET /api/departments/:id
   * Get department by ID with parent information
   */
  getDepartment(id: number): Observable<ApiResponse<Department>> {
    return this.http.get<ApiResponse<Department>>(`${this.apiUrl}/${id}`);
  }

  /**
   * GET /api/departments/:id/children
   * Get all direct child departments
   */
  getChildDepartments(id: number): Observable<ApiResponse<Department[]>> {
    return this.http.get<ApiResponse<Department[]>>(`${this.apiUrl}/${id}/children`);
  }

  /**
   * POST /api/departments
   * Create a new department (Admin only)
   */
  createDepartment(department: Partial<Department>): Observable<ApiResponse<Department>> {
    return this.http.post<ApiResponse<Department>>(this.apiUrl, department);
  }

  /**
   * PUT /api/departments/:id
   * Update an existing department (Admin only)
   */
  updateDepartment(
    id: number,
    department: Partial<Department>,
  ): Observable<ApiResponse<Department>> {
    return this.http.put<ApiResponse<Department>>(`${this.apiUrl}/${id}`, department);
  }

  /**
   * DELETE /api/departments/:id
   * Soft delete (deactivate) a department (Admin only)
   * Cannot delete departments with child departments
   */
  deleteDepartment(id: number): Observable<ApiResponse> {
    return this.http.delete<ApiResponse>(`${this.apiUrl}/${id}`);
  }

  /**
   * PATCH /api/departments/:id/activate
   * Activate a deactivated department (Admin only)
   */
  activateDepartment(id: number): Observable<ApiResponse<Department>> {
    return this.http.patch<ApiResponse<Department>>(`${this.apiUrl}/${id}/activate`, {});
  }

  /**
   * PATCH /api/departments/:id/deactivate
   * Deactivate an active department (Admin only)
   * Cannot deactivate departments with child departments
   */
  deactivateDepartment(id: number): Observable<ApiResponse<Department>> {
    return this.http.patch<ApiResponse<Department>>(`${this.apiUrl}/${id}/deactivate`, {});
  }
}
