import { Component, OnInit, inject, signal, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subject, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator, PageEvent } from '@angular/material/paginator';
import { EmploymentTypeStore } from '../../services/employment-type.store';
import { EmploymentType } from '../../models/employment-type.model';
import { Permission } from '../../../../../core/models/rbac.models';
import { LoadingSkeletonComponent } from '../../../../../shared/components/loading-skeleton/loading-skeleton.component';
import { EmptyStateComponent } from '../../../../../shared/components/empty-state/empty-state.component';
import { ToasterService, ModalService } from '../../../../../core/services';

@Component({
  selector: 'app-employment-type-list',
  standalone: false,
  template: `
    <div class="container-fluid">
      <div class="row mb-4">
        <div class="col">
          <h2 class="page-title">
            <i class="fas fa-briefcase me-2"></i>
            Employment Type Management
          </h2>
        </div>
        <div class="col-auto">
          @if (store.canCreate()) {
            <button class="btn btn-primary" (click)="navigateToAdd()">
              <i class="fas fa-plus me-2"></i>
              Add Employment Type
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
          <select
            class="form-select"
            [ngModel]="permanentFilter()"
            (ngModelChange)="onPermanentChange($event)"
          >
            <option value="">All Types</option>
            <option [ngValue]="true">Permanent</option>
            <option [ngValue]="false">Contract</option>
          </select>
        </div>
      </div>

      @if (store.loading()) {
        <div class="card shadow-sm">
          <div class="card-body">
            @for (row of skeletonRows; track $index) {
              <app-loading-skeleton
                type="table-row"
                [columns]="['200px', '100px', '100px', '120px', '120px', '100px', '80px', '100px']"
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
      } @else {
        <div class="card shadow-sm">
          <div class="card-body pt-0">
            @if (store.employmentTypes().length === 0) {
              <app-empty-state
                icon="work"
                title="No Employment Types Found"
                message="Get started by creating your first employment type."
                actionLabel="Add Employment Type"
                actionIcon="add"
                (action)="navigateToAdd()"
              ></app-empty-state>
            } @else {
              <div class="table-responsive">
                <table mat-table [dataSource]="dataSource" class="table table-hover">
                  <ng-container matColumnDef="name">
                    <th mat-header-cell *matHeaderCellDef>Employment Type</th>
                    <td mat-cell *matCellDef="let emp">{{ emp.name }}</td>
                  </ng-container>

                  <ng-container matColumnDef="code">
                    <th mat-header-cell *matHeaderCellDef>Code</th>
                    <td mat-cell *matCellDef="let emp">
                      <span class="badge bg-secondary">{{ emp.code }}</span>
                    </td>
                  </ng-container>

                  <ng-container matColumnDef="isPermanent">
                    <th mat-header-cell *matHeaderCellDef>Type</th>
                    <td mat-cell *matCellDef="let emp">
                      @if (emp.isPermanent) {
                        <span class="badge bg-primary">Permanent</span>
                      } @else {
                        <span class="badge bg-warning">Contract</span>
                      }
                    </td>
                  </ng-container>

                  <ng-container matColumnDef="probationMonths">
                    <th mat-header-cell *matHeaderCellDef>Probation (Months)</th>
                    <td mat-cell *matCellDef="let emp">{{ emp.probationMonths || '-' }}</td>
                  </ng-container>

                  <ng-container matColumnDef="noticePeriodDays">
                    <th mat-header-cell *matHeaderCellDef>Notice Period (Days)</th>
                    <td mat-cell *matCellDef="let emp">{{ emp.noticePeriodDays || '-' }}</td>
                  </ng-container>

                  <ng-container matColumnDef="status">
                    <th mat-header-cell *matHeaderCellDef>Status</th>
                    <td mat-cell *matCellDef="let emp">
                      @if (emp.status === 'active') {
                        <span class="badge bg-success">Active</span>
                      } @else {
                        <span class="badge bg-danger">Inactive</span>
                      }
                    </td>
                  </ng-container>

                  <ng-container matColumnDef="employeeCount">
                    <th mat-header-cell *matHeaderCellDef>Employees</th>
                    <td mat-cell *matCellDef="let emp">{{ emp.employeeCount || 0 }}</td>
                  </ng-container>

                  <ng-container matColumnDef="actions">
                    <th mat-header-cell *matHeaderCellDef>Actions</th>
                    <td mat-cell *matCellDef="let emp">
                      @if (store.canEdit()) {
                        <button
                          class="btn-action btn-edit me-1"
                          (click)="navigateToEdit(emp)"
                          title="Edit"
                        >
                          <i class="fas fa-pencil-alt"></i>
                        </button>
                      }
                      <button
                        class="btn-action me-1"
                        [class.btn-toggle-active]="emp.status === 'active'"
                        [class.btn-toggle-inactive]="emp.status === 'inactive'"
                        (click)="onToggleStatus(emp)"
                        [title]="emp.status === 'active' ? 'Deactivate' : 'Activate'"
                      >
                        @if (emp.status === 'active') {
                          <i class="fas fa-ban"></i>
                        } @else {
                          <i class="fas fa-check"></i>
                        }
                      </button>
                      @if (store.canDelete()) {
                        <button
                          class="btn-action btn-delete ms-1"
                          (click)="onDelete(emp)"
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
                        icon="work"
                        title="No Employment Types Found"
                        message="Get started by creating your first employment type."
                        actionLabel="Add Employment Type"
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
      }
    </div>
  `,
})
export class EmploymentTypeListComponent implements OnInit {
  readonly store = inject(EmploymentTypeStore);
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

  displayedColumns = [
    'name',
    'code',
    'isPermanent',
    'probationMonths',
    'noticePeriodDays',
    'status',
    'employeeCount',
    'actions',
  ];
  dataSource = new MatTableDataSource<EmploymentType>([]);

  searchTerm = signal<string>('');
  statusFilter = signal<string>('');
  permanentFilter = signal<boolean | ''>('');
  skeletonRows = Array(5).fill(0);

  readonly Permission = Permission;

  ngOnInit(): void {
    this.store.loadEmploymentTypes();
    this.setupSearchDebounce();
    this.loadDataSource();
  }

  private loadDataSource(): void {
    this.dataSource.data = this.store.employmentTypes();
  }

  private setupSearchDebounce(): void {
    this.searchSubject
      .pipe(debounceTime(300), distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe(() => {
        this.store.loadEmploymentTypes({ search: this.searchTerm(), page: 1 });
      });
  }

  onSearchChange(value: string): void {
    this.searchTerm.set(value);
    this.searchSubject.next(value);
  }

  onStatusChange(value: string): void {
    this.statusFilter.set(value);
    this.store.loadEmploymentTypes({ status: value as any, page: 1 });
  }

  onPermanentChange(value: boolean | ''): void {
    this.permanentFilter.set(value);
    this.store.loadEmploymentTypes({ isPermanent: value === '' ? undefined : value, page: 1 });
  }

  onPageChange(page: number): void {
    if (page < 1 || page > this.store.pagination().totalPages) return;
    this.store.loadEmploymentTypes({ page, limit: this.store.pagination().limit });
  }

  onPageSizeChange(limit: number): void {
    this.store.loadEmploymentTypes({ page: 1, limit });
  }

  reload(): void {
    this.store.loadEmploymentTypes();
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
    this.router.navigate(['/masters/employment-types/add']);
  }

  navigateToEdit(emp: EmploymentType): void {
    this.router.navigate(['/masters/employment-types/edit', emp.id]);
  }

  async onToggleStatus(emp: EmploymentType): Promise<void> {
    const action = emp.status === 'active' ? 'deactivate' : 'activate';
    const confirmed = await this.modalService.confirm(
      `${action.charAt(0).toUpperCase() + action.slice(1)} Employment Type`,
      `Are you sure you want to ${action} "${emp.name}"?`,
    );

    if (confirmed) {
      this.store.toggleStatus(emp.id).subscribe({
        next: (response) => {
          if (response?.success) {
            this.toasterService.success('Success', `Employment type ${action}d successfully`);
            this.store.loadEmploymentTypes();
          } else {
            this.toasterService.error(
              'Error',
              response?.message || `Failed to ${action} employment type`,
            );
          }
        },
      });
    }
  }

  async onDelete(emp: EmploymentType): Promise<void> {
    const confirmed = await this.modalService.confirm(
      'Delete Employment Type',
      `Are you sure you want to delete "${emp.name}"? This action cannot be undone.`,
    );

    if (confirmed) {
      this.store.deleteEmploymentType(emp.id).subscribe({
        next: (response) => {
          if (response?.success) {
            this.toasterService.success('Success', 'Employment type deleted successfully');
            this.store.loadEmploymentTypes();
          } else {
            this.toasterService.error(
              'Error',
              response?.message || 'Failed to delete employment type',
            );
          }
        },
      });
    }
  }
}
