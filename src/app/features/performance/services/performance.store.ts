import { Injectable, inject, signal, computed } from '@angular/core';
import { Observable, tap, catchError, finalize, of } from 'rxjs';
import { PerformanceApiService } from './performance-api.service';
import {
  Goal,
  GoalStatus,
  Appraisal,
  AppraisalStatus,
  KRA,
  KPI,
  TrainingRecord,
  AppraisalCycle,
  ReviewData,
} from '../models/performance.model';
import { RbacService } from '../../../core/services/rbac.service';
import { Permission } from '../../../core/models/rbac.models';
import { BaseStore } from '../../../core/stores/base.store';

@Injectable({ providedIn: 'root' })
export class PerformanceStore extends BaseStore<Goal> {
  private readonly api = inject(PerformanceApiService);
  private readonly rbacService = inject(RbacService);

  private readonly _appraisals = signal<Appraisal[]>([]);
  private readonly _selectedAppraisal = signal<Appraisal | null>(null);
  private readonly _cycles = signal<AppraisalCycle[]>([]);
  private readonly _kras = signal<KRA[]>([]);
  private readonly _kpis = signal<KPI[]>([]);
  private readonly _trainingRecords = signal<TrainingRecord[]>([]);

  readonly appraisals = this._appraisals.asReadonly();
  readonly selectedAppraisal = this._selectedAppraisal.asReadonly();
  readonly cycles = this._cycles.asReadonly();
  readonly kras = this._kras.asReadonly();
  readonly kpis = this._kpis.asReadonly();
  readonly trainingRecords = this._trainingRecords.asReadonly();

  readonly canCreate = computed(() => this.rbacService.hasPermission(Permission.CREATE));
  readonly canEdit = computed(() => this.rbacService.hasPermission(Permission.EDIT));
  readonly canDelete = computed(() => this.rbacService.hasPermission(Permission.DELETE));
  readonly canManage = computed(() => this.rbacService.hasPermission(Permission.MANAGE));

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

  createGoal(data: Partial<Goal>): Observable<any> {
    this.setLoading(true);
    return this.api.createGoal(data).pipe(
      tap((response) => {
        if (response.success && response.data) {
          this.addItemToList(response.data as Goal);
        } else {
          this.setError(response.message || 'Failed to create goal');
        }
      }),
      catchError((err) => {
        this.setError(err.error?.message || 'An error occurred');
        return of({ success: false, message: err.error?.message });
      }),
      finalize(() => this.setLoading(false)),
    );
  }

  updateGoal(id: number, data: Partial<Goal>): Observable<any> {
    this.setLoading(true);
    return this.api.updateGoal(id, data).pipe(
      tap((response) => {
        if (response.success) {
          this.updateItemInList({ id, ...data } as Goal);
        }
      }),
      catchError((err) => of({ success: false, message: err.error?.message })),
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

  updateProgress(id: number, progress: number): Observable<any> {
    return this.api.updateGoalProgress(id, progress).pipe(
      tap((response) => {
        if (response.success) {
          this.updateItemInList({ id, progress } as Goal);
        }
      }),
    );
  }

  // Appraisals methods
  loadAppraisals(params?: Record<string, unknown>): void {
    this.setLoading(true);
    this.api.getAppraisals(params || {}).subscribe({
      next: (response) => {
        if (response.success) {
          this._appraisals.set(response.data || []);
        }
        this.setLoading(false);
      },
      error: () => {
        this.setLoading(false);
      },
    });
  }

  submitSelfReview(appraisalId: number, reviewData: ReviewData): Observable<any> {
    this.setLoading(true);
    return this.api.submitSelfReview(appraisalId, reviewData).pipe(
      tap((response) => {
        if (response.success) {
          this._appraisals.update((list) =>
            list.map((a) =>
              a.id === appraisalId
                ? { ...a, status: AppraisalStatus.MANAGER_REVIEW, selfReview: reviewData }
                : a,
            ),
          );
        }
      }),
      catchError((err) => of({ success: false, message: err.error?.message })),
      finalize(() => this.setLoading(false)),
    );
  }

  submitManagerReview(appraisalId: number, reviewData: ReviewData): Observable<any> {
    this.setLoading(true);
    return this.api.submitManagerReview(appraisalId, reviewData).pipe(
      tap((response) => {
        if (response.success) {
          this._appraisals.update((list) =>
            list.map((a) =>
              a.id === appraisalId
                ? { ...a, status: AppraisalStatus.SKIP_LEVEL_REVIEW, managerReview: reviewData }
                : a,
            ),
          );
        }
      }),
      catchError((err) => of({ success: false, message: err.error?.message })),
      finalize(() => this.setLoading(false)),
    );
  }

  // Cycles methods
  loadCycles(params?: Record<string, unknown>): void {
    this.setLoading(true);
    this.api.getAppraisalCycles(params || {}).subscribe({
      next: (response) => {
        if (response.success) {
          this._cycles.set(response.data || []);
        }
        this.setLoading(false);
      },
      error: () => {
        this.setLoading(false);
      },
    });
  }

  createCycle(data: Partial<AppraisalCycle>): Observable<any> {
    this.setLoading(true);
    return this.api.createAppraisalCycle(data).pipe(
      tap((response) => {
        if (response.success && response.data) {
          this._cycles.update((list) => [...list, response.data as AppraisalCycle]);
        }
      }),
      catchError((err) => of({ success: false, message: err.error?.message })),
      finalize(() => this.setLoading(false)),
    );
  }

  updateCycle(id: number, data: Partial<AppraisalCycle>): Observable<any> {
    this.setLoading(true);
    return this.api.updateAppraisalCycle(id, data).pipe(
      tap((response) => {
        if (response.success) {
          this._cycles.update((list) => list.map((c) => (c.id === id ? { ...c, ...data } : c)));
        }
      }),
      catchError((err) => of({ success: false, message: err.error?.message })),
      finalize(() => this.setLoading(false)),
    );
  }

  deleteCycle(id: number): Observable<any> {
    return this.api.deleteAppraisalCycle(id).pipe(
      tap((response) => {
        if (response.success) {
          this._cycles.update((list) => list.filter((c) => c.id !== id));
        }
      }),
    );
  }

  activateCycle(id: number): Observable<any> {
    this.setLoading(true);
    return this.api.activateCycle(id).pipe(
      tap((response) => {
        if (response.success) {
          this._cycles.update((list) =>
            list.map((c) => (c.id === id ? { ...c, status: 'active' as const } : c)),
          );
        }
      }),
      catchError((err) => of({ success: false, message: err.error?.message })),
      finalize(() => this.setLoading(false)),
    );
  }

  lockCycle(id: number): Observable<any> {
    this.setLoading(true);
    return this.api.lockCycle(id).pipe(
      tap((response) => {
        if (response.success) {
          this._cycles.update((list) =>
            list.map((c) => (c.id === id ? { ...c, status: 'locked' as const } : c)),
          );
        }
      }),
      catchError((err) => of({ success: false, message: err.error?.message })),
      finalize(() => this.setLoading(false)),
    );
  }

  // KRAs methods
  loadKRAs(params?: Record<string, unknown>): void {
    this.api.getKRAs(params || {}).subscribe({
      next: (response) => {
        if (response.success) {
          this._kras.set(response.data || []);
        }
      },
    });
  }

  // KPIs methods
  loadKPIs(params?: Record<string, unknown>): void {
    this.api.getKPIs(params || {}).subscribe({
      next: (response) => {
        if (response.success) {
          this._kpis.set(response.data || []);
        }
      },
    });
  }

  // Training Records methods
  loadTrainingRecords(params?: Record<string, unknown>): void {
    this.setLoading(true);
    this.api.getTrainingRecords(params || {}).subscribe({
      next: (response) => {
        if (response.success) {
          this._trainingRecords.set(response.data || []);
        }
        this.setLoading(false);
      },
      error: () => {
        this.setLoading(false);
      },
    });
  }

  createTrainingRecord(data: Partial<TrainingRecord>): Observable<any> {
    this.setLoading(true);
    return this.api.createTrainingRecord(data).pipe(
      tap((response) => {
        if (response.success && response.data) {
          this._trainingRecords.update((list) => [...list, response.data as TrainingRecord]);
        }
      }),
      catchError((err) => of({ success: false, message: err.error?.message })),
      finalize(() => this.setLoading(false)),
    );
  }

  updateTrainingRecord(id: number, data: Partial<TrainingRecord>): Observable<any> {
    this.setLoading(true);
    return this.api.updateTrainingRecord(id, data).pipe(
      tap((response) => {
        if (response.success) {
          this._trainingRecords.update((list) =>
            list.map((t) => (t.id === id ? { ...t, ...data } : t)),
          );
        }
      }),
      catchError((err) => of({ success: false, message: err.error?.message })),
      finalize(() => this.setLoading(false)),
    );
  }

  deleteTrainingRecord(id: number): Observable<any> {
    return this.api.deleteTrainingRecord(id).pipe(
      tap((response) => {
        if (response.success) {
          this._trainingRecords.update((list) => list.filter((t) => t.id !== id));
        }
      }),
    );
  }

  override setFilters(filters: Record<string, unknown>): void {
    super.setFilters(filters);
    this.loadGoals({ ...filters, page: 1 });
  }

  override reset(): void {
    super.reset();
    this._appraisals.set([]);
    this._selectedAppraisal.set(null);
    this._cycles.set([]);
    this._kras.set([]);
    this._kpis.set([]);
    this._trainingRecords.set([]);
  }
}
