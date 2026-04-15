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
import { DesignationStore } from '../../services/designation.store';
import { Designation } from '../../models/designation.model';
import { Permission } from '../../../../../core/models/rbac.models';
import { ToasterService } from '../../../../../core/services';

@Component({
  selector: 'app-designation-list',
  standalone: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="container-fluid">
      <div class="row mb-4">
        <div class="col">
          <h2 class="page-title">
            <i class="fas fa-briefcase me-2"></i>
            Designation Management
          </h2>
        </div>
        <div class="col-auto">
          @if (store.canCreate()) {
            <button class="btn btn-primary" (click)="navigateToAdd()">
              <i class="fas fa-plus me-2"></i>
              Add Designation
            </button>
          }
        </div>
      </div>

      <div class="row mb-3 g-3">
        <div class="col-md-6">
          <div class="input-group">
            <span class="input-group-text">
              <i class="fas fa-search"></i>
            </span>
            <input
              type="text"
              class="form-control"
              placeholder="Search by name, code, or description..."
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
          </div>
        </div>
      </div>

      @if (store.loading()) {
        <div class="text-center py-5">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
          <p class="mt-3 text-muted">Loading designations...</p>
        </div>
      } @else if (store.error()) {
        <div class="card shadow-sm border-danger">
          <div class="card-body text-center py-5">
            <div class="text-muted">
              <i class="fas fa-exclamation-triangle fa-3x mb-3 text-danger d-block"></i>
              <h5 class="text-dark">Unable to load designations</h5>
              <p class="small text-muted mb-2">There was a problem fetching designation data.</p>
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
      } @else if (store.designations().length === 0) {
        <div class="card shadow-sm">
          <div class="card-body text-center py-5">
            <div class="text-muted">
              <i class="fas fa-briefcase fa-3x mb-3 d-block opacity-25"></i>
              <h5>No designations found</h5>
              <p class="small">Get started by adding your first designation</p>
              @if (store.canCreate()) {
                <button class="btn btn-primary mt-2" (click)="navigateToAdd()">
                  <i class="fas fa-plus me-2"></i>
                  Add Designation
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
                      Designation Name
                      <i class="fas fa-sort ms-1"></i>
                    </th>
                    <th>Code</th>
                    <th>Department</th>
                    <th>Grade Level</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  @for (des of store.designations(); track des.id) {
                    <tr>
                      <td>
                        <div class="d-flex align-items-center">
                          <i class="fas fa-briefcase text-primary me-2"></i>
                          <strong>{{ des.name }}</strong>
                        </div>
                      </td>
                      <td>
                        <span class="badge bg-secondary">{{ des.code }}</span>
                      </td>
                      <td>{{ des.departmentName || '-' }}</td>
                      <td>
                        @if (des.gradeLevel) {
                          <span class="badge bg-info">Level {{ des.gradeLevel }}</span>
                        } @else {
                          <span class="text-muted">-</span>
                        }
                      </td>
                      <td>
                        @if (des.status === 'active') {
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
                              (click)="navigateToEdit(des)"
                              title="Edit"
                            >
                              <i class="fas fa-pencil-alt"></i>
                            </button>
                          }
                          @if (store.canDelete()) {
                            <button
                              class="btn btn-outline-danger"
                              (click)="onDelete(des)"
                              title="Delete"
                            >
                              <i class="fas fa-trash"></i>
                            </button>
                          }
                          @if (des.status === 'inactive' && store.canEdit()) {
                            <button
                              class="btn btn-outline-success"
                              (click)="onActivate(des)"
                              title="Activate"
                            >
                              <i class="fas fa-check"></i>
                            </button>
                          }
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
      } @else {
        <div class="row g-3">
          @for (des of store.designations(); track des.id) {
            <div class="col-md-6 col-lg-4">
              <div
                class="card h-100 shadow-sm designation-card"
                [class.inactive]="des.status === 'inactive'"
              >
                <div
                  class="card-header bg-transparent d-flex justify-content-between align-items-center"
                >
                  <span class="badge bg-secondary">{{ des.code }}</span>
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
                            (click)="navigateToEdit(des)"
                          >
                            <i class="fas fa-edit me-2"></i> Edit
                          </a>
                        </li>
                      }
                      @if (store.canDelete()) {
                        <li>
                          <a
                            class="dropdown-item text-danger"
                            href="javascript:void(0)"
                            (click)="onDelete(des)"
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
                    <i class="fas fa-briefcase text-primary me-2"></i>
                    {{ des.name }}
                  </h5>
                  @if (des.departmentName) {
                    <p class="text-muted mb-2 small">
                      <i class="fas fa-building me-1"></i>
                      {{ des.departmentName }}
                    </p>
                  }
                  @if (des.gradeLevel) {
                    <p class="text-muted mb-2 small">
                      <i class="fas fa-layer-group me-1"></i>
                      Grade Level {{ des.gradeLevel }}
                    </p>
                  }
                  @if (des.description) {
                    <p class="card-text text-muted small">{{ des.description }}</p>
                  }
                </div>
                <div class="card-footer bg-transparent">
                  @if (des.status === 'active') {
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
          }
        </div>
      }
    </div>
  `,
  styles: [
    `
      .page-title {
        font-weight: 600;
        color: #2c3e50;
      }
      .designation-card {
        transition:
          transform 0.2s,
          box-shadow 0.2s;
      }
      .designation-card:hover {
        transform: translateY(-4px);
        box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1) !important;
      }
      .designation-card.inactive {
        opacity: 0.7;
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
export class DesignationListComponent implements OnInit {
  readonly store = inject(DesignationStore);
  private router = inject(Router);
  private toasterService = inject(ToasterService);
  private cdr = inject(ChangeDetectorRef);
  private destroy$ = new Subject<void>();
  private searchSubject = new Subject<string>();

  readonly Permission = Permission;
  readonly Math = Math;

  searchTerm = signal<string>('');
  statusFilter = signal<string>('');
  viewMode = signal<'table' | 'grid'>('table');
  sortField = signal<string>('');
  sortDirection = signal<'asc' | 'desc'>('asc');

  min = Math.min;

  ngOnInit(): void {
    this.loadData();
    this.setupSearchDebounce();
  }

  private loadData(): void {
    this.store.loadDesignations();
    setTimeout(() => {
      this.cdr.markForCheck();
    }, 200);
  }

  private setupSearchDebounce(): void {
    this.searchSubject
      .pipe(debounceTime(300), distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe(() => {
        this.store.loadDesignations({ search: this.searchTerm(), page: 1 });
      });
  }

  onSearchChange(value: string): void {
    this.searchTerm.set(value);
    this.searchSubject.next(value);
  }

  onStatusChange(value: string): void {
    this.statusFilter.set(value);
    this.store.loadDesignations({ status: value as any, page: 1 });
  }

  onViewModeChange(mode: 'table' | 'grid'): void {
    this.viewMode.set(mode);
    this.store.loadDesignations();
  }

  sortBy(field: string): void {
    if (this.sortField() === field) {
      this.sortDirection.set(this.sortDirection() === 'asc' ? 'desc' : 'asc');
    } else {
      this.sortField.set(field);
      this.sortDirection.set('asc');
    }
  }

  onPageChange(page: number): void {
    if (page < 1 || page > this.store.pagination().totalPages) return;
    this.store.loadDesignations({ page, limit: this.store.pagination().limit });
    setTimeout(() => this.cdr.markForCheck(), 100);
  }

  onPageSizeChange(limit: number): void {
    this.store.loadDesignations({ page: 1, limit });
    setTimeout(() => this.cdr.markForCheck(), 100);
  }

  reload(): void {
    this.loadData();
  }

  clearFilters(): void {
    this.searchTerm.set('');
    this.statusFilter.set('');
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

  navigateToAdd(): void {
    this.router.navigate(['/masters/designations/add']);
  }

  navigateToEdit(des: Designation): void {
    this.router.navigate(['/masters/designations/edit', des.id]);
  }

  async onDelete(des: Designation): Promise<void> {
    const confirmed = await this.showConfirmDialog(
      'Delete Designation',
      `Are you sure you want to delete "${des.name}"? This action cannot be undone.`,
    );

    if (confirmed) {
      this.store.delete(des.id).subscribe({
        next: (response) => {
          if (response?.success) {
            this.toasterService.success('Success', 'Designation deleted successfully');
            this.loadData();
          } else {
            this.toasterService.error('Error', response?.message || 'Failed to delete designation');
          }
          this.cdr.markForCheck();
        },
        error: (err) => {
          this.toasterService.error('Error', err.error?.message || 'Failed to delete designation');
          this.cdr.markForCheck();
        },
      });
    }
  }

  async onActivate(des: Designation): Promise<void> {
    const confirmed = await this.showConfirmDialog(
      'Activate Designation',
      `Are you sure you want to activate "${des.name}"?`,
    );

    if (confirmed) {
      this.store.activate(des.id).subscribe({
        next: (response) => {
          if (response?.success) {
            this.toasterService.success('Success', 'Designation activated successfully');
            this.loadData();
          } else {
            this.toasterService.error(
              'Error',
              response?.message || 'Failed to activate designation',
            );
          }
          this.cdr.markForCheck();
        },
        error: (err) => {
          this.toasterService.error(
            'Error',
            err.error?.message || 'Failed to activate designation',
          );
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
