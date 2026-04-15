import { Injectable, inject, signal, computed } from '@angular/core';
import { Observable, tap, catchError, finalize, of } from 'rxjs';
import { LocationApiService } from './location-api.service';
import { Location, LocationTree, LocationFilters } from '../models/location.model';
import { RbacService } from '../../../../core/services/rbac.service';
import { Permission } from '../../../../core/models/rbac.models';

@Injectable({ providedIn: 'root' })
export class LocationStore {
  private readonly api = inject(LocationApiService);
  private readonly rbacService = inject(RbacService);

  private readonly _locations = signal<Location[]>([]);
  private readonly _locationTree = signal<LocationTree[]>([]);
  private readonly _selectedLocation = signal<Location | null>(null);
  private readonly _loading = signal<boolean>(false);
  private readonly _error = signal<string | null>(null);
  private readonly _filters = signal<LocationFilters>({});
  private readonly _pagination = signal({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  readonly locations = this._locations.asReadonly();
  readonly locationTree = this._locationTree.asReadonly();
  readonly selectedLocation = this._selectedLocation.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly error = this._error.asReadonly();
  readonly filters = this._filters.asReadonly();
  readonly pagination = this._pagination.asReadonly();

  readonly page = computed(() => this._pagination().page);
  readonly limit = computed(() => this._pagination().limit);
  readonly total = computed(() => this._pagination().total);
  readonly hasData = computed(() => this._locations().length > 0);

  readonly canCreate = computed(() => this.rbacService.hasPermission(Permission.CREATE));
  readonly canEdit = computed(() => this.rbacService.hasPermission(Permission.EDIT));
  readonly canDelete = computed(() => this.rbacService.hasPermission(Permission.DELETE));

  loadLocations(params?: Partial<LocationFilters & { page: number; limit: number }>): void {
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

        const data = response?.data || [];
        const isSuccess = response?.success === true || response?.success === undefined;

        if (Array.isArray(data)) {
          this._locations.set(data);

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
        }

        if (!isSuccess && data.length === 0) {
          this._error.set((response as any)?.message || 'Unable to load locations');
        } else {
          this._error.set(null);
        }

        this._loading.set(false);
      },
      error: (err: any) => {
        console.error('API Error:', err);
        this._locations.set([]);
        this._pagination.set({
          page: 1,
          limit: 10,
          total: 0,
          totalPages: 0,
        });

        let errorMessage = 'Unable to load locations. Please try again.';

        if (err && typeof err === 'object') {
          if (err.message) {
            errorMessage = err.message;
          } else if (err.error && err.error.message) {
            errorMessage = err.error.message;
          }
        } else if (typeof err === 'string') {
          errorMessage = err;
        }

        this._error.set(errorMessage);
        this._loading.set(false);
      },
    });
  }

  loadLocationTree(): void {
    this._loading.set(true);
    this._error.set(null);

    this.api.getTree().subscribe({
      next: (response) => {
        if (response.success) {
          this._locationTree.set(response.data || []);
        } else {
          this._error.set('Failed to load location tree');
        }
        this._loading.set(false);
      },
      error: (err) => {
        this._locationTree.set([]);
        this._error.set(null);
        this._loading.set(false);
      },
    });
  }

  loadById(id: number): void {
    this._loading.set(true);
    this._error.set(null);

    this.api.getById(id).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this._selectedLocation.set(response.data);
          this._error.set(null);
        } else {
          this._error.set(response.message || 'Failed to load location');
        }
        this._loading.set(false);
      },
      error: (err: any) => {
        let errorMessage = 'Failed to load location. Please try again.';
        if (err && typeof err === 'object') {
          if (err.message) {
            errorMessage = err.message;
          } else if (err.error && err.error.message) {
            errorMessage = err.error.message;
          }
        }
        this._error.set(errorMessage);
        this._selectedLocation.set(null);
        this._loading.set(false);
      },
    });
  }

  create(data: any): Observable<any> {
    this._loading.set(true);
    return this.api.create(data).pipe(
      tap((response) => {
        if (response.success) {
          this._loading.set(false);
        } else {
          this._error.set(response.message || 'Failed to create location');
        }
      }),
      catchError((err) => {
        this._error.set(err.error?.message || 'An error occurred');
        return of({ success: false, message: err.error?.message });
      }),
      finalize(() => this._loading.set(false)),
    );
  }

  update(id: number, data: any): Observable<any> {
    this._loading.set(true);
    return this.api.update(id, data).pipe(
      tap((response) => {
        if (response.success) {
          this._loading.set(false);
        } else {
          this._error.set(response.message || 'Failed to update location');
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
    return this.api.delete(id).pipe(
      tap((response) => {
        if (response.success) {
          this._locations.update((list) => list.filter((d) => d.id !== id));
        } else {
          this._error.set(response.message || 'Failed to delete location');
        }
      }),
      catchError((err) => {
        this._error.set(err.error?.message || 'An error occurred');
        return of({ success: false, message: err.error?.message });
      }),
      finalize(() => this._loading.set(false)),
    );
  }

  activate(id: number): Observable<any> {
    this._loading.set(true);
    return this.api.activate(id).pipe(
      tap((response) => {
        if (response.success) {
          this._loading.set(false);
        } else {
          this._error.set(response.message || 'Failed to activate location');
        }
      }),
      catchError((err) => {
        this._error.set(err.error?.message || 'An error occurred');
        return of({ success: false, message: err.error?.message });
      }),
      finalize(() => this._loading.set(false)),
    );
  }

  deactivate(id: number): Observable<any> {
    this._loading.set(true);
    return this.api.deactivate(id).pipe(
      tap((response) => {
        if (response.success) {
          this._locations.update((list) => list.filter((d) => d.id !== id));
        } else {
          this._error.set(response.message || 'Failed to deactivate location');
        }
      }),
      catchError((err) => {
        this._error.set(err.error?.message || 'An error occurred');
        return of({ success: false, message: err.error?.message });
      }),
      finalize(() => this._loading.set(false)),
    );
  }

  setHeadquarters(id: number): Observable<any> {
    this._loading.set(true);
    return this.api.setHeadquarters(id).pipe(
      tap((response) => {
        if (response.success) {
          this._loading.set(false);
        } else {
          this._error.set(response.message || 'Failed to set headquarters');
        }
      }),
      catchError((err) => {
        this._error.set(err.error?.message || 'An error occurred');
        return of({ success: false, message: err.error?.message });
      }),
      finalize(() => this._loading.set(false)),
    );
  }

  generateCode(prefix?: string): Observable<any> {
    return this.api.generateCode(prefix);
  }

  setFilters(filters: LocationFilters): void {
    this._filters.set(filters);
    this.loadLocations({ ...filters, page: 1 });
  }

  clearFilters(): void {
    this._filters.set({});
    this.loadLocations();
  }

  setSelectedLocation(location: Location | null): void {
    this._selectedLocation.set(location);
  }

  reset(): void {
    this._locations.set([]);
    this._locationTree.set([]);
    this._selectedLocation.set(null);
    this._loading.set(false);
    this._error.set(null);
    this._filters.set({});
    this._pagination.set({ page: 1, limit: 10, total: 0, totalPages: 0 });
  }
}
