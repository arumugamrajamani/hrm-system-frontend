import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
  OnboardingCandidate,
  OnboardingChecklist,
  OnboardingDocument,
  OnboardingTemplate,
} from '../models/onboarding.model';
import {
  ListResponse,
  DetailResponse,
  ApiResponse,
} from '../../../shared/models/api-response.model';

@Injectable({ providedIn: 'root' })
export class OnboardingApiService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/onboarding`;

  // Onboarding
  list(params?: {
    page?: number;
    limit?: number;
    status?: string;
  }): Observable<ListResponse<OnboardingCandidate>> {
    let httpParams = new HttpParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          httpParams = httpParams.set(key, String(value));
        }
      });
    }
    return this.http.get<ListResponse<OnboardingCandidate>>(this.baseUrl, { params: httpParams });
  }

  getById(id: number | string): Observable<DetailResponse<OnboardingCandidate>> {
    return this.http.get<DetailResponse<OnboardingCandidate>>(`${this.baseUrl}/${id}`);
  }

  create(candidate: Partial<OnboardingCandidate>): Observable<DetailResponse<OnboardingCandidate>> {
    return this.http.post<DetailResponse<OnboardingCandidate>>(this.baseUrl, candidate);
  }

  update(
    id: number | string,
    candidate: Partial<OnboardingCandidate>,
  ): Observable<DetailResponse<OnboardingCandidate>> {
    return this.http.put<DetailResponse<OnboardingCandidate>>(`${this.baseUrl}/${id}`, candidate);
  }

  getEmployeeOnboarding(
    employeeId: number | string,
  ): Observable<DetailResponse<OnboardingCandidate>> {
    return this.http.get<DetailResponse<OnboardingCandidate>>(
      `${this.baseUrl}/employee/${employeeId}`,
    );
  }

  // Checklist
  updateChecklistItem(
    onboardingId: number | string,
    itemId: number | string,
    data: any,
  ): Observable<DetailResponse<OnboardingChecklist>> {
    return this.http.patch<DetailResponse<OnboardingChecklist>>(
      `${this.baseUrl}/${onboardingId}/checklist/${itemId}`,
      data,
    );
  }

  // Probation Tracking
  getProbation(employeeId: number | string): Observable<DetailResponse<any>> {
    return this.http.get<DetailResponse<any>>(
      `${environment.apiUrl}/onboarding/probation/${employeeId}`,
    );
  }

  createProbation(employeeId: number | string, probation: any): Observable<DetailResponse<any>> {
    return this.http.post<DetailResponse<any>>(
      `${environment.apiUrl}/onboarding/probation/${employeeId}`,
      probation,
    );
  }

  updateProbation(employeeId: number | string, probation: any): Observable<DetailResponse<any>> {
    return this.http.patch<DetailResponse<any>>(
      `${environment.apiUrl}/onboarding/probation/${employeeId}`,
      probation,
    );
  }

  // Legacy methods
  complete(id: number): Observable<OnboardingCandidate> {
    return this.http.post<OnboardingCandidate>(`${this.baseUrl}/${id}/complete`, {});
  }

  getChecklist(candidateId: number): Observable<OnboardingChecklist[]> {
    return this.http.get<OnboardingChecklist[]>(`${this.baseUrl}/${candidateId}/checklist`);
  }

  getDocuments(candidateId: number): Observable<OnboardingDocument[]> {
    return this.http.get<OnboardingDocument[]>(`${this.baseUrl}/${candidateId}/documents`);
  }

  uploadDocument(candidateId: number, file: File): Observable<OnboardingDocument> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<OnboardingDocument>(`${this.baseUrl}/${candidateId}/documents`, formData);
  }

  verifyDocument(docId: number, verified: boolean): Observable<OnboardingDocument> {
    return this.http.put<OnboardingDocument>(`${this.baseUrl}/documents/${docId}/verify`, {
      verified,
    });
  }

  getTemplates(): Observable<OnboardingTemplate[]> {
    return this.http.get<OnboardingTemplate[]>(`${this.baseUrl}/templates`);
  }

  createTemplate(template: Partial<OnboardingTemplate>): Observable<OnboardingTemplate> {
    return this.http.post<OnboardingTemplate>(`${this.baseUrl}/templates`, template);
  }
}
