import { Injectable, inject, signal, computed } from '@angular/core';
import { Observable, tap, catchError, finalize, of } from 'rxjs';
import { GradeApiService } from './grade-api.service';
import { Grade, GradeFilters } from '../models/grade.model';
import { RbacService } from '../../../../core/services/rbac.service';
import { Permission } from '../../../../core/models/rbac.models';

@Injectable({ providedIn: 'root' })
export class GradeStore {
  private readonly api = inject(GradeApiService);
  private readonly rbacService = inject(RbacService);

  private readonly _grades = signal<Grade[]>([]);
  private readonly _selectedGrade = signal<Grade | null>(null);
  private readonly _loading = signal<boolean>(false);
  private readonly _error = signal<string | null>(null);
  private readonly _filters = signal<GradeFilters>({});
  private readonly _pagination = signal({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  readonly grades = this._grades.asReadonly();
  readonly selectedGrade = this._selectedGrade.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly error = this._error.asReadonly();
  readonly filters = this._filters.asReadonly();
  readonly pagination = this._pagination.asReadonly();

  readonly page = computed(() => this._pagination().page);
  readonly limit = computed(() => this._pagination().limit);
  readonly total = computed(() => this._pagination().total);
  readonly hasData = computed(() => this._grades().length > 0);

  readonly canCreate = computed(() => this.rbacService.hasPermission(Permission.CREATE));
  readonly canEdit = computed(() => this.rbacService.hasPermission(Permission.EDIT));
  readonly canDelete = computed(() => this.rbacService.hasPermission(Permission.DELETE));

  loadGrades(params?: Partial<GradeFilters & { page: number; limit: number }>): void {
    this._loading.set(true);
    this._error.set(null);

    const queryParams = {
      ...this._filters(),
      page: params?.page || this._pagination().page,
      limit: params?.limit || this._pagination().limit,
      ...params,
    };

    this.api.list(queryParams).subscribe({
      next: (response) => {
        console.log('API Response:', JSON.stringify(response));

        const isSuccess = response && (response.success === true || response.success === undefined);
        const data = response?.data || [];

        if (isSuccess && Array.isArray(data)) {
          this._grades.set(data);

          if (response?.pagination) {
            this._pagination.set({
              page: response.pagination.page,
              limit: response.pagination.limit,
              total: response.pagination.total,
              totalPages: response.pagination.totalPages,
            });
          } else {
            const total = (response as any).total || data.length;
            const page = (response as any).page || queryParams['page'] || 1;
            const limit = (response as any).limit || queryParams['limit'] || 10;
            this._pagination.set({
              page: Number(page),
              limit: Number(limit),
              total: Number(total),
              totalPages: Math.ceil(Number(total) / Number(limit)),
            });
          }
        } else {
          this._error.set((response as any)?.message || 'Failed to load grades');
        }
        this._loading.set(false);
      },
      error: (err) => {
        console.error('API Error:', err);
        this._error.set(err.error?.message || err.message || 'An error occurred');
        this._loading.set(false);
      },
    });
  }

  loadGradeById(id: number): void {
    this._loading.set(true);
    this._error.set(null);

    this.api.getById(id).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this._selectedGrade.set(response.data);
        } else {
          this._error.set(response.message || 'Failed to load grade');
        }
        this._loading.set(false);
      },
      error: (err) => {
        this._error.set(err.error?.message || 'An error occurred');
        this._loading.set(false);
      },
    });
  }

  createGrade(data: Partial<Grade>): Observable<any> {
    this._loading.set(true);
    return this.api.create(data).pipe(
      tap((response) => {
        if (response.success) {
          this._loading.set(false);
        } else {
          this._error.set(response.message || 'Failed to create grade');
        }
      }),
      catchError((err) => {
        this._error.set(err.error?.message || 'An error occurred');
        return of({ success: false, message: err.error?.message });
      }),
      finalize(() => this._loading.set(false)),
    );
  }

  updateGrade(id: number, data: Partial<Grade>): Observable<any> {
    this._loading.set(true);
    return this.api.update(id, data).pipe(
      tap((response) => {
        if (response.success) {
          this._loading.set(false);
        } else {
          this._error.set(response.message || 'Failed to update grade');
        }
      }),
      catchError((err) => {
        this._error.set(err.error?.message || 'An error occurred');
        return of({ success: false, message: err.error?.message });
      }),
      finalize(() => this._loading.set(false)),
    );
  }

  deleteGrade(id: number): Observable<any> {
    this._loading.set(true);
    return this.api.updateStatus(id, 'inactive').pipe(
      tap((response) => {
        if (response.success) {
          this._grades.update((list) => list.filter((g) => g.id !== id));
        } else {
          this._error.set(response.message || 'Failed to deactivate grade');
        }
      }),
      catchError((err) => {
        this._error.set(err.error?.message || 'An error occurred');
        return of({ success: false, message: err.error?.message });
      }),
      finalize(() => this._loading.set(false)),
    );
  }

  toggleStatus(id: number): Observable<any> {
    const grade = this._grades().find((g) => g.id === id);
    if (!grade) return of({ success: false, message: 'Grade not found' });

    const newStatus = grade.status === 'active' ? 'inactive' : 'active';
    this._loading.set(true);
    return this.api.updateStatus(id, newStatus).pipe(
      tap((response) => {
        if (response.success) {
          this._grades.update((list) =>
            list.map((g) => (g.id === id ? { ...g, status: newStatus } : g)),
          );
        } else {
          this._error.set(response.message || 'Failed to update status');
        }
      }),
      catchError((err) => {
        this._error.set(err.error?.message || 'An error occurred');
        return of({ success: false, message: err.error?.message });
      }),
      finalize(() => this._loading.set(false)),
    );
  }

  setFilters(filters: GradeFilters): void {
    this._filters.set(filters);
    this.loadGrades({ ...filters, page: 1 });
  }

  clearFilters(): void {
    this._filters.set({});
    this.loadGrades();
  }

  setSelectedGrade(grade: Grade | null): void {
    this._selectedGrade.set(grade);
  }

  reset(): void {
    this._grades.set([]);
    this._selectedGrade.set(null);
    this._loading.set(false);
    this._error.set(null);
    this._filters.set({});
    this._pagination.set({ page: 1, limit: 10, total: 0, totalPages: 0 });
  }
}
