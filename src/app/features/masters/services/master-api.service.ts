import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
  ListResponse,
  DetailResponse,
  ApiResponse,
} from '../../../shared/models/api-response.model';

@Injectable({ providedIn: 'root' })
export class MasterApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/master`;

  // Companies
  getCompanies(): Observable<ListResponse<any>> {
    return this.http.get<ListResponse<any>>(`${this.baseUrl}/companies`);
  }

  getCompany(id: number | string): Observable<DetailResponse<any>> {
    return this.http.get<DetailResponse<any>>(`${this.baseUrl}/companies/${id}`);
  }

  createCompany(company: any): Observable<DetailResponse<any>> {
    return this.http.post<DetailResponse<any>>(`${this.baseUrl}/companies`, company);
  }

  updateCompany(id: number | string, company: any): Observable<DetailResponse<any>> {
    return this.http.put<DetailResponse<any>>(`${this.baseUrl}/companies/${id}`, company);
  }

  // Business Units
  getBusinessUnits(): Observable<ListResponse<any>> {
    return this.http.get<ListResponse<any>>(`${this.baseUrl}/business-units`);
  }

  getBusinessUnit(id: number | string): Observable<DetailResponse<any>> {
    return this.http.get<DetailResponse<any>>(`${this.baseUrl}/business-units/${id}`);
  }

  createBusinessUnit(unit: any): Observable<DetailResponse<any>> {
    return this.http.post<DetailResponse<any>>(`${this.baseUrl}/business-units`, unit);
  }

  updateBusinessUnit(id: number | string, unit: any): Observable<DetailResponse<any>> {
    return this.http.put<DetailResponse<any>>(`${this.baseUrl}/business-units/${id}`, unit);
  }

  // Departments
  getDepartments(params?: {
    page?: number;
    limit?: number;
    status?: string;
  }): Observable<ListResponse<any>> {
    let httpParams = new HttpParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          httpParams = httpParams.set(key, String(value));
        }
      });
    }
    return this.http.get<ListResponse<any>>(`${environment.apiUrl}/departments`, {
      params: httpParams,
    });
  }

  getDepartment(id: number | string): Observable<DetailResponse<any>> {
    return this.http.get<DetailResponse<any>>(`${environment.apiUrl}/departments/${id}`);
  }

  createDepartment(department: any): Observable<DetailResponse<any>> {
    return this.http.post<DetailResponse<any>>(`${environment.apiUrl}/departments`, department);
  }

  updateDepartment(id: number | string, department: any): Observable<DetailResponse<any>> {
    return this.http.put<DetailResponse<any>>(
      `${environment.apiUrl}/departments/${id}`,
      department,
    );
  }

  deleteDepartment(id: number | string): Observable<ApiResponse> {
    return this.http.delete<ApiResponse>(`${environment.apiUrl}/departments/${id}`);
  }

  activateDepartment(id: number | string): Observable<ApiResponse> {
    return this.http.patch<ApiResponse>(`${environment.apiUrl}/departments/${id}/activate`, {});
  }

  deactivateDepartment(id: number | string): Observable<ApiResponse> {
    return this.http.patch<ApiResponse>(`${environment.apiUrl}/departments/${id}/deactivate`, {});
  }

  getDepartmentHierarchy(): Observable<DetailResponse<any>> {
    return this.http.get<DetailResponse<any>>(`${environment.apiUrl}/departments/hierarchy`);
  }

  getDepartmentChildren(id: number | string): Observable<ListResponse<any>> {
    return this.http.get<ListResponse<any>>(`${environment.apiUrl}/departments/${id}/children`);
  }

  // Designations
  getDesignations(params?: {
    page?: number;
    limit?: number;
    departmentId?: number;
  }): Observable<ListResponse<any>> {
    let httpParams = new HttpParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          httpParams = httpParams.set(key, String(value));
        }
      });
    }
    return this.http.get<ListResponse<any>>(`${environment.apiUrl}/designations`, {
      params: httpParams,
    });
  }

  getDesignation(id: number | string): Observable<DetailResponse<any>> {
    return this.http.get<DetailResponse<any>>(`${environment.apiUrl}/designations/${id}`);
  }

  createDesignation(designation: any): Observable<DetailResponse<any>> {
    return this.http.post<DetailResponse<any>>(`${environment.apiUrl}/designations`, designation);
  }

  updateDesignation(id: number | string, designation: any): Observable<DetailResponse<any>> {
    return this.http.put<DetailResponse<any>>(
      `${environment.apiUrl}/designations/${id}`,
      designation,
    );
  }

  deleteDesignation(id: number | string): Observable<ApiResponse> {
    return this.http.delete<ApiResponse>(`${environment.apiUrl}/designations/${id}`);
  }

  activateDesignation(id: number | string): Observable<ApiResponse> {
    return this.http.patch<ApiResponse>(`${environment.apiUrl}/designations/${id}/activate`, {});
  }

  deactivateDesignation(id: number | string): Observable<ApiResponse> {
    return this.http.patch<ApiResponse>(`${environment.apiUrl}/designations/${id}/deactivate`, {});
  }

  getDesignationsByDepartment(departmentId: number | string): Observable<ListResponse<any>> {
    return this.http.get<ListResponse<any>>(
      `${environment.apiUrl}/designations/department/${departmentId}`,
    );
  }

  generateDesignationCode(): Observable<DetailResponse<any>> {
    return this.http.get<DetailResponse<any>>(
      `${environment.apiUrl}/designations/generate-code/code`,
    );
  }

  // Grades
  getGrades(): Observable<ListResponse<any>> {
    return this.http.get<ListResponse<any>>(`${this.baseUrl}/grades`);
  }

  getGrade(id: number | string): Observable<DetailResponse<any>> {
    return this.http.get<DetailResponse<any>>(`${this.baseUrl}/grades/${id}`);
  }

  createGrade(grade: any): Observable<DetailResponse<any>> {
    return this.http.post<DetailResponse<any>>(`${this.baseUrl}/grades`, grade);
  }

  updateGrade(id: number | string, grade: any): Observable<DetailResponse<any>> {
    return this.http.put<DetailResponse<any>>(`${this.baseUrl}/grades/${id}`, grade);
  }

  // Locations
  getLocations(params?: {
    page?: number;
    limit?: number;
    status?: string;
  }): Observable<ListResponse<any>> {
    let httpParams = new HttpParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          httpParams = httpParams.set(key, String(value));
        }
      });
    }
    return this.http.get<ListResponse<any>>(`${environment.apiUrl}/locations`, {
      params: httpParams,
    });
  }

  getLocation(id: number | string): Observable<DetailResponse<any>> {
    return this.http.get<DetailResponse<any>>(`${environment.apiUrl}/locations/${id}`);
  }

  createLocation(location: any): Observable<DetailResponse<any>> {
    return this.http.post<DetailResponse<any>>(`${environment.apiUrl}/locations`, location);
  }

  updateLocation(id: number | string, location: any): Observable<DetailResponse<any>> {
    return this.http.put<DetailResponse<any>>(`${environment.apiUrl}/locations/${id}`, location);
  }

  deleteLocation(id: number | string): Observable<ApiResponse> {
    return this.http.delete<ApiResponse>(`${environment.apiUrl}/locations/${id}`);
  }

  activateLocation(id: number | string): Observable<ApiResponse> {
    return this.http.patch<ApiResponse>(`${environment.apiUrl}/locations/${id}/activate`, {});
  }

  deactivateLocation(id: number | string): Observable<ApiResponse> {
    return this.http.patch<ApiResponse>(`${environment.apiUrl}/locations/${id}/deactivate`, {});
  }

  getLocationHierarchy(): Observable<DetailResponse<any>> {
    return this.http.get<DetailResponse<any>>(`${environment.apiUrl}/locations/hierarchy`);
  }

  getLocationChildren(id: number | string): Observable<ListResponse<any>> {
    return this.http.get<ListResponse<any>>(`${environment.apiUrl}/locations/${id}/children`);
  }

  setHeadquarters(id: number | string): Observable<ApiResponse> {
    return this.http.patch<ApiResponse>(`${environment.apiUrl}/locations/${id}/headquarters`, {});
  }

  generateLocationCode(): Observable<DetailResponse<any>> {
    return this.http.get<DetailResponse<any>>(`${environment.apiUrl}/locations/generate-code/code`);
  }

  // Checklist Templates
  getChecklistTemplates(): Observable<ListResponse<any>> {
    return this.http.get<ListResponse<any>>(`${this.baseUrl}/checklist-templates`);
  }

  getChecklistTemplate(id: number | string): Observable<DetailResponse<any>> {
    return this.http.get<DetailResponse<any>>(`${this.baseUrl}/checklist-templates/${id}`);
  }

  createChecklistTemplate(template: any): Observable<DetailResponse<any>> {
    return this.http.post<DetailResponse<any>>(`${this.baseUrl}/checklist-templates`, template);
  }

  updateChecklistTemplate(id: number | string, template: any): Observable<DetailResponse<any>> {
    return this.http.put<DetailResponse<any>>(
      `${this.baseUrl}/checklist-templates/${id}`,
      template,
    );
  }

  getTemplateItems(templateId: number | string): Observable<ListResponse<any>> {
    return this.http.get<ListResponse<any>>(`${this.baseUrl}/templates/${templateId}/items`);
  }

  // Checklist Items
  createChecklistItem(item: any): Observable<DetailResponse<any>> {
    return this.http.post<DetailResponse<any>>(`${this.baseUrl}/checklist-items`, item);
  }

  updateChecklistItem(id: number | string, item: any): Observable<DetailResponse<any>> {
    return this.http.put<DetailResponse<any>>(`${this.baseUrl}/checklist-items/${id}`, item);
  }
}
