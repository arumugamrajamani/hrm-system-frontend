import { Component, OnInit, inject, signal, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subject, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator, PageEvent } from '@angular/material/paginator';
import { DepartmentStore } from '../../services/department.store';
import { Department } from '../../models/department.model';
import { Permission } from '../../../../../core/models/rbac.models';
import { LoadingSkeletonComponent } from '../../../../../shared/components/loading-skeleton/loading-skeleton.component';
import { EmptyStateComponent } from '../../../../../shared/components/empty-state/empty-state.component';
import { ToasterService, ModalService } from '../../../../../core/services';

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
        <div class="card shadow-sm">
          <div class="card-body">
            @for (row of skeletonRows; track $index) {
              <app-loading-skeleton
                type="table-row"
                [columns]="['200px', '100px', '150px', '120px', '80px', '100px']"
              ></app-loading-skeleton>
            }
          </div>
        </div>
      } @else if (store.error()) {
        <div class="alert alert-danger" role="alert">
          <i class="fas fa-exclamation-triangle me-2"></i>
          {{ store.error() }}
          <button class="btn btn-sm btn-outline-danger ms-3" (click)="reload()">Retry</button>
        </div>
      } @else if (viewMode() === 'table') {
        <div class="card shadow-sm">
          <div class="card-body pt-0">
            @if (store.departments().length === 0) {
              <app-empty-state
                icon="business"
                title="No Departments Found"
                message="Get started by creating your first department."
                actionLabel="Add Department"
                actionIcon="add"
                (action)="navigateToAdd()"
              ></app-empty-state>
            } @else {
              <div class="table-responsive">
                <table mat-table [dataSource]="dataSource" class="table table-hover">
                  <ng-container matColumnDef="name">
                    <th mat-header-cell *matHeaderCellDef>Department Name</th>
                    <td mat-cell *matCellDef="let dept">{{ dept.name }}</td>
                  </ng-container>

                  <ng-container matColumnDef="code">
                    <th mat-header-cell *matHeaderCellDef>Code</th>
                    <td mat-cell *matCellDef="let dept">
                      <span class="badge bg-secondary">{{ dept.code }}</span>
                    </td>
                  </ng-container>

                  <ng-container matColumnDef="parentName">
                    <th mat-header-cell *matHeaderCellDef>Parent Department</th>
                    <td mat-cell *matCellDef="let dept">{{ dept.parentName || '-' }}</td>
                  </ng-container>

                  <ng-container matColumnDef="headName">
                    <th mat-header-cell *matHeaderCellDef>Department Head</th>
                    <td mat-cell *matCellDef="let dept">{{ dept.headName || '-' }}</td>
                  </ng-container>

                  <ng-container matColumnDef="status">
                    <th mat-header-cell *matHeaderCellDef>Status</th>
                    <td mat-cell *matCellDef="let dept">
                      @if (dept.status === 'active') {
                        <span class="badge bg-success">Active</span>
                      } @else {
                        <span class="badge bg-danger">Inactive</span>
                      }
                    </td>
                  </ng-container>

                  <ng-container matColumnDef="actions">
                    <th mat-header-cell *matHeaderCellDef>Actions</th>
                    <td mat-cell *matCellDef="let dept">
                      @if (store.canEdit()) {
                        <button
                          class="btn-action btn-edit me-1"
                          (click)="navigateToEdit(dept)"
                          title="Edit"
                        >
                          <i class="fas fa-pencil-alt"></i>
                        </button>
                      }
                      <button
                        class="btn-action me-1"
                        [class.btn-toggle-active]="dept.status === 'active'"
                        [class.btn-toggle-inactive]="dept.status === 'inactive'"
                        (click)="onToggleStatus(dept)"
                        [title]="dept.status === 'active' ? 'Deactivate' : 'Activate'"
                      >
                        @if (dept.status === 'active') {
                          <i class="fas fa-ban"></i>
                        } @else {
                          <i class="fas fa-check"></i>
                        }
                      </button>
                      @if (store.canDelete()) {
                        <button
                          class="btn-action btn-delete ms-1"
                          (click)="onDelete(dept)"
                          title="Delete"
                        >
                          <i class="fas fa-trash"></i>
                        </button>
                      }
                    </td>
                  </ng-container>

                  <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
                  <tr mat-row *matRowDef="let row; columns: displayedColumns"></tr>

                  <tr class="mat-row" *matNoDataRow>
                    <td class="mat-cell text-center py-4" [attr.colspan]="displayedColumns.length">
                      <app-empty-state
                        icon="business"
                        title="No Departments Found"
                        message="Get started by creating your first department."
                        actionLabel="Add Department"
                        actionIcon="add"
                        (action)="navigateToAdd()"
                      ></app-empty-state>
                    </td>
                  </tr>
                </table>
              </div>

              <mat-paginator
                [pageSizeOptions]="[10, 25, 50, 100]"
                [pageSize]="store.pagination().limit"
                [length]="store.pagination().total"
                [pageIndex]="store.pagination().page - 1"
                (page)="onPageChange($event.pageIndex + 1); onPageSizeChange($event.pageSize)"
                showFirstLastButtons
              >
              </mat-paginator>
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
            <app-empty-state
              icon="account_tree"
              title="Tree View Coming Soon"
              message="The hierarchical view of departments will be available soon."
            ></app-empty-state>
          </div>
        </div>
      }
    </div>
  `,
})
export class DepartmentListComponent implements OnInit {
  readonly store = inject(DepartmentStore);
  readonly Math = Math;
  private router = inject(Router);
  private toasterService = inject(ToasterService);
  private modalService = inject(ModalService);
  private destroy$ = new Subject<void>();
  private searchSubject = new Subject<string>();

  private paginator?: MatPaginator;

  @ViewChild(MatPaginator)
  set matPaginator(paginator: MatPaginator | undefined) {
    if (!paginator) return;
    this.paginator = paginator;
  }

  displayedColumns = ['name', 'code', 'parentName', 'headName', 'status', 'actions'];
  dataSource = new MatTableDataSource<Department>([]);

  searchTerm = signal<string>('');
  statusFilter = signal<string>('');
  viewMode = signal<'table' | 'tree'>('table');
  skeletonRows = Array(5).fill(0);

  readonly Permission = Permission;

  ngOnInit(): void {
    this.store.loadDepartments();
    this.setupSearchDebounce();
    this.loadDataSource();
  }

  private loadDataSource(): void {
    this.dataSource.data = this.store.departments();
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

  async onToggleStatus(dept: Department): Promise<void> {
    const action = dept.status === 'active' ? 'deactivate' : 'activate';
    const confirmed = await this.modalService.confirm(
      `${action.charAt(0).toUpperCase() + action.slice(1)} Department`,
      `Are you sure you want to ${action} "${dept.name}"?`,
    );

    if (confirmed) {
      this.store.toggleStatus(dept.id).subscribe({
        next: (response) => {
          if (response?.success) {
            this.toasterService.success('Success', `Department ${action}d successfully`);
            this.store.loadDepartments();
          } else {
            this.toasterService.error(
              'Error',
              response?.message || `Failed to ${action} department`,
            );
          }
        },
      });
    }
  }

  async onDelete(dept: Department): Promise<void> {
    const confirmed = await this.modalService.confirm(
      'Delete Department',
      `Are you sure you want to delete "${dept.name}"? This action cannot be undone.`,
    );

    if (confirmed) {
      this.store.delete(dept.id).subscribe({
        next: (response) => {
          if (response?.success) {
            this.toasterService.success('Success', 'Department deleted successfully');
            this.store.loadDepartments();
          } else {
            this.toasterService.error('Error', response?.message || 'Failed to delete department');
          }
        },
      });
    }
  }
}
