import { Injectable, inject, signal, computed } from '@angular/core';
import { Observable, tap, catchError, finalize, of } from 'rxjs';
import { PerformanceApiService } from './performance-api.service';
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
  CycleStatus,
} from '../models/performance.model';
import { RbacService } from '../../../core/services/rbac.service';
import { Permission } from '../../../core/models/rbac.models';
import { BaseStore } from '../../../core/stores/base.store';

@Injectable({ providedIn: 'root' })
export class PerformanceStore extends BaseStore<Goal> {
  private readonly api = inject(PerformanceApiService);
  private readonly rbacService = inject(RbacService);

  private readonly _cycles = signal<PerformanceCycle[]>([]);
  private readonly _selectedCycle = signal<PerformanceCycle | null>(null);
  private readonly _selfRatings = signal<SelfRating[]>([]);
  private readonly _managerRatings = signal<ManagerRating[]>([]);
  private readonly _overallRatings = signal<OverallRating[]>([]);
  private readonly _selectedOverallRating = signal<OverallRating | null>(null);
  private readonly _annualSummaries = signal<AnnualSummary[]>([]);
  private readonly _selectedAnnualSummary = signal<AnnualSummary | null>(null);

  readonly cycles = this._cycles.asReadonly();
  readonly selectedCycle = this._selectedCycle.asReadonly();
  readonly selfRatings = this._selfRatings.asReadonly();
  readonly managerRatings = this._managerRatings.asReadonly();
  readonly overallRatings = this._overallRatings.asReadonly();
  readonly selectedOverallRating = this._selectedOverallRating.asReadonly();
  readonly annualSummaries = this._annualSummaries.asReadonly();
  readonly selectedAnnualSummary = this._selectedAnnualSummary.asReadonly();

  readonly canCreate = computed(() => this.rbacService.hasPermission(Permission.CREATE));
  readonly canEdit = computed(() => this.rbacService.hasPermission(Permission.EDIT));
  readonly canDelete = computed(() => this.rbacService.hasPermission(Permission.DELETE));
  readonly canManage = computed(() => this.rbacService.hasPermission(Permission.MANAGE));

  // Cycles methods
  loadCycles(params?: Record<string, unknown>): void {
    this.setLoading(true);
    this._error.set(null);

    const queryParams = {
      page: this.page(),
      limit: this.limit(),
      ...params,
    };

    this.api.getCycles(queryParams).subscribe({
      next: (response) => {
        if (response.success) {
          this._cycles.set(response.data || []);
        } else {
          this.setError(response.message || 'Failed to load cycles');
        }
        this.setLoading(false);
      },
      error: (err) => {
        this.setError(err.error?.message || 'An error occurred');
        this.setLoading(false);
      },
    });
  }

  loadCycleById(id: number): void {
    this.setLoading(true);
    this.api.getCycleById(id).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this._selectedCycle.set(response.data);
        }
        this.setLoading(false);
      },
      error: (err) => {
        this.setError(err.error?.message || 'An error occurred');
        this.setLoading(false);
      },
    });
  }

  createCycle(data: CreateCycleDto): Observable<any> {
    this.setLoading(true);
    return this.api.createCycle(data).pipe(
      tap((response) => {
        if (response.success && response.data) {
          this._cycles.update((list) => [...list, response.data as PerformanceCycle]);
        }
      }),
      catchError((err) => {
        this.setError(err.error?.message || 'An error occurred');
        return of({ success: false, message: err.error?.message });
      }),
      finalize(() => this.setLoading(false)),
    );
  }

  updateCycle(id: number, data: UpdateCycleDto): Observable<any> {
    this.setLoading(true);
    return this.api.updateCycle(id, data).pipe(
      tap((response) => {
        if (response.success && response.data) {
          this._cycles.update((list) =>
            list.map((c) => (c.id === id ? (response.data as PerformanceCycle) : c)),
          );
        }
      }),
      catchError((err) => {
        this.setError(err.error?.message || 'An error occurred');
        return of({ success: false, message: err.error?.message });
      }),
      finalize(() => this.setLoading(false)),
    );
  }

  updateCycleStatus(id: number, data: UpdateCycleStatusDto): Observable<any> {
    this.setLoading(true);
    return this.api.updateCycleStatus(id, data).pipe(
      tap((response) => {
        if (response.success) {
          this._cycles.update((list) =>
            list.map((c) => (c.id === id ? { ...c, status: data.status as CycleStatus } : c)),
          );
        }
      }),
      catchError((err) => {
        this.setError(err.error?.message || 'An error occurred');
        return of({ success: false, message: err.error?.message });
      }),
      finalize(() => this.setLoading(false)),
    );
  }

  checkCycleStatuses(): Observable<any> {
    this.setLoading(true);
    return this.api.checkCycleStatuses().pipe(
      tap(() => {
        this.loadCycles();
      }),
      catchError((err) => {
        this.setError(err.error?.message || 'An error occurred');
        return of({ success: false, message: err.error?.message });
      }),
      finalize(() => this.setLoading(false)),
    );
  }

  // Goals methods
  loadGoals(params?: Record<string, unknown>): void {
    this.setLoading(true);
    this._error.set(null);

    const queryParams = {
      ...this.filters(),
      page: this.page(),
      limit: this.limit(),
      ...params,
    };

    this.api.getGoals(queryParams).subscribe({
      next: (response) => {
        if (response.success) {
          this.setItems(response.data || []);
          this.updatePaginationResponse(response);
        } else {
          this.setError(response.message || 'Failed to load goals');
        }
        this.setLoading(false);
      },
      error: (err) => {
        this.setError(err.error?.message || 'An error occurred');
        this.setLoading(false);
      },
    });
  }

  loadGoalsByCycleAndEmployee(cycleId: number, employeeId: number): void {
    this.setLoading(true);
    this.api.getGoalsByCycleAndEmployee(cycleId, employeeId).subscribe({
      next: (response) => {
        if (response.success) {
          this.setItems(response.data || []);
        }
        this.setLoading(false);
      },
      error: (err) => {
        this.setError(err.error?.message || 'An error occurred');
        this.setLoading(false);
      },
    });
  }

  loadGoalsWithRatings(cycleId: number, employeeId: number): void {
    this.setLoading(true);
    this.api.getGoalsWithRatingsByCycleAndEmployee(cycleId, employeeId).subscribe({
      next: (response) => {
        if (response.success) {
          this.setItems(response.data || []);
        }
        this.setLoading(false);
      },
      error: (err) => {
        this.setError(err.error?.message || 'An error occurred');
        this.setLoading(false);
      },
    });
  }

  createGoal(data: CreateGoalDto): Observable<any> {
    this.setLoading(true);
    return this.api.createGoal(data).pipe(
      tap((response) => {
        if (response.success && response.data) {
          this.addItemToList(response.data as Goal);
        }
      }),
      catchError((err) => {
        this.setError(err.error?.message || 'An error occurred');
        return of({ success: false, message: err.error?.message });
      }),
      finalize(() => this.setLoading(false)),
    );
  }

  updateGoal(id: number, data: UpdateGoalDto): Observable<any> {
    this.setLoading(true);
    return this.api.updateGoal(id, data).pipe(
      tap((response) => {
        if (response.success && response.data) {
          this.updateItemInList(response.data as Goal);
        }
      }),
      catchError((err) => {
        this.setError(err.error?.message || 'An error occurred');
        return of({ success: false, message: err.error?.message });
      }),
      finalize(() => this.setLoading(false)),
    );
  }

  deleteGoal(id: number): Observable<any> {
    return this.api.deleteGoal(id).pipe(
      tap((response) => {
        if (response.success) {
          this.removeItemFromList(id);
        }
      }),
    );
  }

  // Self Ratings methods
  submitSelfRating(goalId: number, data: CreateSelfRatingDto): Observable<any> {
    this.setLoading(true);
    return this.api.submitSelfRating(goalId, data).pipe(
      tap((response) => {
        if (response.success && response.data) {
          this._selfRatings.update((list) => [...list, response.data as SelfRating]);
          this._items.update((items) =>
            items.map((g) =>
              g.id === goalId ? { ...g, self_rating: response.data as SelfRating } : g,
            ),
          );
        }
      }),
      catchError((err) => {
        this.setError(err.error?.message || 'An error occurred');
        return of({ success: false, message: err.error?.message });
      }),
      finalize(() => this.setLoading(false)),
    );
  }

  submitAllSelfRatings(cycleId: number): Observable<any> {
    this.setLoading(true);
    return this.api.submitAllSelfRatings(cycleId).pipe(
      catchError((err) => {
        this.setError(err.error?.message || 'An error occurred');
        return of({ success: false, message: err.error?.message });
      }),
      finalize(() => this.setLoading(false)),
    );
  }

  loadSelfRatings(cycleId: number, employeeId: number): void {
    this.setLoading(true);
    this.api.getSelfRatingsByCycleAndEmployee(cycleId, employeeId).subscribe({
      next: (response) => {
        if (response.success) {
          this._selfRatings.set(response.data || []);
        }
        this.setLoading(false);
      },
      error: (err) => {
        this.setError(err.error?.message || 'An error occurred');
        this.setLoading(false);
      },
    });
  }

  // Manager Ratings methods
  submitManagerRating(goalId: number, data: CreateManagerRatingDto): Observable<any> {
    this.setLoading(true);
    return this.api.submitManagerRating(goalId, data).pipe(
      tap((response) => {
        if (response.success && response.data) {
          this._managerRatings.update((list) => [...list, response.data as ManagerRating]);
          this._items.update((items) =>
            items.map((g) =>
              g.id === goalId ? { ...g, manager_rating: response.data as ManagerRating } : g,
            ),
          );
        }
      }),
      catchError((err) => {
        this.setError(err.error?.message || 'An error occurred');
        return of({ success: false, message: err.error?.message });
      }),
      finalize(() => this.setLoading(false)),
    );
  }

  submitAllManagerRatings(cycleId: number): Observable<any> {
    this.setLoading(true);
    return this.api.submitAllManagerRatings(cycleId).pipe(
      catchError((err) => {
        this.setError(err.error?.message || 'An error occurred');
        return of({ success: false, message: err.error?.message });
      }),
      finalize(() => this.setLoading(false)),
    );
  }

  loadManagerRatings(cycleId: number, employeeId: number): void {
    this.setLoading(true);
    this.api.getManagerRatingsByCycleAndEmployee(cycleId, employeeId).subscribe({
      next: (response) => {
        if (response.success) {
          this._managerRatings.set(response.data || []);
        }
        this.setLoading(false);
      },
      error: (err) => {
        this.setError(err.error?.message || 'An error occurred');
        this.setLoading(false);
      },
    });
  }

  // Overall Ratings methods
  loadOverallRatings(params?: Record<string, unknown>): void {
    this.setLoading(true);
    this.api.getOverallRatings(params || {}).subscribe({
      next: (response) => {
        if (response.success) {
          this._overallRatings.set(response.data || []);
        }
        this.setLoading(false);
      },
      error: (err) => {
        this.setError(err.error?.message || 'An error occurred');
        this.setLoading(false);
      },
    });
  }

  loadOverallRatingByCycleAndEmployee(cycleId: number, employeeId: number): void {
    this.setLoading(true);
    this.api.getOverallRatingByCycleAndEmployee(cycleId, employeeId).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this._selectedOverallRating.set(response.data);
        }
        this.setLoading(false);
      },
      error: (err) => {
        this.setError(err.error?.message || 'An error occurred');
        this.setLoading(false);
      },
    });
  }

  updateOverallRating(
    cycleId: number,
    employeeId: number,
    data: UpdateOverallRatingDto,
  ): Observable<any> {
    this.setLoading(true);
    return this.api.updateOverallRating(cycleId, employeeId, data).pipe(
      tap((response) => {
        if (response.success && response.data) {
          this._selectedOverallRating.set(response.data);
          this._overallRatings.update((list) =>
            list.map((r) =>
              r.cycle_id === cycleId && r.employee_id === employeeId
                ? (response.data as OverallRating)
                : r,
            ),
          );
        }
      }),
      catchError((err) => {
        this.setError(err.error?.message || 'An error occurred');
        return of({ success: false, message: err.error?.message });
      }),
      finalize(() => this.setLoading(false)),
    );
  }

  approveOverallRating(cycleId: number, employeeId: number): Observable<any> {
    this.setLoading(true);
    return this.api.approveOverallRating(cycleId, employeeId).pipe(
      tap((response) => {
        if (response.success) {
          this._selectedOverallRating.update((r) => (r ? { ...r, is_approved: true } : null));
          this._overallRatings.update((list) =>
            list.map((r) =>
              r.cycle_id === cycleId && r.employee_id === employeeId
                ? { ...r, is_approved: true }
                : r,
            ),
          );
        }
      }),
      catchError((err) => {
        this.setError(err.error?.message || 'An error occurred');
        return of({ success: false, message: err.error?.message });
      }),
      finalize(() => this.setLoading(false)),
    );
  }

  // Annual Summaries methods
  loadAnnualSummaries(params?: Record<string, unknown>): void {
    this.setLoading(true);
    this.api.getAnnualSummaries(params || {}).subscribe({
      next: (response) => {
        if (response.success) {
          this._annualSummaries.set(response.data || []);
        }
        this.setLoading(false);
      },
      error: (err) => {
        this.setError(err.error?.message || 'An error occurred');
        this.setLoading(false);
      },
    });
  }

  loadAnnualSummary(fiscalYear: number, employeeId: number): void {
    this.setLoading(true);
    this.api.getAnnualSummaryByYearAndEmployee(fiscalYear, employeeId).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this._selectedAnnualSummary.set(response.data);
        }
        this.setLoading(false);
      },
      error: (err) => {
        this.setError(err.error?.message || 'An error occurred');
        this.setLoading(false);
      },
    });
  }

  generateAnnualSummary(fiscalYear: number, employeeId: number): Observable<any> {
    this.setLoading(true);
    return this.api.generateAnnualSummary(fiscalYear, employeeId).pipe(
      tap((response) => {
        if (response.success && response.data) {
          this._annualSummaries.update((list) => [...list, response.data as AnnualSummary]);
        }
      }),
      catchError((err) => {
        this.setError(err.error?.message || 'An error occurred');
        return of({ success: false, message: err.error?.message });
      }),
      finalize(() => this.setLoading(false)),
    );
  }

  approveAnnualSummary(fiscalYear: number, employeeId: number): Observable<any> {
    this.setLoading(true);
    return this.api.approveAnnualSummary(fiscalYear, employeeId).pipe(
      tap((response) => {
        if (response.success) {
          this._selectedAnnualSummary.update((s) => (s ? { ...s, is_approved: true } : null));
          this._annualSummaries.update((list) =>
            list.map((s) =>
              s.fiscal_year === fiscalYear && s.employee_id === employeeId
                ? { ...s, is_approved: true }
                : s,
            ),
          );
        }
      }),
      catchError((err) => {
        this.setError(err.error?.message || 'An error occurred');
        return of({ success: false, message: err.error?.message });
      }),
      finalize(() => this.setLoading(false)),
    );
  }

  // Admin
  processNotifications(): Observable<any> {
    this.setLoading(true);
    return this.api.processNotifications().pipe(
      catchError((err) => {
        this.setError(err.error?.message || 'An error occurred');
        return of({ success: false, message: err.error?.message });
      }),
      finalize(() => this.setLoading(false)),
    );
  }

  override setFilters(filters: Record<string, unknown>): void {
    super.setFilters(filters);
    this.loadGoals({ ...filters, page: 1 });
  }

  override reset(): void {
    super.reset();
    this._cycles.set([]);
    this._selectedCycle.set(null);
    this._selfRatings.set([]);
    this._managerRatings.set([]);
    this._overallRatings.set([]);
    this._selectedOverallRating.set(null);
    this._annualSummaries.set([]);
    this._selectedAnnualSummary.set(null);
  }
}
