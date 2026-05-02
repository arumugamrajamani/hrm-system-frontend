import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
  Workflow,
  WorkflowHistory,
  WorkflowActionRequest,
  ApprovalPendingCount,
  WorkflowEntityType,
  WorkflowStatus,
} from '../models/workflow.types';
import {
  ListResponse,
  DetailResponse,
  ApiResponse,
} from '../../../shared/models/api-response.model';

@Injectable({ providedIn: 'root' })
export class WorkflowApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/workflows`;

  getPendingApprovals(params?: Record<string, unknown>): Observable<ListResponse<Workflow>> {
    let httpParams = new HttpParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          httpParams = httpParams.set(key, String(value));
        }
      });
    }
    return this.http.get<ListResponse<Workflow>>(`${this.baseUrl}/pending`, { params: httpParams });
  }

  getApprovalHistory(params?: Record<string, unknown>): Observable<ListResponse<WorkflowHistory>> {
    let httpParams = new HttpParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          httpParams = httpParams.set(key, String(value));
        }
      });
    }
    return this.http.get<ListResponse<WorkflowHistory>>(`${this.baseUrl}/history`, {
      params: httpParams,
    });
  }

  getWorkflowById(id: number): Observable<DetailResponse<Workflow>> {
    return this.http.get<DetailResponse<Workflow>>(`${this.baseUrl}/${id}`);
  }

  approveStep(data: WorkflowActionRequest): Observable<ApiResponse<Workflow>> {
    return this.http.post<ApiResponse<Workflow>>(`${this.baseUrl}/approve`, data);
  }

  rejectStep(data: WorkflowActionRequest): Observable<ApiResponse<Workflow>> {
    return this.http.post<ApiResponse<Workflow>>(`${this.baseUrl}/reject`, data);
  }

  getApprovalStats(): Observable<ApiResponse<ApprovalPendingCount>> {
    return this.http.get<ApiResponse<ApprovalPendingCount>>(`${this.baseUrl}/stats`);
  }

  getWorkflowsByEntity(
    entityType: WorkflowEntityType,
    entityId: number,
  ): Observable<ListResponse<Workflow>> {
    return this.http.get<ListResponse<Workflow>>(
      `${this.baseUrl}/entity/${entityType}/${entityId}`,
    );
  }

  getWorkflows(params?: Record<string, unknown>): Observable<ListResponse<Workflow>> {
    let httpParams = new HttpParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          httpParams = httpParams.set(key, String(value));
        }
      });
    }
    return this.http.get<ListResponse<Workflow>>(this.baseUrl, { params: httpParams });
  }
}
