import { Component, OnInit, inject, signal, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subject, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';
import { DepartmentStore } from '../../services/department.store';
import { Department } from '../../models/department.model';
import { Permission } from '../../../../../core/models/rbac.models';

@Component({
  selector: 'app-department-list',
  standalone: false,
  template: `
    <div class="container-fluid">
      <div class="row mb-4">
        <div class="col">
          <h2 class="page-title">
            <i class="fas fa-building me-2"></i>
            Department Management
          </h2>
        </div>
        <div class="col-auto">
          @if (store.canCreate()) {
            <button class="btn btn-primary" (click)="navigateToAdd()">
              <i class="fas fa-plus me-2"></i>
              Add Department
            </button>
          }
        </div>
      </div>

      <div class="row mb-3">
        <div class="col-md-6">
          <div class="input-group">
            <span class="input-group-text">
              <i class="fas fa-search"></i>
            </span>
            <input
              type="text"
              class="form-control"
              placeholder="Search by name or code..."
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
              <i class="fas fa-table me-1"></i> Table
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
              <i class="fas fa-sitemap me-1"></i> Tree
            </label>
          </div>
        </div>
      </div>

      @if (store.loading()) {
        <div class="text-center py-5">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
          <p class="mt-3 text-muted">Loading departments...</p>
        </div>
      } @else if (store.error()) {
        <div class="alert alert-danger" role="alert">
          <i class="fas fa-exclamation-triangle me-2"></i>
          {{ store.error() }}
          <button class="btn btn-sm btn-outline-danger ms-3" (click)="store.loadDepartments()">
            Retry
          </button>
        </div>
      } @else if (viewMode() === 'table') {
        <!-- Debug Info -->
        <div class="alert alert-secondary small mb-3">
          <strong>Debug:</strong> Loading: {{ store.loading() }}, Depts:
          {{ store.departments().length }}, Page: {{ store.pagination().page }}, Total:
          {{ store.pagination().total }}
          <button class="btn btn-sm btn-outline-primary ms-2" (click)="reload()">Reload</button>
        </div>
        <div class="card shadow-sm">
          <div class="card-body">
            <div class="table-responsive">
              <table class="table table-hover">
                <thead>
                  <tr>
                    <th>Department Name</th>
                    <th>Code</th>
                    <th>Parent Department</th>
                    <th>Department Head</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  @for (dept of store.departments(); track dept.id) {
                    <tr>
                      <td>{{ dept.name }}</td>
                      <td>
                        <span class="badge bg-secondary">{{ dept.code }}</span>
                      </td>
                      <td>{{ dept.parentName || '-' }}</td>
                      <td>{{ dept.headName || '-' }}</td>
                      <td>
                        @if (dept.status === 'active') {
                          <span class="badge bg-success">Active</span>
                        } @else {
                          <span class="badge bg-danger">Inactive</span>
                        }
                      </td>
                      <td>
                        @if (store.canEdit()) {
                          <button
                            class="btn btn-sm btn-primary me-2"
                            (click)="navigateToEdit(dept)"
                            title="Edit"
                          >
                            <i class="fas fa-pencil-alt"></i>
                          </button>
                        }
                        @if (store.canDelete()) {
                          <button
                            class="btn btn-sm btn-danger"
                            (click)="onDelete(dept)"
                            title="Delete"
                          >
                            <i class="fas fa-trash"></i>
                          </button>
                        }
                      </td>
                    </tr>
                  } @empty {
                    <tr>
                      <td colspan="6" class="text-center py-4">
                        <div class="text-muted">
                          <i class="fas fa-inbox fa-2x mb-2 d-block"></i>
                          No departments found
                        </div>
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>

            @if (store.pagination().total > 0) {
              <div class="d-flex justify-content-between align-items-center mt-3">
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
                      Math.min(
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
        <div class="card shadow-sm">
          <div class="card-header">
            <h5 class="mb-0">
              <i class="fas fa-sitemap me-2"></i>
              Department Hierarchy
            </h5>
          </div>
          <div class="card-body">
            <!-- Tree view component would go here -->
            <div class="text-muted">Tree view coming soon...</div>
          </div>
        </div>
      }
    </div>
  `,
})
export class DepartmentListComponent implements OnInit {
  readonly store = inject(DepartmentStore);
  readonly Math = Math;
  private cdr = inject(ChangeDetectorRef);
  private router = inject(Router);
  private destroy$ = new Subject<void>();
  private searchSubject = new Subject<string>();

  searchTerm = signal<string>('');
  statusFilter = signal<string>('');
  viewMode = signal<'table' | 'tree'>('table');

  readonly Permission = Permission;

  ngOnInit(): void {
    this.store.loadDepartments();
    this.setupSearchDebounce();

    this.store.departments;
  }

  private setupSearchDebounce(): void {
    this.searchSubject
      .pipe(debounceTime(300), distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe(() => {
        this.store.loadDepartments({ search: this.searchTerm(), page: 1 });
      });
  }

  onSearchChange(value: string): void {
    this.searchTerm.set(value);
    this.searchSubject.next(value);
  }

  onStatusChange(value: string): void {
    this.statusFilter.set(value);
    this.store.loadDepartments({ status: value as any, page: 1 });
  }

  onViewModeChange(mode: 'table' | 'tree'): void {
    this.viewMode.set(mode);
    if (mode === 'tree') {
      this.store.loadDepartmentTree();
    }
  }

  onPageChange(page: number): void {
    if (page < 1 || page > this.store.pagination().totalPages) return;
    this.store.loadDepartments({ page, limit: this.store.pagination().limit });
  }

  onPageSizeChange(limit: number): void {
    this.store.loadDepartments({ page: 1, limit });
  }

  reload(): void {
    this.store.loadDepartments();
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
    this.router.navigate(['/masters/departments/add']);
  }

  navigateToEdit(dept: Department): void {
    this.router.navigate(['/masters/departments/edit', dept.id]);
  }

  async onDelete(dept: Department): Promise<void> {
    const confirmed = confirm(`Are you sure you want to delete "${dept.name}"?`);
    if (confirmed) {
      this.store.delete(dept.id).subscribe({
        next: () => {
          this.store.loadDepartments();
        },
      });
    }
  }
}
