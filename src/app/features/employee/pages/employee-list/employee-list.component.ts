import {
  Component,
  OnInit,
  inject,
  signal,
  ChangeDetectionStrategy,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subject, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { EmployeeStore } from '../../services/employee.store';
import { EmployeeListItem } from '../../models/employee.model';
import { Permission } from '../../../../core/models/rbac.models';
import { getEmploymentStatusLabel, EmploymentStatus } from '../../models/employee.model';

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
            <button class="btn btn-primary" (click)="navigateToAdd()">
              <i class="fas fa-plus me-2"></i>
              Add Employee
            </button>
          }
        </div>
      </div>

      <div class="row mb-3">
        <div class="col-md-4">
          <div class="input-group">
            <span class="input-group-text">
              <i class="fas fa-search"></i>
            </span>
            <input
              type="text"
              class="form-control"
              placeholder="Search by name, email, code..."
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
            [ngModel]="employmentStatusFilter()"
            (ngModelChange)="onEmploymentStatusChange($event)"
          >
            <option value="">All Employment</option>
            <option value="probation">Probation</option>
            <option value="confirmed">Confirmed</option>
            <option value="resigned">Resigned</option>
            <option value="terminated">Terminated</option>
          </select>
        </div>
      </div>

      @if (store.loading()) {
        <div class="text-center py-5">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
          <p class="mt-3 text-muted">Loading employees...</p>
        </div>
      } @else {
        <div class="card shadow-sm">
          <div class="card-body">
            <div class="table-responsive">
              <table class="table table-hover">
                <thead>
                  <tr>
                    <th>Employee</th>
                    <th>Code</th>
                    <th>Department</th>
                    <th>Designation</th>
                    <th>Location</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  @for (employee of store.employees(); track employee.id) {
                    <tr>
                      <td>
                        <div class="d-flex align-items-center">
                          <div class="avatar-circle me-2">
                            {{ employee.fullName.charAt(0) || 'U' }}
                          </div>
                          <div>
                            <div class="fw-medium">{{ employee.fullName }}</div>
                            <div class="text-muted small">{{ employee.email }}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span class="badge bg-secondary">{{ employee.employeeCode }}</span>
                      </td>
                      <td>{{ employee.departmentName || '-' }}</td>
                      <td>{{ employee.designationName || '-' }}</td>
                      <td>{{ employee.locationName || '-' }}</td>
                      <td>
                        @if (employee.status === 'active') {
                          <span class="badge bg-success">Active</span>
                        } @else {
                          <span class="badge bg-danger">Inactive</span>
                        }
                      </td>
                      <td>
                        <div class="btn-group btn-group-sm">
                          <button
                            class="btn btn-outline-primary"
                            (click)="navigateToView(employee)"
                            title="View"
                          >
                            <i class="fas fa-eye"></i>
                          </button>
                          @if (store.canEdit()) {
                            <button
                              class="btn btn-outline-primary"
                              (click)="navigateToEdit(employee)"
                              title="Edit"
                            >
                              <i class="fas fa-pencil-alt"></i>
                            </button>
                          }
                          @if (store.canDelete()) {
                            <button
                              class="btn btn-outline-danger"
                              (click)="onDelete(employee)"
                              title="Delete"
                            >
                              <i class="fas fa-trash"></i>
                            </button>
                          }
                        </div>
                      </td>
                    </tr>
                  } @empty {
                    <tr>
                      <td colspan="7" class="text-center py-4">
                        <div class="text-muted">
                          <i class="fas fa-users fa-2x mb-2 d-block"></i>
                          No employees found
                        </div>
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>

            <div class="d-flex justify-content-between align-items-center mt-3">
              <div class="text-muted small">
                Showing {{ store.employees().length }} of {{ store.total() }} employees
              </div>
              <nav>
                <ul class="pagination mb-0">
                  <li class="page-item" [class.disabled]="store.page() === 1">
                    <a class="page-link" (click)="onPageChange(store.page() - 1)">Previous</a>
                  </li>
                  <li class="page-item active">
                    <span class="page-link">Page {{ store.page() }}</span>
                  </li>
                  <li
                    class="page-item"
                    [class.disabled]="store.page() >= store.pagination().totalPages"
                  >
                    <a class="page-link" (click)="onPageChange(store.page() + 1)">Next</a>
                  </li>
                </ul>
              </nav>
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [
    `
      .avatar-circle {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        background-color: #6c757d;
        color: white;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 600;
      }
    `,
  ],
})
export class EmployeeListComponent implements OnInit {
  readonly store = inject(EmployeeStore);
  private router = inject(Router);
  private destroy$ = new Subject<void>();
  private searchSubject = new Subject<string>();

  searchTerm = signal<string>('');
  statusFilter = signal<string>('');
  employmentStatusFilter = signal<string>('');

  readonly Permission = Permission;
  readonly getEmploymentStatusLabel = getEmploymentStatusLabel;

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

  onSearchChange(value: string): void {
    this.searchTerm.set(value);
    this.searchSubject.next(value);
  }

  onStatusChange(value: string): void {
    this.statusFilter.set(value);
    this.store.loadEmployees({ status: value as any, page: 1 });
  }

  onEmploymentStatusChange(value: string): void {
    this.employmentStatusFilter.set(value);
    this.store.loadEmployees({ employmentStatus: value as any, page: 1 });
  }

  onPageChange(page: number): void {
    if (page > 0 && page <= this.store.pagination().totalPages) {
      this.store.loadEmployees({ page });
    }
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

  async onDelete(employee: EmployeeListItem): Promise<void> {
    const confirmed = confirm(`Are you sure you want to delete "${employee.fullName}"?`);
    if (confirmed) {
      this.store.deleteEmployee(employee.id).subscribe();
    }
  }
}
