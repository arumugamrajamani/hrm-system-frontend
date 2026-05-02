import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import {
  ListResponse,
  DetailResponse,
  ApiResponse,
} from '../../../../shared/models/api-response.model';

@Injectable({ providedIn: 'root' })
export class EducationApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/education`;

  // Education
  getEducations(params?: {
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
    return this.http.get<ListResponse<any>>(this.baseUrl, { params: httpParams });
  }

  getEducation(id: number | string): Observable<DetailResponse<any>> {
    return this.http.get<DetailResponse<any>>(`${this.baseUrl}/${id}`);
  }

  createEducation(education: any): Observable<DetailResponse<any>> {
    return this.http.post<DetailResponse<any>>(this.baseUrl, education);
  }

  updateEducation(id: number | string, education: any): Observable<DetailResponse<any>> {
    return this.http.put<DetailResponse<any>>(`${this.baseUrl}/${id}`, education);
  }

  deleteEducation(id: number | string): Observable<ApiResponse> {
    return this.http.delete<ApiResponse>(`${this.baseUrl}/${id}`);
  }

  activateEducation(id: number | string): Observable<ApiResponse> {
    return this.http.patch<ApiResponse>(`${this.baseUrl}/${id}/activate`, {});
  }

  deactivateEducation(id: number | string): Observable<ApiResponse> {
    return this.http.patch<ApiResponse>(`${this.baseUrl}/${id}/deactivate`, {});
  }

  getEducationCourses(id: number | string): Observable<ListResponse<any>> {
    return this.http.get<ListResponse<any>>(`${this.baseUrl}/${id}/courses`);
  }

  // Courses
  getCourses(params?: {
    page?: number;
    limit?: number;
    status?: string;
  }): Observable<ListResponse<any>> {
    return this.http.get<ListResponse<any>>(`${environment.apiUrl}/courses`, {
      params: this.buildParams(params),
    });
  }

  getCourse(id: number | string): Observable<DetailResponse<any>> {
    return this.http.get<DetailResponse<any>>(`${environment.apiUrl}/courses/${id}`);
  }

  createCourse(course: any): Observable<DetailResponse<any>> {
    return this.http.post<DetailResponse<any>>(`${environment.apiUrl}/courses`, course);
  }

  updateCourse(id: number | string, course: any): Observable<DetailResponse<any>> {
    return this.http.put<DetailResponse<any>>(`${environment.apiUrl}/courses/${id}`, course);
  }

  deleteCourse(id: number | string): Observable<ApiResponse> {
    return this.http.delete<ApiResponse>(`${environment.apiUrl}/courses/${id}`);
  }

  activateCourse(id: number | string): Observable<ApiResponse> {
    return this.http.patch<ApiResponse>(`${environment.apiUrl}/courses/${id}/activate`, {});
  }

  deactivateCourse(id: number | string): Observable<ApiResponse> {
    return this.http.patch<ApiResponse>(`${environment.apiUrl}/courses/${id}/deactivate`, {});
  }

  // Education-Course Mappings
  getEducationCourseMappings(): Observable<ListResponse<any>> {
    return this.http.get<ListResponse<any>>(`${environment.apiUrl}/education-course`);
  }

  createEducationCourseMapping(mapping: any): Observable<DetailResponse<any>> {
    return this.http.post<DetailResponse<any>>(`${environment.apiUrl}/education-course`, mapping);
  }

  deleteEducationCourseMapping(id: number | string): Observable<ApiResponse> {
    return this.http.delete<ApiResponse>(`${environment.apiUrl}/education-course/${id}`);
  }

  private buildParams(params?: { page?: number; limit?: number; status?: string }): HttpParams {
    let httpParams = new HttpParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          httpParams = httpParams.set(key, String(value));
        }
      });
    }
    return httpParams;
  }
}
