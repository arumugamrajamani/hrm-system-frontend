import { Component, OnInit, OnDestroy, inject, signal, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subject, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator, PageEvent } from '@angular/material/paginator';
import { ShiftStore } from '../../services/shift.store';
import { ShiftApiService } from '../../services/shift-api.service';
import { Shift } from '../../models/shift.model';
import { Permission } from '../../../../../core/models/rbac.models';
import { LoadingSkeletonComponent } from '../../../../../shared/components/loading-skeleton/loading-skeleton.component';
import { EmptyStateComponent } from '../../../../../shared/components/empty-state/empty-state.component';
import { ToasterService, ModalService } from '../../../../../core/services';

@Component({
  selector: 'app-shift-list',
  standalone: false,
  template: `
    <div class="container-fluid">
      <div class="row mb-4">
        <div class="col">
          <h2 class="page-title">
            <i class="fas fa-clock me-2"></i>
            Shift Management
          </h2>
        </div>
        <div class="col-auto">
          @if (this.store.canCreate()) {
            <button class="btn btn-primary" (click)="navigateToAdd()">
              <i class="fas fa-plus me-2"></i>
              Add Shift
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
            [ngModel]="flexibleFilter()"
            (ngModelChange)="onFlexibleChange($event)"
          >
            <option [ngValue]="null">All Types</option>
            <option [ngValue]="true">Flexible</option>
            <option [ngValue]="false">Fixed</option>
          </select>
        </div>
      </div>

      @if (store.loading()) {
        <div class="card shadow-sm">
          <div class="card-body">
            @for (row of skeletonRows; track $index) {
              <app-loading-skeleton
                type="table-row"
                [columns]="['200px', '100px', '100px', '100px', '100px', '80px', '80px', '100px']"
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
            @if (store.shifts().length === 0) {
              <app-empty-state
                icon="schedule"
                title="No Shifts Found"
                message="Get started by creating your first shift."
                actionLabel="Add Shift"
                actionIcon="add"
                (action)="navigateToAdd()"
              ></app-empty-state>
            } @else {
              <div class="table-responsive">
                <table mat-table [dataSource]="dataSource" class="table table-hover">
                  <ng-container matColumnDef="name">
                    <th mat-header-cell *matHeaderCellDef>Shift Name</th>
                    <td mat-cell *matCellDef="let shift">{{ shift.name }}</td>
                  </ng-container>

                  <ng-container matColumnDef="code">
                    <th mat-header-cell *matHeaderCellDef>Code</th>
                    <td mat-cell *matCellDef="let shift">
                      <span class="badge bg-secondary">{{ shift.code }}</span>
                    </td>
                  </ng-container>

                  <ng-container matColumnDef="startTime">
                    <th mat-header-cell *matHeaderCellDef>Start Time</th>
                    <td mat-cell *matCellDef="let shift">{{ shift.startTime }}</td>
                  </ng-container>

                  <ng-container matColumnDef="endTime">
                    <th mat-header-cell *matHeaderCellDef>End Time</th>
                    <td mat-cell *matCellDef="let shift">{{ shift.endTime }}</td>
                  </ng-container>

                  <ng-container matColumnDef="workingHours">
                    <th mat-header-cell *matHeaderCellDef>Working Hours</th>
                    <td mat-cell *matCellDef="let shift">{{ shift.workingHours }} hrs</td>
                  </ng-container>

                  <ng-container matColumnDef="isFlexible">
                    <th mat-header-cell *matHeaderCellDef>Type</th>
                    <td mat-cell *matCellDef="let shift">
                      @if (shift.isFlexible) {
                        <span class="badge bg-info">Flexible</span>
                      } @else {
                        <span class="badge bg-warning">Fixed</span>
                      }
                    </td>
                  </ng-container>

                  <ng-container matColumnDef="status">
                    <th mat-header-cell *matHeaderCellDef>Status</th>
                    <td mat-cell *matCellDef="let shift">
                      @if (shift.status === 'active') {
                        <span class="badge bg-success">Active</span>
                      } @else {
                        <span class="badge bg-danger">Inactive</span>
                      }
                    </td>
                  </ng-container>

                  <ng-container matColumnDef="employeeCount">
                    <th mat-header-cell *matHeaderCellDef>Employees</th>
                    <td mat-cell *matCellDef="let shift">{{ shift.employeeCount || 0 }}</td>
                  </ng-container>

                  <ng-container matColumnDef="actions">
                    <th mat-header-cell *matHeaderCellDef>Actions</th>
                    <td mat-cell *matCellDef="let shift">
                      @if (store.canEdit()) {
                        <button
                          class="btn-action btn-edit me-1"
                          (click)="navigateToEdit(shift)"
                          title="Edit"
                        >
                          <i class="fas fa-pencil-alt"></i>
                        </button>
                      }
                      <button
                        class="btn-action me-1"
                        [class.btn-toggle-active]="shift.status === 'active'"
                        [class.btn-toggle-inactive]="shift.status === 'inactive'"
                        (click)="onToggleStatus(shift)"
                        [title]="shift.status === 'active' ? 'Deactivate' : 'Activate'"
                      >
                        @if (shift.status === 'active') {
                          <i class="fas fa-ban"></i>
                        } @else {
                          <i class="fas fa-check"></i>
                        }
                      </button>
                      @if (this.store.canDelete()) {
                        <button
                          class="btn-action btn-delete ms-1"
                          (click)="onDelete(shift)"
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
                        icon="schedule"
                        title="No Shifts Found"
                        message="Get started by creating your first shift."
                        actionLabel="Add Shift"
                        actionIcon="add"
                        (action)="navigateToAdd()"
                      ></app-empty-state>
                    </td>
                  </tr>
                </table>
              </div>

              <mat-paginator
                [pageSizeOptions]="[10, 25, 50, 100]"
                [pageSize]="pageSize()"
                [length]="totalElements()"
                [pageIndex]="currentPage() - 1"
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
export class ShiftListComponent implements OnInit {
  readonly store = inject(ShiftStore);
  readonly shiftApi = inject(ShiftApiService);
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
    'startTime',
    'endTime',
    'workingHours',
    'isFlexible',
    'status',
    'employeeCount',
    'actions',
  ];
  dataSource = new MatTableDataSource<Shift>([]);

  searchTerm = signal<string>('');
  statusFilter = signal<string>('');
  flexibleFilter = signal<boolean | null>(null);
  isLoading = signal(false);
  skeletonRows = Array(5).fill(0);

  currentPage = signal<number>(1);
  pageSize = signal<number>(10);
  totalElements = signal<number>(0);
  totalPages = signal<number>(0);

  readonly Permission = Permission;

  ngOnInit(): void {
    this.loadShifts();
    this.setupSearchDebounce();
  }

  private loadShifts(): void {
    this.isLoading.set(true);
    const params = {
      page: this.store.pagination().page,
      limit: this.store.pagination().limit,
      search: this.searchTerm(),
      status: this.statusFilter() || undefined,
      isFlexible: this.flexibleFilter() || undefined,
    };

    this.shiftApi.list(params).subscribe({
      next: (response: any) => {
        console.log('Shift API Response:', response);
        if (response?.data && Array.isArray(response.data)) {
          this.dataSource.data = response.data;
          // Update store with pagination if available
          if (response.meta?.pagination) {
            this.store.loadShifts(); // Refresh store
          }
        }
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
      },
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private setupSearchDebounce(): void {
    this.searchSubject
      .pipe(debounceTime(300), distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe(() => {
        this.store.loadShifts({ search: this.searchTerm(), page: 1 });
      });
  }

  onSearchChange(value: string): void {
    this.searchTerm.set(value);
    this.searchSubject.next(value);
  }

  onStatusChange(value: string): void {
    this.statusFilter.set(value);
    this.store.loadShifts({ status: value as any, page: 1 });
  }

  onFlexibleChange(value: boolean | null): void {
    this.flexibleFilter.set(value);
    this.store.loadShifts({ isFlexible: value || undefined, page: 1 });
  }

  onPageChange(page: number): void {
    if (page < 1 || page > this.store.pagination().totalPages) return;
    this.store.loadShifts({ page, limit: this.store.pagination().limit });
  }

  onPageSizeChange(limit: number): void {
    this.store.loadShifts({ page: 1, limit });
  }

  reload(): void {
    this.store.loadShifts();
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
    this.router.navigate(['/masters/shifts/add']);
  }

  navigateToEdit(shift: Shift): void {
    this.router.navigate(['/masters/shifts/edit', shift.id]);
  }

  async onToggleStatus(shift: Shift): Promise<void> {
    const action = shift.status === 'active' ? 'deactivate' : 'activate';
    const confirmed = await this.modalService.confirm(
      `${action.charAt(0).toUpperCase() + action.slice(1)} Shift`,
      `Are you sure you want to ${action} "${shift.name}"?`,
    );

    if (confirmed) {
      this.store.toggleStatus(shift.id).subscribe({
        next: (response) => {
          if (response?.success) {
            this.toasterService.success('Success', `Shift ${action}d successfully`);
            this.store.loadShifts();
          } else {
            this.toasterService.error('Error', response?.message || `Failed to ${action} shift`);
          }
        },
      });
    }
  }

  async onDelete(shift: Shift): Promise<void> {
    const confirmed = await this.modalService.confirm(
      'Delete Shift',
      `Are you sure you want to delete "${shift.name}"? This action cannot be undone.`,
    );

    if (confirmed) {
      this.store.deleteShift(shift.id).subscribe({
        next: (response) => {
          if (response?.success) {
            this.toasterService.success('Success', 'Shift deleted successfully');
            this.store.loadShifts();
          } else {
            this.toasterService.error('Error', response?.message || 'Failed to delete shift');
          }
        },
      });
    }
  }
}
