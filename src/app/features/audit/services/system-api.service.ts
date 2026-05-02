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
export class SystemApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/system`;

  // Audit Logs
  getAuditLogs(params?: {
    page?: number;
    limit?: number;
    userId?: number;
    action?: string;
    entityType?: string;
    startDate?: string;
    endDate?: string;
  }): Observable<ListResponse<any>> {
    let httpParams = new HttpParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          httpParams = httpParams.set(key, String(value));
        }
      });
    }
    return this.http.get<ListResponse<any>>(`${this.baseUrl}/audit-logs`, { params: httpParams });
  }

  // Health Checks
  getHealth(): Observable<DetailResponse<any>> {
    return this.http.get<DetailResponse<any>>(`${environment.apiUrl}/system/health`);
  }

  getDetailedHealth(): Observable<DetailResponse<any>> {
    return this.http.get<DetailResponse<any>>(`${environment.apiUrl}/system/health/detailed`);
  }

  getLiveness(): Observable<DetailResponse<any>> {
    return this.http.get<DetailResponse<any>>(`${environment.apiUrl}/system/health/live`);
  }

  getReadiness(): Observable<DetailResponse<any>> {
    return this.http.get<DetailResponse<any>>(`${environment.apiUrl}/system/health/ready`);
  }

  // Feature Flags
  getFeatureFlags(): Observable<ListResponse<any>> {
    return this.http.get<ListResponse<any>>(`${this.baseUrl}/feature-flags`);
  }

  toggleFeatureFlag(name: string): Observable<ApiResponse> {
    return this.http.patch<ApiResponse>(`${this.baseUrl}/feature-flags/${name}/toggle`, {});
  }

  // Webhooks
  getWebhooks(): Observable<ListResponse<any>> {
    return this.http.get<ListResponse<any>>(`${this.baseUrl}/webhooks`);
  }

  createWebhook(webhook: any): Observable<DetailResponse<any>> {
    return this.http.post<DetailResponse<any>>(`${this.baseUrl}/webhooks`, webhook);
  }

  deleteWebhook(id: number | string): Observable<ApiResponse> {
    return this.http.delete<ApiResponse>(`${this.baseUrl}/webhooks/${id}`);
  }

  getWebhookEvents(): Observable<ListResponse<any>> {
    return this.http.get<ListResponse<any>>(`${this.baseUrl}/webhooks/events`);
  }

  // IP Blocklist
  getIPBlocklist(): Observable<ListResponse<any>> {
    return this.http.get<ListResponse<any>>(`${this.baseUrl}/ip-blocklist`);
  }

  addToIPBlocklist(ipData: any): Observable<DetailResponse<any>> {
    return this.http.post<DetailResponse<any>>(`${this.baseUrl}/ip-blocklist`, ipData);
  }

  removeFromIPBlocklist(ip: string): Observable<ApiResponse> {
    return this.http.delete<ApiResponse>(`${this.baseUrl}/ip-blocklist/${ip}`);
  }

  // Circuit Breakers
  getCircuitBreakers(): Observable<ListResponse<any>> {
    return this.http.get<ListResponse<any>>(`${this.baseUrl}/circuit-breakers`);
  }

  // Metrics
  getMetrics(): Observable<DetailResponse<any>> {
    return this.http.get<DetailResponse<any>>(`${this.baseUrl}/metrics`);
  }

  getMetricsJson(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/metrics/json`);
  }

  // System Info
  getSystemInfo(): Observable<DetailResponse<any>> {
    return this.http.get<DetailResponse<any>>(`${this.baseUrl}/system/info`);
  }

  // Tenants
  getTenants(): Observable<ListResponse<any>> {
    return this.http.get<ListResponse<any>>(`${this.baseUrl}/tenants`);
  }

  // Bulk Operations
  exportData(data: any): Observable<DetailResponse<any>> {
    return this.http.post<DetailResponse<any>>(`${this.baseUrl}/bulk/export`, data);
  }

  getBulkJobStatus(jobId: string): Observable<DetailResponse<any>> {
    return this.http.get<DetailResponse<any>>(`${this.baseUrl}/bulk/job/${jobId}`);
  }
}
