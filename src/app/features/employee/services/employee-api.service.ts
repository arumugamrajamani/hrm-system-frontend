import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  Employee,
  EmployeeFilters,
  EmployeeListItem,
  EmployeeProfile,
} from '../models/employee.model';

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
export class EmployeeApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = '/api/employees';

  list(params: Record<string, unknown>): Observable<ListResponse<EmployeeListItem>> {
    let httpParams = new HttpParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        httpParams = httpParams.set(key, String(value));
      }
    });
    return this.http.get<ListResponse<EmployeeListItem>>(this.baseUrl, { params: httpParams });
  }

  getById(id: number): Observable<DetailResponse<Employee>> {
    return this.http.get<DetailResponse<Employee>>(`${this.baseUrl}/${id}`);
  }

  getProfile(id: number): Observable<DetailResponse<EmployeeProfile>> {
    return this.http.get<DetailResponse<EmployeeProfile>>(`${this.baseUrl}/${id}/profile`);
  }

  create(data: Partial<Employee>): Observable<DetailResponse<Employee>> {
    return this.http.post<DetailResponse<Employee>>(this.baseUrl, data);
  }

  update(id: number, data: Partial<Employee>): Observable<DetailResponse<Employee>> {
    return this.http.put<DetailResponse<Employee>>(`${this.baseUrl}/${id}`, data);
  }

  delete(id: number): Observable<ApiResponse<Employee>> {
    return this.http.delete<ApiResponse<Employee>>(`${this.baseUrl}/${id}`);
  }

  updateStatus(id: number, status: 'active' | 'inactive'): Observable<ApiResponse<Employee>> {
    return this.http.patch<ApiResponse<Employee>>(`${this.baseUrl}/${id}/status`, { status });
  }

  importEmployees(
    file: File,
  ): Observable<ApiResponse<{ importedCount: number; failedCount: number }>> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<ApiResponse<{ importedCount: number; failedCount: number }>>(
      `${this.baseUrl}/import`,
      formData,
    );
  }

  exportEmployees(params?: Record<string, unknown>): Observable<Blob> {
    let httpParams = new HttpParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          httpParams = httpParams.set(key, String(value));
        }
      });
    }
    return this.http.get(`${this.baseUrl}/export`, {
      params: httpParams,
      responseType: 'blob',
    });
  }

  // Emergency Contacts
  addEmergencyContact(employeeId: number, contact: any): Observable<DetailResponse<any>> {
    return this.http.post<DetailResponse<any>>(
      `${this.baseUrl}/${employeeId}/emergency-contacts`,
      contact,
    );
  }

  updateEmergencyContact(
    employeeId: number,
    contactId: number,
    contact: any,
  ): Observable<DetailResponse<any>> {
    return this.http.put<DetailResponse<any>>(
      `${this.baseUrl}/${employeeId}/emergency-contacts/${contactId}`,
      contact,
    );
  }

  deleteEmergencyContact(employeeId: number, contactId: number): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(
      `${this.baseUrl}/${employeeId}/emergency-contacts/${contactId}`,
    );
  }

  // Documents
  uploadDocument(employeeId: number, document: any, file: File): Observable<DetailResponse<any>> {
    const formData = new FormData();
    formData.append('file', file);
    Object.keys(document).forEach((key) => {
      formData.append(key, String(document[key]));
    });
    return this.http.post<DetailResponse<any>>(`${this.baseUrl}/${employeeId}/documents`, formData);
  }

  deleteDocument(employeeId: number, documentId: number): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(
      `${this.baseUrl}/${employeeId}/documents/${documentId}`,
    );
  }
}
