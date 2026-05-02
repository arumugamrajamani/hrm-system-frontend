import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import {
  Education,
  EducationPaginationParams,
  EducationApiResponse,
  SingleEducationApiResponse,
} from '../models';

@Injectable({
  providedIn: 'root',
})
export class EducationService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/education`;

    getEducations(params: EducationPaginationParams = {}): Observable<EducationApiResponse> {
    let httpParams = new HttpParams()
      .set('page', (params.page || 1).toString())
      .set('limit', (params.limit || 1000).toString());

    if (params.search) {
      httpParams = httpParams.set('search', params.search);
    }
    if (params.level) {
      httpParams = httpParams.set('level', params.level);
    }
    if (params.status && params.status !== 'all') {
      httpParams = httpParams.set('status', params.status);
    }

    return this.http.get<EducationApiResponse>(this.baseUrl, { params: httpParams });
  }

  getEducationById(id: number): Observable<SingleEducationApiResponse> {
    return this.http.get<SingleEducationApiResponse>(`${this.baseUrl}/${id}`);
  }

  createEducation(data: Partial<Education>): Observable<SingleEducationApiResponse> {
    return this.http.post<SingleEducationApiResponse>(this.baseUrl, data);
  }

  updateEducation(id: number, data: Partial<Education>): Observable<SingleEducationApiResponse> {
    return this.http.put<SingleEducationApiResponse>(`${this.baseUrl}/${id}`, data);
  }

  deleteEducation(id: number): Observable<SingleEducationApiResponse> {
    return this.http.delete<SingleEducationApiResponse>(`${this.baseUrl}/${id}`);
  }

  activateEducation(id: number): Observable<SingleEducationApiResponse> {
    return this.http.patch<SingleEducationApiResponse>(`${this.baseUrl}/${id}/activate`, {});
  }

  deactivateEducation(id: number): Observable<SingleEducationApiResponse> {
    return this.http.patch<SingleEducationApiResponse>(`${this.baseUrl}/${id}/deactivate`, {});
  }

  getCoursesByEducation(educationId: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/${educationId}/courses`);
  }
}
