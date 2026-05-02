import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ESSDashboard, ESSProfileUpdate, ESSQuickAction } from '../models/self-service.model';

@Injectable({ providedIn: 'root' })
export class SelfServiceApiService {
  private baseUrl = '/self-service';

  constructor(private http: HttpClient) {}

  getDashboard(): Observable<ESSDashboard> {
    return this.http.get<ESSDashboard>(`${this.baseUrl}/dashboard`);
  }

  getProfileUpdates(): Observable<ESSProfileUpdate[]> {
    return this.http.get<ESSProfileUpdate[]>(`${this.baseUrl}/profile-updates`);
  }

  requestProfileUpdate(data: Partial<ESSProfileUpdate>): Observable<ESSProfileUpdate> {
    return this.http.post<ESSProfileUpdate>(`${this.baseUrl}/profile-updates`, data);
  }

  getQuickActions(): Observable<ESSQuickAction[]> {
    return this.http.get<ESSQuickAction[]>(`${this.baseUrl}/quick-actions`);
  }

  getMyDocuments(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/documents`);
  }

  uploadDocument(formData: FormData): Observable<any> {
    return this.http.post(`${this.baseUrl}/documents/upload`, formData);
  }

  getMyLeaves(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/leaves`);
  }

  getMyTimesheets(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/timesheets`);
  }

  getMyPaySlips(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/payslips`);
  }
}
