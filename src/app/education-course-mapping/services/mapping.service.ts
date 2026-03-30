import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { EducationCourseMapping, EducationCourseMappingApiResponse } from '../models';

@Injectable({
  providedIn: 'root',
})
export class EducationCourseMappingService {
  private apiUrl = `${environment.apiUrl}/education-course`;

  constructor(private http: HttpClient) {}

  getAllMappings(): Observable<EducationCourseMappingApiResponse> {
    return this.http.get<EducationCourseMappingApiResponse>(this.apiUrl);
  }

  createMapping(data: {
    education_id: number;
    course_id: number;
  }): Observable<EducationCourseMappingApiResponse> {
    return this.http.post<EducationCourseMappingApiResponse>(this.apiUrl, data);
  }

  deleteMapping(id: number): Observable<EducationCourseMappingApiResponse> {
    return this.http.delete<EducationCourseMappingApiResponse>(`${this.apiUrl}/${id}`);
  }
}
