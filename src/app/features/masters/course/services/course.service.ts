import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import {
  Course,
  CoursePaginationParams,
  CourseApiResponse,
  SingleCourseApiResponse,
} from '../models';

@Injectable({
  providedIn: 'root',
})
export class CourseService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/courses`;

  getCourses(params: CoursePaginationParams = {}): Observable<CourseApiResponse> {
    let httpParams = new HttpParams()
      .set('page', (params.page || 1).toString())
      .set('limit', (params.limit || 1000).toString());

    if (params.search) {
      httpParams = httpParams.set('search', params.search);
    }
    if (params.status && params.status !== 'all') {
      httpParams = httpParams.set('status', params.status);
    }

    return this.http.get<CourseApiResponse>(this.baseUrl, { params: httpParams });
  }

  getCourseById(id: number): Observable<SingleCourseApiResponse> {
    return this.http.get<SingleCourseApiResponse>(`${this.baseUrl}/${id}`);
  }

  createCourse(data: Partial<Course>): Observable<SingleCourseApiResponse> {
    return this.http.post<SingleCourseApiResponse>(this.baseUrl, data);
  }

  updateCourse(id: number, data: Partial<Course>): Observable<SingleCourseApiResponse> {
    return this.http.put<SingleCourseApiResponse>(`${this.baseUrl}/${id}`, data);
  }

  deleteCourse(id: number): Observable<SingleCourseApiResponse> {
    return this.http.delete<SingleCourseApiResponse>(`${this.baseUrl}/${id}`);
  }

  activateCourse(id: number): Observable<SingleCourseApiResponse> {
    return this.http.patch<SingleCourseApiResponse>(`${this.baseUrl}/${id}/activate`, {});
  }

  deactivateCourse(id: number): Observable<SingleCourseApiResponse> {
    return this.http.patch<SingleCourseApiResponse>(`${this.baseUrl}/${id}/deactivate`, {});
  }

  getEducationsByCourse(courseId: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/${courseId}/educations`);
  }
}
