import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
  Goal,
  GoalStatus,
  KRA,
  KPI,
  AppraisalCycle,
  Appraisal,
  AppraisalStatus,
  TrainingRecord,
  SuccessionPlan,
  ReviewData,
} from '../models/performance.model';
import {
  ListResponse,
  DetailResponse,
  ApiResponse,
} from '../../../shared/models/api-response.model';

@Injectable({ providedIn: 'root' })
export class PerformanceApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/performance`;

  // Goals CRUD
  getGoals(params: Record<string, unknown> = {}): Observable<ListResponse<Goal>> {
    let httpParams = new HttpParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        httpParams = httpParams.set(key, String(value));
      }
    });
    return this.http.get<ListResponse<Goal>>(`${this.baseUrl}/goals`, { params: httpParams });
  }

  getGoalById(id: number): Observable<DetailResponse<Goal>> {
    return this.http.get<DetailResponse<Goal>>(`${this.baseUrl}/goals/${id}`);
  }

  createGoal(data: Partial<Goal>): Observable<DetailResponse<Goal>> {
    return this.http.post<DetailResponse<Goal>>(`${this.baseUrl}/goals`, data);
  }

  updateGoal(id: number, data: Partial<Goal>): Observable<DetailResponse<Goal>> {
    return this.http.put<DetailResponse<Goal>>(`${this.baseUrl}/goals/${id}`, data);
  }

  deleteGoal(id: number): Observable<ApiResponse<Goal>> {
    return this.http.delete<ApiResponse<Goal>>(`${this.baseUrl}/goals/${id}`);
  }

  updateGoalProgress(id: number, progress: number): Observable<DetailResponse<Goal>> {
    return this.http.patch<DetailResponse<Goal>>(`${this.baseUrl}/goals/${id}/progress`, {
      progress,
    });
  }

  // Appraisal Cycles
  getAppraisalCycles(
    params: Record<string, unknown> = {},
  ): Observable<ListResponse<AppraisalCycle>> {
    let httpParams = new HttpParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        httpParams = httpParams.set(key, String(value));
      }
    });
    return this.http.get<ListResponse<AppraisalCycle>>(`${this.baseUrl}/cycles`, {
      params: httpParams,
    });
  }

  getAppraisalCycleById(id: number): Observable<DetailResponse<AppraisalCycle>> {
    return this.http.get<DetailResponse<AppraisalCycle>>(`${this.baseUrl}/cycles/${id}`);
  }

  createAppraisalCycle(data: Partial<AppraisalCycle>): Observable<DetailResponse<AppraisalCycle>> {
    return this.http.post<DetailResponse<AppraisalCycle>>(`${this.baseUrl}/cycles`, data);
  }

  updateAppraisalCycle(
    id: number,
    data: Partial<AppraisalCycle>,
  ): Observable<DetailResponse<AppraisalCycle>> {
    return this.http.put<DetailResponse<AppraisalCycle>>(`${this.baseUrl}/cycles/${id}`, data);
  }

  deleteAppraisalCycle(id: number): Observable<ApiResponse<AppraisalCycle>> {
    return this.http.delete<ApiResponse<AppraisalCycle>>(`${this.baseUrl}/cycles/${id}`);
  }

  activateCycle(id: number): Observable<ApiResponse<AppraisalCycle>> {
    return this.http.post<ApiResponse<AppraisalCycle>>(`${this.baseUrl}/cycles/${id}/activate`, {});
  }

  lockCycle(id: number): Observable<ApiResponse<AppraisalCycle>> {
    return this.http.post<ApiResponse<AppraisalCycle>>(`${this.baseUrl}/cycles/${id}/lock`, {});
  }

  // Appraisals
  getAppraisals(params: Record<string, unknown> = {}): Observable<ListResponse<Appraisal>> {
    let httpParams = new HttpParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        httpParams = httpParams.set(key, String(value));
      }
    });
    return this.http.get<ListResponse<Appraisal>>(`${this.baseUrl}/appraisals`, {
      params: httpParams,
    });
  }

  getAppraisalById(id: number): Observable<DetailResponse<Appraisal>> {
    return this.http.get<DetailResponse<Appraisal>>(`${this.baseUrl}/appraisals/${id}`);
  }

  submitSelfReview(
    appraisalId: number,
    reviewData: ReviewData,
  ): Observable<ApiResponse<Appraisal>> {
    return this.http.post<ApiResponse<Appraisal>>(
      `${this.baseUrl}/appraisals/${appraisalId}/self-review`,
      reviewData,
    );
  }

  submitManagerReview(
    appraisalId: number,
    reviewData: ReviewData,
  ): Observable<ApiResponse<Appraisal>> {
    return this.http.post<ApiResponse<Appraisal>>(
      `${this.baseUrl}/appraisals/${appraisalId}/manager-review`,
      reviewData,
    );
  }

  submitSkipLevelReview(
    appraisalId: number,
    reviewData: ReviewData,
  ): Observable<ApiResponse<Appraisal>> {
    return this.http.post<ApiResponse<Appraisal>>(
      `${this.baseUrl}/appraisals/${appraisalId}/skip-level-review`,
      reviewData,
    );
  }

  // KRAs
  getKRAs(params: Record<string, unknown> = {}): Observable<ListResponse<KRA>> {
    let httpParams = new HttpParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        httpParams = httpParams.set(key, String(value));
      }
    });
    return this.http.get<ListResponse<KRA>>(`${this.baseUrl}/kras`, { params: httpParams });
  }

  createKRA(data: Partial<KRA>): Observable<DetailResponse<KRA>> {
    return this.http.post<DetailResponse<KRA>>(`${this.baseUrl}/kras`, data);
  }

  updateKRA(id: number, data: Partial<KRA>): Observable<DetailResponse<KRA>> {
    return this.http.put<DetailResponse<KRA>>(`${this.baseUrl}/kras/${id}`, data);
  }

  deleteKRA(id: number): Observable<ApiResponse<KRA>> {
    return this.http.delete<ApiResponse<KRA>>(`${this.baseUrl}/kras/${id}`);
  }

  // KPIs
  getKPIs(params: Record<string, unknown> = {}): Observable<ListResponse<KPI>> {
    let httpParams = new HttpParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        httpParams = httpParams.set(key, String(value));
      }
    });
    return this.http.get<ListResponse<KPI>>(`${this.baseUrl}/kpis`, { params: httpParams });
  }

  createKPI(data: Partial<KPI>): Observable<DetailResponse<KPI>> {
    return this.http.post<DetailResponse<KPI>>(`${this.baseUrl}/kpis`, data);
  }

  updateKPI(id: number, data: Partial<KPI>): Observable<DetailResponse<KPI>> {
    return this.http.put<DetailResponse<KPI>>(`${this.baseUrl}/kpis/${id}`, data);
  }

  deleteKPI(id: number): Observable<ApiResponse<KPI>> {
    return this.http.delete<ApiResponse<KPI>>(`${this.baseUrl}/kpis/${id}`);
  }

  // Training Records
  getTrainingRecords(
    params: Record<string, unknown> = {},
  ): Observable<ListResponse<TrainingRecord>> {
    let httpParams = new HttpParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        httpParams = httpParams.set(key, String(value));
      }
    });
    return this.http.get<ListResponse<TrainingRecord>>(`${this.baseUrl}/training`, {
      params: httpParams,
    });
  }

  createTrainingRecord(data: Partial<TrainingRecord>): Observable<DetailResponse<TrainingRecord>> {
    return this.http.post<DetailResponse<TrainingRecord>>(`${this.baseUrl}/training`, data);
  }

  updateTrainingRecord(
    id: number,
    data: Partial<TrainingRecord>,
  ): Observable<DetailResponse<TrainingRecord>> {
    return this.http.put<DetailResponse<TrainingRecord>>(`${this.baseUrl}/training/${id}`, data);
  }

  deleteTrainingRecord(id: number): Observable<ApiResponse<TrainingRecord>> {
    return this.http.delete<ApiResponse<TrainingRecord>>(`${this.baseUrl}/training/${id}`);
  }

  // Succession Plans
  getSuccessionPlans(
    params: Record<string, unknown> = {},
  ): Observable<ListResponse<SuccessionPlan>> {
    let httpParams = new HttpParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        httpParams = httpParams.set(key, String(value));
      }
    });
    return this.http.get<ListResponse<SuccessionPlan>>(`${this.baseUrl}/succession`, {
      params: httpParams,
    });
  }

  createSuccessionPlan(data: Partial<SuccessionPlan>): Observable<DetailResponse<SuccessionPlan>> {
    return this.http.post<DetailResponse<SuccessionPlan>>(`${this.baseUrl}/succession`, data);
  }

  updateSuccessionPlan(
    id: number,
    data: Partial<SuccessionPlan>,
  ): Observable<DetailResponse<SuccessionPlan>> {
    return this.http.put<DetailResponse<SuccessionPlan>>(`${this.baseUrl}/succession/${id}`, data);
  }

  deleteSuccessionPlan(id: number): Observable<ApiResponse<SuccessionPlan>> {
    return this.http.delete<ApiResponse<SuccessionPlan>>(`${this.baseUrl}/succession/${id}`);
  }
}
