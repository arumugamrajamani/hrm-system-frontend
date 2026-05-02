import { Injectable, inject, signal, computed } from '@angular/core';
import { Observable, tap, catchError, finalize, of } from 'rxjs';
import { CompanyApiService } from './company-api.service';
import { Company, CompanyFilters } from '../models/company.model';
import { RbacService } from '../../../../core/services/rbac.service';
import { Permission } from '../../../../core/models/rbac.models';

@Injectable({ providedIn: 'root' })
export class CompanyStore {
  private readonly api = inject(CompanyApiService);
  private readonly rbacService = inject(RbacService);

  private readonly _companies = signal<Company[]>([]);
  private readonly _selectedCompany = signal<Company | null>(null);
  private readonly _loading = signal<boolean>(false);
  private readonly _error = signal<string | null>(null);
  private readonly _filters = signal<CompanyFilters>({});
  private readonly _pagination = signal({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  readonly companies = this._companies.asReadonly();
  readonly selectedCompany = this._selectedCompany.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly error = this._error.asReadonly();
  readonly filters = this._filters.asReadonly();
  readonly pagination = this._pagination.asReadonly();

  readonly page = computed(() => this._pagination().page);
  readonly limit = computed(() => this._pagination().limit);
  readonly total = computed(() => this._pagination().total);
  readonly hasData = computed(() => this._companies().length > 0);

  readonly canCreate = computed(() => this.rbacService.hasPermission(Permission.CREATE));
  readonly canEdit = computed(() => this.rbacService.hasPermission(Permission.EDIT));
  readonly canDelete = computed(() => this.rbacService.hasPermission(Permission.DELETE));

  loadCompanies(params?: Partial<CompanyFilters & { page: number; limit: number }>): void {
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
          this._companies.set(data);

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
          this._error.set((response as any)?.message || 'Failed to load companies');
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

  loadCompanyById(id: number): void {
    this._loading.set(true);
    this._error.set(null);

    this.api.getById(id).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this._selectedCompany.set(response.data);
        } else {
          this._error.set(response.message || 'Failed to load company');
        }
        this._loading.set(false);
      },
      error: (err) => {
        this._error.set(err.error?.message || 'An error occurred');
        this._loading.set(false);
      },
    });
  }

  create(data: Partial<Company>): Observable<any> {
    this._loading.set(true);
    return this.api.create(data).pipe(
      tap((response) => {
        if (response.success) {
          this._loading.set(false);
        } else {
          this._error.set(response.message || 'Failed to create company');
        }
      }),
      catchError((err) => {
        this._error.set(err.error?.message || 'An error occurred');
        return of({ success: false, message: err.error?.message });
      }),
      finalize(() => this._loading.set(false)),
    );
  }

  update(id: number, data: Partial<Company>): Observable<any> {
    this._loading.set(true);
    return this.api.update(id, data).pipe(
      tap((response) => {
        if (response.success) {
          this._loading.set(false);
        } else {
          this._error.set(response.message || 'Failed to update company');
        }
      }),
      catchError((err) => {
        this._error.set(err.error?.message || 'An error occurred');
        return of({ success: false, message: err.error?.message });
      }),
      finalize(() => this._loading.set(false)),
    );
  }

  delete(id: number): Observable<any> {
    this._loading.set(true);
    return this.api.updateStatus(id, 'inactive').pipe(
      tap((response) => {
        if (response.success) {
          this._companies.update((list) => list.filter((c) => c.id !== id));
        } else {
          this._error.set(response.message || 'Failed to deactivate company');
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
    const company = this._companies().find((c) => c.id === id);
    if (!company) return of({ success: false, message: 'Company not found' });

    const newStatus = company.status === 'active' ? 'inactive' : 'active';
    this._loading.set(true);
    return this.api.updateStatus(id, newStatus).pipe(
      tap((response) => {
        if (response.success) {
          this._companies.update((list) =>
            list.map((c) => (c.id === id ? { ...c, status: newStatus } : c)),
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

  setFilters(filters: CompanyFilters): void {
    this._filters.set(filters);
    this.loadCompanies({ ...filters, page: 1 });
  }

  clearFilters(): void {
    this._filters.set({});
    this.loadCompanies();
  }

  setSelectedCompany(company: Company | null): void {
    this._selectedCompany.set(company);
  }

  reset(): void {
    this._companies.set([]);
    this._selectedCompany.set(null);
    this._loading.set(false);
    this._error.set(null);
    this._filters.set({});
    this._pagination.set({ page: 1, limit: 10, total: 0, totalPages: 0 });
  }
}
