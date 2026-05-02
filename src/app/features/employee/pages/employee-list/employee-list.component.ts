import {
  Component,
  OnInit,
  OnDestroy,
  inject,
  signal,
  ChangeDetectionStrategy,
  computed,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subject, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatSortModule } from '@angular/material/sort';
import { MatPaginatorModule, MatPaginator, PageEvent } from '@angular/material/paginator';
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
import { EmployeeApiService } from '../../../employees/services/employee-api.service';
import { EmployeeListItem } from '../../models/employee.model';
import { Permission } from '../../../../core/models/rbac.models';
import { ToasterService } from '../../../../core/services/toaster.service';

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
                <mat-chip>{{ selectedEmployees().length }} of {{ totalElements() }}</mat-chip>
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
          @if (isLoading()) {
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
          } @else if (dataSource.data.length === 0 && !isLoading()) {
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
              <table mat-table [dataSource]="dataSource" class="employee-table w-100">
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
              [length]="totalElements()"
              [pageIndex]="currentPage() - 1"
              [pageSize]="pageSize()"
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
export class EmployeeListComponent implements OnInit, OnDestroy {
  readonly store = inject(EmployeeStore);
  private employeeApi = inject(EmployeeApiService);
  private router = inject(Router);
  private toaster = inject(ToasterService);
  private destroy$ = new Subject<void>();
  private searchSubject = new Subject<string>();

  searchTerm = signal<string>('');
  statusFilter = signal<string>('');
  employmentStatusFilter = signal<string>('');
  selectedEmployees = signal<EmployeeListItem[]>([]);
  isLoading = signal<boolean>(false);

  skeletonRows = Array(5).fill(0);
  dataSource = new MatTableDataSource<EmployeeListItem>([]);

  currentPage = signal<number>(1);
  pageSize = signal<number>(10);
  totalElements = signal<number>(0);
  totalPages = signal<number>(0);

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

  @ViewChild(MatPaginator) paginator?: MatPaginator;

  ngOnInit(): void {
    this.loadEmployees();
    this.setupSearchDebounce();
  }

  private loadEmployees(): void {
    this.isLoading.set(true);
    const params = {
      page: this.currentPage(),
      limit: this.pageSize(),
      search: this.searchTerm() || undefined,
      status: this.statusFilter() || undefined,
      employmentStatus: this.employmentStatusFilter() || undefined,
    };

    this.employeeApi.list(params).subscribe({
      next: (response: any) => {
        if (response?.success && response.data) {
          this.dataSource.data = response.data;
          if (response.pagination) {
            this.totalElements.set(response.pagination.total);
            this.totalPages.set(response.pagination.totalPages);
            this.currentPage.set(response.pagination.page);
            this.pageSize.set(response.pagination.limit);
          }
        }
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
      },
    });
  }

  private setupSearchDebounce(): void {
    this.searchSubject
      .pipe(debounceTime(300), distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe(() => {
        this.currentPage.set(1);
        this.loadEmployees();
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
    this.currentPage.set(1);
    this.loadEmployees();
  }

  onStatusChange(value: string): void {
    this.statusFilter.set(value);
    this.currentPage.set(1);
    this.loadEmployees();
  }

  clearStatusFilter(): void {
    this.statusFilter.set('');
    this.currentPage.set(1);
    this.loadEmployees();
  }

  onEmploymentStatusChange(value: string): void {
    this.employmentStatusFilter.set(value);
    this.currentPage.set(1);
    this.loadEmployees();
  }

  clearEmploymentStatusFilter(): void {
    this.employmentStatusFilter.set('');
    this.currentPage.set(1);
    this.loadEmployees();
  }

  clearAllFilters(): void {
    this.searchTerm.set('');
    this.statusFilter.set('');
    this.employmentStatusFilter.set('');
    this.currentPage.set(1);
    this.loadEmployees();
  }

  onPageChange(event: PageEvent): void {
    this.currentPage.set(event.pageIndex + 1);
    this.pageSize.set(event.pageSize);
    this.loadEmployees();
  }

  isSelected(row: EmployeeListItem): boolean {
    return this.selectedEmployees().some((e) => e.id === row.id);
  }

  isAllSelected(): boolean {
    return (
      this.dataSource.data.length > 0 &&
      this.selectedEmployees().length === this.dataSource.data.length
    );
  }

  isIndeterminate(): boolean {
    const selected = this.selectedEmployees().length;
    return selected > 0 && selected < this.dataSource.data.length;
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
      this.selectedEmployees.set([...this.dataSource.data]);
    }
  }

  clearSelection(): void {
    this.selectedEmployees.set([]);
  }

  bulkActivate(): void {
    const selected = this.selectedEmployees();
    selected.forEach((emp) => this.store.updateStatus(emp.id, 'active').subscribe());
    this.clearSelection();
    this.loadEmployees();
  }

  bulkDeactivate(): void {
    const selected = this.selectedEmployees();
    selected.forEach((emp) => this.store.updateStatus(emp.id, 'inactive').subscribe());
    this.clearSelection();
    this.loadEmployees();
  }

  confirmBulkDelete(): void {
    const selected = this.selectedEmployees();
    if (
      confirm(
        `Are you sure you want to delete ${selected.length} employee(s)? This action cannot be undone.`,
      )
    ) {
      selected.forEach((emp) => {
        this.store.deleteEmployee(emp.id).subscribe({
          next: () => this.loadEmployees(),
        });
      });
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
      this.store.deleteEmployee(employee.id).subscribe({
        next: () => this.loadEmployees(),
      });
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
