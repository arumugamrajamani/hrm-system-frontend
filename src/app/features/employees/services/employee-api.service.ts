import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
  ApiResponse,
  ListResponse,
  DetailResponse,
} from '../../../shared/models/api-response.model';
import { PaginationParams } from '../../../shared/models/pagination.model';

@Injectable({ providedIn: 'root' })
export class EmployeeApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/employees`;

  list(params?: PaginationParams): Observable<ListResponse<any>> {
    let httpParams = new HttpParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          httpParams = httpParams.set(key, String(value));
        }
      });
    }
    return this.http.get<ListResponse<any>>(this.baseUrl, { params: httpParams });
  }

  getById(id: number | string): Observable<DetailResponse<any>> {
    return this.http.get<DetailResponse<any>>(`${this.baseUrl}/${id}`);
  }

  create(employee: any): Observable<DetailResponse<any>> {
    return this.http.post<DetailResponse<any>>(this.baseUrl, employee);
  }

  update(id: number | string, employee: any): Observable<DetailResponse<any>> {
    return this.http.put<DetailResponse<any>>(`${this.baseUrl}/${id}`, employee);
  }

  delete(id: number | string): Observable<ApiResponse> {
    return this.http.delete<ApiResponse>(`${this.baseUrl}/${id}`);
  }

  restore(id: number | string): Observable<ApiResponse> {
    return this.http.patch<ApiResponse>(`${this.baseUrl}/${id}/restore`, {});
  }

  getProfile(id: number | string): Observable<DetailResponse<any>> {
    return this.http.get<DetailResponse<any>>(`${this.baseUrl}/${id}/profile`);
  }

  getJobDetails(id: number | string): Observable<DetailResponse<any>> {
    return this.http.get<DetailResponse<any>>(`${this.baseUrl}/${id}/job-details`);
  }

  updateJobDetails(id: number | string, data: any): Observable<DetailResponse<any>> {
    return this.http.post<DetailResponse<any>>(`${this.baseUrl}/${id}/job-details`, data);
  }

  getCurrentJobDetails(id: number | string): Observable<DetailResponse<any>> {
    return this.http.get<DetailResponse<any>>(`${this.baseUrl}/${id}/job-details/current`);
  }

  getAddresses(id: number | string): Observable<ListResponse<any>> {
    return this.http.get<ListResponse<any>>(`${this.baseUrl}/${id}/addresses`);
  }

  addAddress(id: number | string, address: any): Observable<DetailResponse<any>> {
    return this.http.post<DetailResponse<any>>(`${this.baseUrl}/${id}/addresses`, address);
  }

  getCurrentAddress(id: number | string): Observable<DetailResponse<any>> {
    return this.http.get<DetailResponse<any>>(`${this.baseUrl}/${id}/addresses/current`);
  }

  getBankDetails(id: number | string): Observable<ListResponse<any>> {
    return this.http.get<ListResponse<any>>(`${this.baseUrl}/${id}/bank-details`);
  }

  updateBankDetails(id: number | string, data: any): Observable<DetailResponse<any>> {
    return this.http.post<DetailResponse<any>>(`${this.baseUrl}/${id}/bank-details`, data);
  }

  getCurrentBankDetails(id: number | string): Observable<DetailResponse<any>> {
    return this.http.get<DetailResponse<any>>(`${this.baseUrl}/${id}/bank-details/current`);
  }

  getDocuments(id: number | string): Observable<ListResponse<any>> {
    return this.http.get<ListResponse<any>>(`${this.baseUrl}/${id}/documents`);
  }

  addDocument(id: number | string, document: any): Observable<DetailResponse<any>> {
    return this.http.post<DetailResponse<any>>(`${this.baseUrl}/${id}/documents`, document);
  }

  getEducation(id: number | string): Observable<ListResponse<any>> {
    return this.http.get<ListResponse<any>>(`${this.baseUrl}/${id}/education`);
  }

  addEducation(id: number | string, education: any): Observable<DetailResponse<any>> {
    return this.http.post<DetailResponse<any>>(`${this.baseUrl}/${id}/education`, education);
  }

  getExperience(id: number | string): Observable<ListResponse<any>> {
    return this.http.get<ListResponse<any>>(`${this.baseUrl}/${id}/experience`);
  }

  addExperience(id: number | string, experience: any): Observable<DetailResponse<any>> {
    return this.http.post<DetailResponse<any>>(`${this.baseUrl}/${id}/experience`, experience);
  }

  getJobChanges(id: number | string): Observable<ListResponse<any>> {
    return this.http.get<ListResponse<any>>(`${this.baseUrl}/${id}/job-changes`);
  }

  addJobChange(id: number | string, jobChange: any): Observable<DetailResponse<any>> {
    return this.http.post<DetailResponse<any>>(`${this.baseUrl}/${id}/job-changes`, jobChange);
  }

  getLifecycleHistory(id: number | string): Observable<ListResponse<any>> {
    return this.http.get<ListResponse<any>>(`${this.baseUrl}/${id}/lifecycle-history`);
  }

  updateLifecycleState(id: number | string, state: any): Observable<DetailResponse<any>> {
    return this.http.patch<DetailResponse<any>>(`${this.baseUrl}/${id}/lifecycle-state`, state);
  }

  getReportingEmployees(id: number | string): Observable<ListResponse<any>> {
    return this.http.get<ListResponse<any>>(`${this.baseUrl}/${id}/reporting-employees`);
  }
}
