import {
  Component,
  OnInit,
  inject,
  signal,
  ChangeDetectionStrategy,
  computed,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subject, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';
import { MatTableModule } from '@angular/material/table';
import { MatSortModule } from '@angular/material/sort';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { EmployeeStore } from '../../services/employee.store';
import { EmployeeListItem } from '../../models/employee.model';
import { Permission } from '../../../../core/models/rbac.models';

@Component({
  selector: 'app-employee-list',
  standalone: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="container-fluid">
      <div class="row mb-4">
        <div class="col">
          <h2 class="page-title">
            <i class="fas fa-users me-2"></i>
            Employee Management
          </h2>
        </div>
        <div class="col-auto">
          @if (store.canCreate()) {
            <button mat-flat-button color="primary" (click)="navigateToAdd()">
              <mat-icon>add</mat-icon>
              Add Employee
            </button>
          }
        </div>
      </div>

      <div class="card shadow-sm mb-4">
        <div class="card-body">
          <div class="row mb-3">
            <div class="col-md-4">
              <mat-form-field appearance="outline" class="w-100">
                <mat-icon matPrefix>search</mat-icon>
                <input
                  matInput
                  placeholder="Search by name, email, code..."
                  [ngModel]="searchTerm()"
                  (ngModelChange)="onSearchChange($event)"
                />
                @if (searchTerm()) {
                  <button matSuffix mat-icon-button (click)="clearSearch()">
                    <mat-icon>close</mat-icon>
                  </button>
                }
              </mat-form-field>
            </div>
            <div class="col-md-3">
              <mat-form-field appearance="outline" class="w-100">
                <mat-label>Status</mat-label>
                <mat-select [ngModel]="statusFilter()" (ngModelChange)="onStatusChange($event)">
                  <mat-option value="">All Status</mat-option>
                  <mat-option value="active">Active</mat-option>
                  <mat-option value="inactive">Inactive</mat-option>
                </mat-select>
              </mat-form-field>
            </div>
            <div class="col-md-3">
              <mat-form-field appearance="outline" class="w-100">
                <mat-label>Employment</mat-label>
                <mat-select
                  [ngModel]="employmentStatusFilter()"
                  (ngModelChange)="onEmploymentStatusChange($event)"
                >
                  <mat-option value="">All Employment</mat-option>
                  <mat-option value="probation">Probation</mat-option>
                  <mat-option value="confirmed">Confirmed</mat-option>
                  <mat-option value="resigned">Resigned</mat-option>
                  <mat-option value="terminated">Terminated</mat-option>
                </mat-select>
              </mat-form-field>
            </div>
            <div class="col-md-2 d-flex align-items-center">
              <button mat-stroked-button [disabled]="!store.hasData()" (click)="onExport()">
                <mat-icon>download</mat-icon>
                Export
              </button>
            </div>
          </div>

          @if (hasActiveFilters()) {
            <div class="d-flex align-items-center gap-2 mb-3">
              <span class="text-muted small">Active filters:</span>
              @if (searchTerm()) {
                <mat-chip (removed)="clearSearch()">
                  Search: {{ searchTerm() }}
                  <mat-icon matChipRemove>cancel</mat-icon>
                </mat-chip>
              }
              @if (statusFilter()) {
                <mat-chip (removed)="clearStatusFilter()">
                  Status: {{ statusFilter() }}
                  <mat-icon matChipRemove>cancel</mat-icon>
                </mat-chip>
              }
              @if (employmentStatusFilter()) {
                <mat-chip (removed)="clearEmploymentStatusFilter()">
                  Employment: {{ employmentStatusFilter() }}
                  <mat-icon matChipRemove>cancel</mat-icon>
                </mat-chip>
              }
              <button mat-button (click)="clearAllFilters()">Clear All</button>
            </div>
          }

          @if (selectedEmployees().length > 0) {
            <div class="bulk-actions-bar">
              <div class="d-flex align-items-center gap-2">
                <mat-icon>check_circle</mat-icon>
                <span>{{ selectedEmployees().length }} employees selected</span>
                <mat-chip>{{ selectedEmployees().length }} of {{ store.total() }}</mat-chip>
              </div>
              <div class="d-flex gap-1">
                <button mat-flat-button color="primary" (click)="bulkActivate()">
                  <mat-icon>check_circle</mat-icon> Activate
                </button>
                <button mat-flat-button color="warn" (click)="bulkDeactivate()">
                  <mat-icon>block</mat-icon> Deactivate
                </button>
                <button mat-flat-button color="warn" (click)="confirmBulkDelete()">
                  <mat-icon>delete</mat-icon> Delete
                </button>
              </div>
              <button mat-icon-button (click)="clearSelection()" matTooltip="Clear selection">
                <mat-icon>close</mat-icon>
              </button>
            </div>
          }
        </div>
      </div>

      <div class="card shadow-sm">
        <div class="card-body p-0">
          @if (store.loading() && !store.hasData()) {
            <div class="p-4">
              @for (row of skeletonRows; track $index) {
                <div class="skeleton-row">
                  <div class="skeleton-cell checkbox"></div>
                  <div class="skeleton-cell" style="flex: 2"></div>
                  <div class="skeleton-cell"></div>
                  <div class="skeleton-cell"></div>
                  <div class="skeleton-cell"></div>
                  <div class="skeleton-cell"></div>
                  <div class="skeleton-cell"></div>
                </div>
              }
            </div>
          } @else if (!store.hasData() && !store.loading()) {
            <div class="empty-state">
              <mat-icon class="empty-icon">people</mat-icon>
              <h3>No Employees Found</h3>
              <p>{{ emptyMessage() }}</p>
              <button mat-flat-button color="primary" (click)="navigateToAdd()">
                <mat-icon>add</mat-icon>
                Add Employee
              </button>
            </div>
          } @else {
            <div class="table-responsive">
              <table mat-table [dataSource]="store.items()" class="employee-table w-100">
                <ng-container matColumnDef="select">
                  <th mat-header-cell *matHeaderCellDef>
                    <mat-checkbox
                      (change)="toggleAllRows()"
                      [checked]="isAllSelected()"
                      [indeterminate]="isIndeterminate()"
                    >
                    </mat-checkbox>
                  </th>
                  <td mat-cell *matCellDef="let row">
                    <mat-checkbox
                      (click)="$event.stopPropagation()"
                      (change)="toggleRow(row)"
                      [checked]="isSelected(row)"
                    >
                    </mat-checkbox>
                  </td>
                </ng-container>

                <ng-container matColumnDef="employee">
                  <th mat-header-cell *matHeaderCellDef>Employee</th>
                  <td mat-cell *matCellDef="let row">
                    <div class="d-flex align-items-center">
                      <div class="avatar-circle me-2">
                        {{ row.fullName?.charAt(0) || 'U' }}
                      </div>
                      <div>
                        <div class="fw-medium">{{ row.fullName }}</div>
                        <div class="text-muted small">{{ row.email }}</div>
                      </div>
                    </div>
                  </td>
                </ng-container>

                <ng-container matColumnDef="code">
                  <th mat-header-cell *matHeaderCellDef>Code</th>
                  <td mat-cell *matCellDef="let row">
                    <span class="badge bg-secondary">{{ row.employeeCode }}</span>
                  </td>
                </ng-container>

                <ng-container matColumnDef="department">
                  <th mat-header-cell *matHeaderCellDef>Department</th>
                  <td mat-cell *matCellDef="let row">{{ row.departmentName || '-' }}</td>
                </ng-container>

                <ng-container matColumnDef="designation">
                  <th mat-header-cell *matHeaderCellDef>Designation</th>
                  <td mat-cell *matCellDef="let row">{{ row.designationName || '-' }}</td>
                </ng-container>

                <ng-container matColumnDef="location">
                  <th mat-header-cell *matHeaderCellDef>Location</th>
                  <td mat-cell *matCellDef="let row">{{ row.locationName || '-' }}</td>
                </ng-container>

                <ng-container matColumnDef="status">
                  <th mat-header-cell *matHeaderCellDef>Status</th>
                  <td mat-cell *matCellDef="let row">
                    @if (row.status === 'active') {
                      <span class="badge bg-success">Active</span>
                    } @else {
                      <span class="badge bg-danger">Inactive</span>
                    }
                  </td>
                </ng-container>

                <ng-container matColumnDef="actions">
                  <th mat-header-cell *matHeaderCellDef>Actions</th>
                  <td mat-cell *matCellDef="let row">
                    <div class="d-flex gap-1">
                      <button
                        mat-icon-button
                        color="primary"
                        matTooltip="View"
                        (click)="navigateToView(row)"
                      >
                        <mat-icon>visibility</mat-icon>
                      </button>
                      @if (store.canEdit()) {
                        <button
                          mat-icon-button
                          color="primary"
                          matTooltip="Edit"
                          (click)="navigateToEdit(row)"
                        >
                          <mat-icon>edit</mat-icon>
                        </button>
                      }
                      @if (store.canDelete()) {
                        <button
                          mat-icon-button
                          color="warn"
                          matTooltip="Delete"
                          (click)="onDelete(row)"
                        >
                          <mat-icon>delete</mat-icon>
                        </button>
                      }
                    </div>
                  </td>
                </ng-container>

                <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
                <tr
                  mat-row
                  *matRowDef="let row; columns: displayedColumns"
                  [class.selected]="isSelected(row)"
                  (click)="navigateToView(row)"
                ></tr>
              </table>
            </div>

            <mat-paginator
              [length]="store.total()"
              [pageIndex]="store.page() - 1"
              [pageSize]="store.limit()"
              [pageSizeOptions]="[10, 25, 50, 100]"
              showFirstLastButtons
              (page)="onPageChange($event)"
            >
            </mat-paginator>
          }
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .avatar-circle {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        background-color: var(--text-secondary);
        color: white;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 600;
        font-size: 16px;
      }

      .mat-mdc-row:hover {
        background-color: var(--hover-bg);
        cursor: pointer;
      }

      .mat-mdc-row.selected {
        background-color: var(--selected-bg);
      }

      tr.mat-mdc-row {
        height: 64px;
      }

      th.mat-header-cell {
        font-weight: 600;
      }

      .bulk-actions-bar {
        display: flex;
        align-items: center;
        gap: 16px;
        padding: 12px 16px;
        background: var(--primary-color);
        color: white;
        border-radius: var(--radius-md);
        animation: slideIn 0.2s ease-out;
      }

      @keyframes slideIn {
        from {
          opacity: 0;
          transform: translateY(-10px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      .bulk-actions-bar button {
        color: white;
      }

      .bulk-actions-bar mat-chip {
        background: rgba(255, 255, 255, 0.2);
        color: white;
      }

      .empty-state {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 64px 24px;
        text-align: center;
      }

      .empty-icon {
        font-size: 80px;
        width: 80px;
        height: 80px;
        color: var(--text-muted);
      }

      .empty-state h3 {
        margin: 16px 0 8px;
        font-size: 1.25rem;
        font-weight: 600;
      }

      .empty-state p {
        color: var(--text-secondary);
        margin-bottom: 24px;
        max-width: 400px;
      }
    `,
  ],
})
export class EmployeeListComponent implements OnInit {
  readonly store = inject(EmployeeStore);
  private router = inject(Router);
  private dialog = inject(MatDialog);
  private destroy$ = new Subject<void>();
  private searchSubject = new Subject<string>();

  searchTerm = signal<string>('');
  statusFilter = signal<string>('');
  employmentStatusFilter = signal<string>('');
  selectedEmployees = signal<EmployeeListItem[]>([]);

  skeletonRows = Array(5).fill(0);

  displayedColumns = [
    'select',
    'employee',
    'code',
    'department',
    'designation',
    'location',
    'status',
    'actions',
  ];

  readonly Permission = Permission;

  ngOnInit(): void {
    this.store.loadEmployees();
    this.setupSearchDebounce();
  }

  private setupSearchDebounce(): void {
    this.searchSubject
      .pipe(debounceTime(300), distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe(() => {
        this.store.loadEmployees({ search: this.searchTerm(), page: 1 });
      });
  }

  hasActiveFilters = computed(
    () => !!(this.searchTerm() || this.statusFilter() || this.employmentStatusFilter()),
  );

  emptyMessage = computed(() => {
    if (this.hasActiveFilters()) {
      return 'No employees match your current filters. Try adjusting your search criteria.';
    }
    return 'Get started by adding your first employee to the system.';
  });

  onSearchChange(value: string): void {
    this.searchTerm.set(value);
    this.searchSubject.next(value);
  }

  clearSearch(): void {
    this.searchTerm.set('');
    this.searchSubject.next('');
    this.store.loadEmployees({ search: undefined, page: 1 });
  }

  onStatusChange(value: string): void {
    this.statusFilter.set(value);
    this.store.loadEmployees({ status: value as any, page: 1 });
  }

  clearStatusFilter(): void {
    this.statusFilter.set('');
    this.store.loadEmployees({ status: undefined, page: 1 });
  }

  onEmploymentStatusChange(value: string): void {
    this.employmentStatusFilter.set(value);
    this.store.loadEmployees({ employmentStatus: value as any, page: 1 });
  }

  clearEmploymentStatusFilter(): void {
    this.employmentStatusFilter.set('');
    this.store.loadEmployees({ employmentStatus: undefined, page: 1 });
  }

  clearAllFilters(): void {
    this.searchTerm.set('');
    this.statusFilter.set('');
    this.employmentStatusFilter.set('');
    this.store.clearFilters();
  }

  onPageChange(event: PageEvent): void {
    const page = event.pageIndex + 1;
    const limit = event.pageSize;
    this.store.loadEmployees({ page, limit });
  }

  isSelected(row: EmployeeListItem): boolean {
    return this.selectedEmployees().some((e) => e.id === row.id);
  }

  isAllSelected(): boolean {
    return (
      this.store.items().length > 0 && this.selectedEmployees().length === this.store.items().length
    );
  }

  isIndeterminate(): boolean {
    const selected = this.selectedEmployees().length;
    return selected > 0 && selected < this.store.items().length;
  }

  toggleRow(row: EmployeeListItem): void {
    const current = this.selectedEmployees();
    const index = current.findIndex((e) => e.id === row.id);
    if (index === -1) {
      this.selectedEmployees.set([...current, row]);
    } else {
      this.selectedEmployees.set(current.filter((e) => e.id !== row.id));
    }
  }

  toggleAllRows(): void {
    if (this.isAllSelected()) {
      this.selectedEmployees.set([]);
    } else {
      this.selectedEmployees.set([...this.store.items()]);
    }
  }

  clearSelection(): void {
    this.selectedEmployees.set([]);
  }

  bulkActivate(): void {
    const selected = this.selectedEmployees();
    selected.forEach((emp) => this.store.updateStatus(emp.id, 'active').subscribe());
    this.clearSelection();
  }

  bulkDeactivate(): void {
    const selected = this.selectedEmployees();
    selected.forEach((emp) => this.store.updateStatus(emp.id, 'inactive').subscribe());
    this.clearSelection();
  }

  confirmBulkDelete(): void {
    const selected = this.selectedEmployees();
    if (
      confirm(
        `Are you sure you want to delete ${selected.length} employee(s)? This action cannot be undone.`,
      )
    ) {
      selected.forEach((emp) => this.store.deleteEmployee(emp.id).subscribe());
      this.clearSelection();
    }
  }

  onExport(): void {
    console.log('Export employees');
  }

  navigateToAdd(): void {
    this.router.navigate(['/employees/add']);
  }

  navigateToEdit(employee: EmployeeListItem): void {
    this.router.navigate(['/employees/edit', employee.id]);
  }

  navigateToView(employee: EmployeeListItem): void {
    this.router.navigate(['/employees/view', employee.id]);
  }

  onDelete(employee: EmployeeListItem): void {
    if (
      confirm(
        `Are you sure you want to delete "${employee.fullName}"? This action cannot be undone.`,
      )
    ) {
      this.store.deleteEmployee(employee.id).subscribe();
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
