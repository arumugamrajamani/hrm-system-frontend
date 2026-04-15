import {
  Component,
  OnInit,
  inject,
  signal,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subject, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';
import { LocationStore } from '../../services/location.store';
import { Location, LocationTree } from '../../models/location.model';
import { Permission } from '../../../../../core/models/rbac.models';
import { ToasterService } from '../../../../../core/services';

@Component({
  selector: 'app-location-list',
  standalone: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="container-fluid">
      <div class="row mb-4">
        <div class="col">
          <h2 class="page-title">
            <i class="fas fa-map-marker-alt me-2"></i>
            Location Management
          </h2>
        </div>
        <div class="col-auto">
          @if (store.canCreate()) {
            <button class="btn btn-primary" (click)="navigateToAdd()">
              <i class="fas fa-plus me-2"></i>
              Add Location
            </button>
          }
        </div>
      </div>

      <div class="row mb-3 g-3">
        <div class="col-md-4">
          <div class="input-group">
            <span class="input-group-text">
              <i class="fas fa-search"></i>
            </span>
            <input
              type="text"
              class="form-control"
              placeholder="Search by name, code, city..."
              [ngModel]="searchTerm()"
              (ngModelChange)="onSearchChange($event)"
            />
          </div>
        </div>
        <div class="col-md-3">
          <select
            class="form-select"
            [ngModel]="statusFilter()"
            (ngModelChange)="onStatusChange($event)"
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
        <div class="col-md-3">
          <select
            class="form-select"
            [ngModel]="hierarchyFilter()"
            (ngModelChange)="onHierarchyChange($event)"
          >
            <option value="">All Locations</option>
            @for (loc of rootLocations(); track loc.id) {
              <option [ngValue]="loc.id">{{ loc.name }}</option>
            }
          </select>
        </div>
        <div class="col-md-2">
          <div class="btn-group w-100" role="group">
            <input
              type="radio"
              class="btn-check"
              name="viewMode"
              id="tableView"
              value="table"
              [ngModel]="viewMode()"
              (ngModelChange)="onViewModeChange($event)"
            />
            <label class="btn btn-outline-primary" for="tableView">
              <i class="fas fa-table me-1"></i>
            </label>

            <input
              type="radio"
              class="btn-check"
              name="viewMode"
              id="gridView"
              value="grid"
              [ngModel]="viewMode()"
              (ngModelChange)="onViewModeChange($event)"
            />
            <label class="btn btn-outline-primary" for="gridView">
              <i class="fas fa-th-large me-1"></i>
            </label>

            <input
              type="radio"
              class="btn-check"
              name="viewMode"
              id="treeView"
              value="tree"
              [ngModel]="viewMode()"
              (ngModelChange)="onViewModeChange($event)"
            />
            <label class="btn btn-outline-primary" for="treeView">
              <i class="fas fa-sitemap me-1"></i>
            </label>
          </div>
        </div>
      </div>

      @if (store.loading()) {
        <div class="text-center py-5">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
          <p class="mt-3 text-muted">Loading locations...</p>
        </div>
      } @else if (store.error()) {
        <div class="card shadow-sm border-danger">
          <div class="card-body text-center py-5">
            <div class="text-muted">
              <i class="fas fa-exclamation-triangle fa-3x mb-3 text-danger d-block"></i>
              <h5 class="text-dark">Unable to load locations</h5>
              <p class="small text-muted mb-2">There was a problem fetching location data.</p>
              <div class="alert alert-warning small mx-auto" style="max-width: 500px;">
                <strong>Error:</strong> {{ store.error() }}
              </div>
              <button class="btn btn-outline-primary mt-2" (click)="reload()">
                <i class="fas fa-sync-alt me-2"></i>
                Try Again
              </button>
            </div>
          </div>
        </div>
      } @else if (store.locations().length === 0) {
        <div class="card shadow-sm">
          <div class="card-body text-center py-5">
            <div class="text-muted">
              <i class="fas fa-map-marker-alt fa-3x mb-3 d-block opacity-25"></i>
              <h5>No locations found</h5>
              <p class="small">Get started by adding your first location</p>
              @if (store.canCreate()) {
                <button class="btn btn-primary mt-2" (click)="navigateToAdd()">
                  <i class="fas fa-plus me-2"></i>
                  Add Location
                </button>
              }
            </div>
          </div>
        </div>
      } @else if (viewMode() === 'table') {
        <div class="card shadow-sm">
          <div class="card-body">
            <div class="table-responsive">
              <table class="table table-hover">
                <thead class="table-light">
                  <tr>
                    <th class="sortable" (click)="sortBy('name')">
                      Location Name
                      <i
                        class="fas fa-sort ms-1"
                        [class.fa-sort-asc]="sortField() === 'name' && sortDirection() === 'asc'"
                        [class.fa-sort-desc]="sortField() === 'name' && sortDirection() === 'desc'"
                      ></i>
                    </th>
                    <th>Code</th>
                    <th>Parent Location</th>
                    <th>City</th>
                    <th>State</th>
                    <th>HQ</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  @for (loc of store.locations(); track loc.id) {
                    <tr>
                      <td>
                        <div class="d-flex align-items-center">
                          <i class="fas fa-map-marker-alt text-danger me-2"></i>
                          <strong>{{ loc.name }}</strong>
                        </div>
                      </td>
                      <td>
                        <span class="badge bg-secondary">{{ loc.code }}</span>
                      </td>
                      <td>{{ loc.parentName || '-' }}</td>
                      <td>{{ loc.city }}</td>
                      <td>{{ loc.state }}</td>
                      <td>
                        @if (loc.isHeadquarters) {
                          <span class="badge bg-warning text-dark">
                            <i class="fas fa-star me-1"></i> HQ
                          </span>
                        } @else {
                          <span class="text-muted">-</span>
                        }
                      </td>
                      <td>
                        @if (loc.status === 'active') {
                          <span class="badge bg-success">Active</span>
                        } @else {
                          <span class="badge bg-danger">Inactive</span>
                        }
                      </td>
                      <td>
                        <div class="btn-group btn-group-sm">
                          @if (store.canEdit()) {
                            <button
                              class="btn btn-outline-primary"
                              (click)="navigateToEdit(loc)"
                              title="Edit"
                            >
                              <i class="fas fa-pencil-alt"></i>
                            </button>
                          }
                          @if (store.canDelete()) {
                            <button
                              class="btn btn-outline-danger"
                              (click)="onDelete(loc)"
                              title="Delete"
                            >
                              <i class="fas fa-trash"></i>
                            </button>
                          }
                          @if (!loc.isHeadquarters && loc.status === 'active') {
                            <button
                              class="btn btn-outline-warning"
                              (click)="onSetHQ(loc)"
                              title="Set as Headquarters"
                            >
                              <i class="fas fa-star"></i>
                            </button>
                          }
                        </div>
                      </td>
                    </tr>
                  } @empty {
                    <tr>
                      <td colspan="8">
                        <div class="card shadow-sm">
                          <div class="card-body text-center py-5">
                            <div class="text-muted">
                              <i class="fas fa-map-marker-alt fa-3x mb-3 d-block opacity-25"></i>
                              <h5>Data not available</h5>
                              <p class="small">No locations found matching your criteria</p>
                              <button class="btn btn-outline-primary mt-2" (click)="clearFilters()">
                                <i class="fas fa-filter-slash me-2"></i>
                                Clear Filters
                              </button>
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>

            @if (store.pagination().total > 0) {
              <div class="d-flex justify-content-between align-items-center mt-4">
                <div class="d-flex align-items-center gap-2">
                  <span class="text-muted">Show</span>
                  <select
                    class="form-select form-select-sm"
                    style="width: auto;"
                    [ngModel]="store.pagination().limit"
                    (ngModelChange)="onPageSizeChange($event)"
                  >
                    <option [ngValue]="10">10</option>
                    <option [ngValue]="25">25</option>
                    <option [ngValue]="50">50</option>
                    <option [ngValue]="100">100</option>
                  </select>
                  <span class="text-muted">entries</span>
                  <span class="text-muted ms-2">
                    ({{ (store.pagination().page - 1) * store.pagination().limit + 1 }}-{{
                      min(
                        store.pagination().page * store.pagination().limit,
                        store.pagination().total
                      )
                    }}
                    of {{ store.pagination().total }})
                  </span>
                </div>
                <nav>
                  <ul class="pagination mb-0">
                    <li class="page-item" [class.disabled]="store.pagination().page === 1">
                      <a
                        class="page-link"
                        href="javascript:void(0)"
                        (click)="onPageChange(store.pagination().page - 1)"
                      >
                        Previous
                      </a>
                    </li>
                    @for (page of getVisiblePages(); track page) {
                      <li class="page-item" [class.active]="page === store.pagination().page">
                        <a class="page-link" href="javascript:void(0)" (click)="onPageChange(page)">
                          {{ page }}
                        </a>
                      </li>
                    }
                    <li
                      class="page-item"
                      [class.disabled]="store.pagination().page === store.pagination().totalPages"
                    >
                      <a
                        class="page-link"
                        href="javascript:void(0)"
                        (click)="onPageChange(store.pagination().page + 1)"
                      >
                        Next
                      </a>
                    </li>
                  </ul>
                </nav>
              </div>
            }
          </div>
        </div>
      } @else if (viewMode() === 'grid') {
        <div class="row g-3">
          @for (loc of store.locations(); track loc.id) {
            <div class="col-md-6 col-lg-4">
              <div
                class="card h-100 shadow-sm location-card"
                [class.inactive]="loc.status === 'inactive'"
              >
                <div
                  class="card-header bg-transparent d-flex justify-content-between align-items-center"
                >
                  <span class="badge bg-secondary">{{ loc.code }}</span>
                  <div class="dropdown">
                    <button
                      class="btn btn-sm btn-link text-dark"
                      type="button"
                      data-bs-toggle="dropdown"
                    >
                      <i class="fas fa-ellipsis-v"></i>
                    </button>
                    <ul class="dropdown-menu dropdown-menu-end">
                      @if (store.canEdit()) {
                        <li>
                          <a
                            class="dropdown-item"
                            href="javascript:void(0)"
                            (click)="navigateToEdit(loc)"
                          >
                            <i class="fas fa-edit me-2"></i> Edit
                          </a>
                        </li>
                      }
                      @if (!loc.isHeadquarters && loc.status === 'active') {
                        <li>
                          <a class="dropdown-item" href="javascript:void(0)" (click)="onSetHQ(loc)">
                            <i class="fas fa-star me-2"></i> Set as HQ
                          </a>
                        </li>
                      }
                      @if (store.canDelete()) {
                        <li>
                          <a
                            class="dropdown-item text-danger"
                            href="javascript:void(0)"
                            (click)="onDelete(loc)"
                          >
                            <i class="fas fa-trash me-2"></i> Delete
                          </a>
                        </li>
                      }
                    </ul>
                  </div>
                </div>
                <div class="card-body">
                  <h5 class="card-title mb-1">
                    <i class="fas fa-map-marker-alt text-danger me-2"></i>
                    {{ loc.name }}
                  </h5>
                  @if (loc.isHeadquarters) {
                    <span class="badge bg-warning text-dark mb-2">
                      <i class="fas fa-star me-1"></i> Headquarters
                    </span>
                  }
                  @if (loc.parentName) {
                    <p class="text-muted mb-2 small">
                      <i class="fas fa-level-up-alt me-1"></i>
                      Parent: {{ loc.parentName }}
                    </p>
                  }
                  <p class="card-text text-muted mb-1">
                    <i class="fas fa-map-pin me-2"></i>
                    {{ loc.city }}, {{ loc.state }}
                  </p>
                  @if (loc.address) {
                    <p class="card-text text-muted small mb-0">
                      <i class="fas fa-address-card me-2"></i>
                      {{ loc.address }}
                    </p>
                  }
                </div>
                <div class="card-footer bg-transparent">
                  @if (loc.status === 'active') {
                    <span class="badge bg-success">
                      <i class="fas fa-check-circle me-1"></i> Active
                    </span>
                  } @else {
                    <span class="badge bg-danger">
                      <i class="fas fa-times-circle me-1"></i> Inactive
                    </span>
                  }
                </div>
              </div>
            </div>
          } @empty {
            <div class="col-12">
              <div class="card shadow-sm">
                <div class="card-body text-center py-5">
                  <div class="text-muted">
                    <i class="fas fa-map-marker-alt fa-3x mb-3 d-block opacity-25"></i>
                    <h5>Data not available</h5>
                    <p class="small">No locations found matching your criteria</p>
                    <button class="btn btn-outline-primary mt-2" (click)="clearFilters()">
                      <i class="fas fa-filter-slash me-2"></i>
                      Clear Filters
                    </button>
                  </div>
                </div>
              </div>
            </div>
          }
        </div>
      } @else {
        <div class="card shadow-sm">
          <div class="card-header">
            <h5 class="mb-0">
              <i class="fas fa-sitemap me-2"></i>
              Location Hierarchy
            </h5>
          </div>
          <div class="card-body">
            <div class="tree-view">
              @if (store.locationTree().length > 0) {
                @for (loc of store.locationTree(); track loc.id) {
                  <ng-container
                    *ngTemplateOutlet="treeNode; context: { $implicit: loc, level: 0 }"
                  ></ng-container>
                }
              } @else {
                <div class="card shadow-sm">
                  <div class="card-body text-center py-5">
                    <div class="text-muted">
                      <i class="fas fa-sitemap fa-3x mb-3 d-block opacity-25"></i>
                      <h5>Data not available</h5>
                      <p class="small">No location hierarchy data found</p>
                    </div>
                  </div>
                </div>
              }
            </div>
          </div>
        </div>
      }
    </div>

    <ng-template #treeNode let-loc let-level="level">
      <div class="tree-item" [style.padding-left.px]="level * 30">
        <div class="tree-node" (click)="toggleNode(loc)">
          @if (loc.children && loc.children.length > 0) {
            <i
              class="fas"
              [class.fa-chevron-right]="!expandedNodes().has(loc.id)"
              [class.fa-chevron-down]="expandedNodes().has(loc.id)"
            ></i>
          } @else {
            <i class="fas fa-circle text-muted" style="font-size: 0.5rem;"></i>
          }
          <i class="fas fa-map-marker-alt text-danger ms-2"></i>
          <span class="tree-label">{{ loc.name }}</span>
          <span class="badge bg-secondary ms-2">{{ loc.code }}</span>
          @if (loc.isHeadquarters) {
            <span class="badge bg-warning text-dark ms-2">
              <i class="fas fa-star me-1"></i> HQ
            </span>
          }
          <span
            class="badge ms-2"
            [class.bg-success]="loc.status === 'active'"
            [class.bg-danger]="loc.status === 'inactive'"
          >
            {{ loc.status }}
          </span>
        </div>
        @if (expandedNodes().has(loc.id) && loc.children) {
          @for (child of loc.children; track child.id) {
            <ng-container
              *ngTemplateOutlet="treeNode; context: { $implicit: child, level: level + 1 }"
            ></ng-container>
          }
        }
      </div>
    </ng-template>
  `,
  styles: [
    `
      .page-title {
        font-weight: 600;
        color: #2c3e50;
      }
      .location-card {
        transition:
          transform 0.2s,
          box-shadow 0.2s;
      }
      .location-card:hover {
        transform: translateY(-4px);
        box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1) !important;
      }
      .location-card.inactive {
        opacity: 0.7;
      }
      .tree-view {
        padding: 1rem 0;
      }
      .tree-item {
        margin-bottom: 0.25rem;
      }
      .tree-node {
        display: flex;
        align-items: center;
        padding: 0.5rem;
        border-radius: 0.25rem;
        cursor: pointer;
        transition: background-color 0.2s;
      }
      .tree-node:hover {
        background-color: #f8f9fa;
      }
      .tree-label {
        font-weight: 500;
        margin-left: 0.5rem;
      }
      .sortable {
        cursor: pointer;
        user-select: none;
      }
      .sortable:hover {
        color: #0d6efd;
      }
    `,
  ],
})
export class LocationListComponent implements OnInit {
  readonly store = inject(LocationStore);
  private router = inject(Router);
  private toasterService = inject(ToasterService);
  private cdr = inject(ChangeDetectorRef);
  private destroy$ = new Subject<void>();
  private searchSubject = new Subject<string>();

  readonly Permission = Permission;
  readonly Math = Math;

  searchTerm = signal<string>('');
  statusFilter = signal<string>('');
  hierarchyFilter = signal<number | ''>('');
  viewMode = signal<'table' | 'grid' | 'tree'>('table');
  sortField = signal<string>('');
  sortDirection = signal<'asc' | 'desc'>('asc');
  expandedNodes = signal<Set<number>>(new Set());
  rootLocations = signal<Location[]>([]);

  min = Math.min;

  ngOnInit(): void {
    this.loadData();
    this.setupSearchDebounce();
  }

  private loadData(): void {
    this.store.loadLocations();
    setTimeout(() => {
      this.cdr.markForCheck();
    }, 200);
  }

  private setupSearchDebounce(): void {
    this.searchSubject
      .pipe(debounceTime(300), distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe(() => {
        this.store.loadLocations({ search: this.searchTerm(), page: 1 });
        this.loadRootLocations();
      });
  }

  onSearchChange(value: string): void {
    this.searchTerm.set(value);
    this.searchSubject.next(value);
  }

  onStatusChange(value: string): void {
    this.statusFilter.set(value);
    this.store.loadLocations({ status: value as any, page: 1 });
  }

  onHierarchyChange(value: number | ''): void {
    this.hierarchyFilter.set(value);
    if (value) {
      this.store.loadLocations({ parentId: value, page: 1 });
    } else {
      this.store.loadLocations({ page: 1 });
    }
  }

  onViewModeChange(mode: 'table' | 'grid' | 'tree'): void {
    this.viewMode.set(mode);
    if (mode === 'tree') {
      this.store.loadLocationTree();
    } else if (mode === 'table' || mode === 'grid') {
      this.store.loadLocations();
    }
  }

  sortBy(field: string): void {
    if (this.sortField() === field) {
      this.sortDirection.set(this.sortDirection() === 'asc' ? 'desc' : 'asc');
    } else {
      this.sortField.set(field);
      this.sortDirection.set('asc');
    }
  }

  toggleNode(loc: LocationTree): void {
    const expanded = new Set(this.expandedNodes());
    if (expanded.has(loc.id)) {
      expanded.delete(loc.id);
    } else {
      expanded.add(loc.id);
    }
    this.expandedNodes.set(expanded);
  }

  onPageChange(page: number): void {
    if (page < 1 || page > this.store.pagination().totalPages) return;
    this.store.loadLocations({ page, limit: this.store.pagination().limit });
    setTimeout(() => this.cdr.markForCheck(), 100);
  }

  onPageSizeChange(limit: number): void {
    this.store.loadLocations({ page: 1, limit });
    setTimeout(() => this.cdr.markForCheck(), 100);
  }

  reload(): void {
    this.loadData();
  }

  clearFilters(): void {
    this.searchTerm.set('');
    this.statusFilter.set('');
    this.hierarchyFilter.set('');
    this.loadData();
  }

  getVisiblePages(): number[] {
    const current = this.store.pagination().page;
    const total = this.store.pagination().totalPages;
    const pages: number[] = [];

    let start = Math.max(1, current - 2);
    let end = Math.min(total, start + 4);

    if (end - start < 4) {
      start = Math.max(1, end - 4);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    return pages;
  }

  loadRootLocations(): void {
    this.store.loadLocations({ limit: 1000, page: 1 });
    setTimeout(() => {
      this.rootLocations.set(this.store.locations().filter((loc) => !loc.parentId));
    }, 500);
  }

  navigateToAdd(): void {
    this.router.navigate(['/masters/locations/add']);
  }

  navigateToEdit(loc: Location): void {
    this.router.navigate(['/masters/locations/edit', loc.id]);
  }

  async onDelete(loc: Location): Promise<void> {
    const confirmed = await this.showConfirmDialog(
      'Delete Location',
      `Are you sure you want to delete "${loc.name}"? This action cannot be undone.`,
    );

    if (confirmed) {
      this.store.delete(loc.id).subscribe({
        next: (response) => {
          if (response?.success) {
            this.toasterService.success('Success', 'Location deleted successfully');
            this.loadData();
          } else {
            this.toasterService.error('Error', response?.message || 'Failed to delete location');
          }
          this.cdr.markForCheck();
        },
        error: (err) => {
          this.toasterService.error('Error', err.error?.message || 'Failed to delete location');
          this.cdr.markForCheck();
        },
      });
    }
  }

  async onSetHQ(loc: Location): Promise<void> {
    const confirmed = await this.showConfirmDialog(
      'Set as Headquarters',
      `Set "${loc.name}" as the company headquarters?`,
    );

    if (confirmed) {
      this.store.setHeadquarters(loc.id).subscribe({
        next: (response) => {
          if (response?.success) {
            this.toasterService.success('Success', 'Location set as headquarters');
            this.loadData();
          } else {
            this.toasterService.error('Error', response?.message || 'Failed to set headquarters');
          }
          this.cdr.markForCheck();
        },
        error: (err) => {
          this.toasterService.error('Error', err.error?.message || 'Failed to set headquarters');
          this.cdr.markForCheck();
        },
      });
    }
  }

  private showConfirmDialog(title: string, message: string): Promise<boolean> {
    return new Promise((resolve) => {
      const confirmed = window.confirm(`${title}\n\n${message}`);
      resolve(confirmed);
    });
  }
}
