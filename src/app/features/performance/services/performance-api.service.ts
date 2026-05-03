import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
  PerformanceCycle,
  Goal,
  SelfRating,
  ManagerRating,
  OverallRating,
  AnnualSummary,
  CreateCycleDto,
  UpdateCycleDto,
  UpdateCycleStatusDto,
  CreateGoalDto,
  UpdateGoalDto,
  CreateSelfRatingDto,
  CreateManagerRatingDto,
  UpdateOverallRatingDto,
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

  // Performance Cycles
  getCycles(params: Record<string, unknown> = {}): Observable<ListResponse<PerformanceCycle>> {
    let httpParams = new HttpParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        httpParams = httpParams.set(key, String(value));
      }
    });
    return this.http.get<ListResponse<PerformanceCycle>>(`${this.baseUrl}/cycles`, {
      params: httpParams,
    });
  }

  getCycleById(id: number): Observable<DetailResponse<PerformanceCycle>> {
    return this.http.get<DetailResponse<PerformanceCycle>>(`${this.baseUrl}/cycles/${id}`);
  }

  createCycle(data: CreateCycleDto): Observable<DetailResponse<PerformanceCycle>> {
    return this.http.post<DetailResponse<PerformanceCycle>>(`${this.baseUrl}/cycles`, data);
  }

  updateCycle(id: number, data: UpdateCycleDto): Observable<DetailResponse<PerformanceCycle>> {
    return this.http.put<DetailResponse<PerformanceCycle>>(`${this.baseUrl}/cycles/${id}`, data);
  }

  updateCycleStatus(
    id: number,
    data: UpdateCycleStatusDto,
  ): Observable<ApiResponse<PerformanceCycle>> {
    return this.http.patch<ApiResponse<PerformanceCycle>>(
      `${this.baseUrl}/cycles/${id}/status`,
      data,
    );
  }

  // Goals
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

  createGoal(data: CreateGoalDto): Observable<DetailResponse<Goal>> {
    return this.http.post<DetailResponse<Goal>>(`${this.baseUrl}/goals`, data);
  }

  updateGoal(id: number, data: UpdateGoalDto): Observable<DetailResponse<Goal>> {
    return this.http.put<DetailResponse<Goal>>(`${this.baseUrl}/goals/${id}`, data);
  }

  deleteGoal(id: number): Observable<ApiResponse<Goal>> {
    return this.http.delete<ApiResponse<Goal>>(`${this.baseUrl}/goals/${id}`);
  }

  getGoalsByCycleAndEmployee(cycleId: number, employeeId: number): Observable<ListResponse<Goal>> {
    return this.http.get<ListResponse<Goal>>(
      `${this.baseUrl}/cycles/${cycleId}/employees/${employeeId}/goals`,
    );
  }

  getGoalsWithRatingsByCycleAndEmployee(
    cycleId: number,
    employeeId: number,
  ): Observable<ListResponse<Goal>> {
    return this.http.get<ListResponse<Goal>>(
      `${this.baseUrl}/cycles/${cycleId}/employees/${employeeId}/goals-with-ratings`,
    );
  }

  // Self Ratings
  submitSelfRating(
    goalId: number,
    data: CreateSelfRatingDto,
  ): Observable<DetailResponse<SelfRating>> {
    return this.http.post<DetailResponse<SelfRating>>(
      `${this.baseUrl}/goals/${goalId}/self-rating`,
      data,
    );
  }

  submitAllSelfRatings(cycleId: number): Observable<ApiResponse<SelfRating>> {
    return this.http.post<ApiResponse<SelfRating>>(
      `${this.baseUrl}/cycles/${cycleId}/submit-all-self-ratings`,
      {},
    );
  }

  getSelfRatingsByCycleAndEmployee(
    cycleId: number,
    employeeId: number,
  ): Observable<ListResponse<SelfRating>> {
    return this.http.get<ListResponse<SelfRating>>(
      `${this.baseUrl}/cycles/${cycleId}/employees/${employeeId}/self-ratings`,
    );
  }

  // Manager Ratings
  submitManagerRating(
    goalId: number,
    data: CreateManagerRatingDto,
  ): Observable<DetailResponse<ManagerRating>> {
    return this.http.post<DetailResponse<ManagerRating>>(
      `${this.baseUrl}/goals/${goalId}/manager-rating`,
      data,
    );
  }

  submitAllManagerRatings(cycleId: number): Observable<ApiResponse<ManagerRating>> {
    return this.http.post<ApiResponse<ManagerRating>>(
      `${this.baseUrl}/cycles/${cycleId}/submit-all-manager-ratings`,
      {},
    );
  }

  getManagerRatingsByCycleAndEmployee(
    cycleId: number,
    employeeId: number,
  ): Observable<ListResponse<ManagerRating>> {
    return this.http.get<ListResponse<ManagerRating>>(
      `${this.baseUrl}/cycles/${cycleId}/employees/${employeeId}/manager-ratings`,
    );
  }

  // Overall Ratings
  getOverallRatings(params: Record<string, unknown> = {}): Observable<ListResponse<OverallRating>> {
    let httpParams = new HttpParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        httpParams = httpParams.set(key, String(value));
      }
    });
    return this.http.get<ListResponse<OverallRating>>(`${this.baseUrl}/overall-ratings`, {
      params: httpParams,
    });
  }

  getOverallRatingByCycleAndEmployee(
    cycleId: number,
    employeeId: number,
  ): Observable<DetailResponse<OverallRating>> {
    return this.http.get<DetailResponse<OverallRating>>(
      `${this.baseUrl}/cycles/${cycleId}/employees/${employeeId}/overall-rating`,
    );
  }

  updateOverallRating(
    cycleId: number,
    employeeId: number,
    data: UpdateOverallRatingDto,
  ): Observable<DetailResponse<OverallRating>> {
    return this.http.put<DetailResponse<OverallRating>>(
      `${this.baseUrl}/cycles/${cycleId}/employees/${employeeId}/overall-rating`,
      data,
    );
  }

  approveOverallRating(
    cycleId: number,
    employeeId: number,
  ): Observable<ApiResponse<OverallRating>> {
    return this.http.patch<ApiResponse<OverallRating>>(
      `${this.baseUrl}/cycles/${cycleId}/employees/${employeeId}/overall-rating/approve`,
      {},
    );
  }

  // Annual Summaries
  getAnnualSummaries(
    params: Record<string, unknown> = {},
  ): Observable<ListResponse<AnnualSummary>> {
    let httpParams = new HttpParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        httpParams = httpParams.set(key, String(value));
      }
    });
    return this.http.get<ListResponse<AnnualSummary>>(`${this.baseUrl}/annual-summaries`, {
      params: httpParams,
    });
  }

  generateAnnualSummary(
    fiscalYear: number,
    employeeId: number,
  ): Observable<DetailResponse<AnnualSummary>> {
    return this.http.post<DetailResponse<AnnualSummary>>(
      `${this.baseUrl}/fiscal-years/${fiscalYear}/employees/${employeeId}/annual-summary`,
      {},
    );
  }

  getAnnualSummaryByYearAndEmployee(
    fiscalYear: number,
    employeeId: number,
  ): Observable<DetailResponse<AnnualSummary>> {
    return this.http.get<DetailResponse<AnnualSummary>>(
      `${this.baseUrl}/fiscal-years/${fiscalYear}/employees/${employeeId}/annual-summary`,
    );
  }

  approveAnnualSummary(
    fiscalYear: number,
    employeeId: number,
  ): Observable<ApiResponse<AnnualSummary>> {
    return this.http.patch<ApiResponse<AnnualSummary>>(
      `${this.baseUrl}/fiscal-years/${fiscalYear}/employees/${employeeId}/annual-summary/approve`,
      {},
    );
  }

  // Notifications & Admin
  processNotifications(): Observable<ApiResponse<unknown>> {
    return this.http.post<ApiResponse<unknown>>(`${this.baseUrl}/process-notifications`, {});
  }

  checkCycleStatuses(): Observable<ApiResponse<unknown>> {
    return this.http.post<ApiResponse<unknown>>(`${this.baseUrl}/check-cycle-statuses`, {});
  }
}
