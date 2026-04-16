import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { PayrollStore } from '../../services/payroll.store';
import { PayrollRun, PayrollStatus, getPayrollStatusLabel } from '../../models/payroll.model';
import { Permission } from '../../../../core/models/rbac.models';
import { LoadingSkeletonComponent } from '../../../../shared/components/loading-skeleton/loading-skeleton.component';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';

@Component({
  selector: 'app-payroll-list',
  standalone: false,
  template: `
    <div class="container-fluid">
      <div class="row mb-4">
        <div class="col">
          <h2 class="page-title">
            <i class="fas fa-money-bill-wave me-2"></i>
            Payroll Management
          </h2>
        </div>
        <div class="col-auto">
          @if (store.canCreateRun()) {
            <button class="btn btn-primary" (click)="createNewRun()">
              <i class="fas fa-plus me-2"></i>
              New Payroll Run
            </button>
          }
        </div>
      </div>

      <!-- Filters -->
      <div class="row mb-3">
        <div class="col-md-3">
          <select class="form-select" [(ngModel)]="yearFilter" (ngModelChange)="onFilterChange()">
            <option value="">All Years</option>
            @for (year of years; track year) {
              <option [value]="year">{{ year }}</option>
            }
          </select>
        </div>
        <div class="col-md-3">
          <select class="form-select" [(ngModel)]="statusFilter" (ngModelChange)="onFilterChange()">
            <option value="">All Status</option>
            @for (status of statusList; track status) {
              <option [value]="status">{{ getStatusLabel(status) }}</option>
            }
          </select>
        </div>
      </div>

      <!-- Payroll Runs Table -->
      @if (store.loading()) {
        <div class="card shadow-sm">
          <div class="card-body">
            @for (row of skeletonRows; track $index) {
              <app-loading-skeleton
                type="table-row"
                [columns]="['120px', '100px', '90px', '130px', '130px', '120px', '120px', '150px']"
              ></app-loading-skeleton>
            }
          </div>
        </div>
      } @else if (store.error()) {
        <div class="alert alert-danger">
          <i class="fas fa-exclamation-triangle me-2"></i>
          {{ store.error() }}
          <button class="btn btn-sm btn-outline-danger ms-3" (click)="reload()">Retry</button>
        </div>
      } @else {
        <div class="card shadow-sm">
          <div class="card-body">
            @if (store.payrollRuns().length === 0) {
              <app-empty-state
                icon="payments"
                title="No Payroll Runs"
                message="Create your first payroll run to get started."
                actionLabel="New Payroll Run"
                actionIcon="add"
                (action)="createNewRun()"
              ></app-empty-state>
            } @else {
              <div class="table-responsive">
                <table class="table table-hover">
                  <thead>
                    <tr>
                      <th>Period</th>
                      <th>Status</th>
                      <th>Employees</th>
                      <th>Total Earnings</th>
                      <th>Total Deductions</th>
                      <th>Net Pay</th>
                      <th>Processed</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    @for (run of store.payrollRuns(); track run.id) {
                      <tr>
                        <td>
                          <strong>{{ getMonthName(run.month) }} {{ run.year }}</strong>
                        </td>
                        <td>
                          <span class="badge" [class]="getStatusClass(run.status)">
                            {{ getStatusLabel(run.status) }}
                          </span>
                        </td>
                        <td>{{ run.totalEmployees }}</td>
                        <td>{{ run.totalEarnings | number: '1.2-2' }}</td>
                        <td>{{ run.totalDeductions | number: '1.2-2' }}</td>
                        <td>
                          <strong>{{ run.netPay | number: '1.2-2' }}</strong>
                        </td>
                        <td>
                          {{ run.processedAt ? (run.processedAt | date: 'dd MMM yyyy') : '-' }}
                        </td>
                        <td>
                          <div class="btn-group btn-group-sm">
                            <button
                              class="btn btn-outline-primary"
                              (click)="viewDetails(run)"
                              title="View"
                            >
                              <i class="fas fa-eye"></i>
                            </button>
                            @if (run.status === 'draft' && store.canCreateRun()) {
                              <button
                                class="btn btn-outline-success"
                                (click)="processRun(run)"
                                title="Process"
                              >
                                <i class="fas fa-play"></i>
                              </button>
                            }
                            @if (run.status === 'processing' && store.canApprove()) {
                              <button
                                class="btn btn-success"
                                (click)="approveRun(run)"
                                title="Approve"
                              >
                                <i class="fas fa-check"></i>
                              </button>
                            }
                            @if (run.status === 'approved' && store.canApprove()) {
                              <button
                                class="btn btn-primary"
                                (click)="markAsPaid(run)"
                                title="Mark as Paid"
                              >
                                <i class="fas fa-money-bill"></i>
                              </button>
                            }
                          </div>
                        </td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>
            }
          </div>
        </div>
      }
    </div>
  `,
})
export class PayrollListComponent implements OnInit {
  readonly store = inject(PayrollStore);
  private router = inject(Router);

  yearFilter = '';
  statusFilter = '';
  years = [2026, 2025, 2024, 2023];
  statusList = Object.values(PayrollStatus);
  skeletonRows = Array(5).fill(0);
  monthNames = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];

  readonly Permission = Permission;
  readonly getStatusLabel = getPayrollStatusLabel;

  ngOnInit(): void {
    this.store.loadPayrollRuns();
  }

  reload(): void {
    this.store.loadPayrollRuns();
  }

  getMonthName(month: number): string {
    return this.monthNames[month - 1];
  }

  getStatusClass(status: PayrollStatus): string {
    const classes: Record<PayrollStatus, string> = {
      [PayrollStatus.DRAFT]: 'bg-secondary',
      [PayrollStatus.PROCESSING]: 'bg-warning',
      [PayrollStatus.APPROVED]: 'bg-success',
      [PayrollStatus.PAID]: 'bg-primary',
    };
    return classes[status] || 'bg-secondary';
  }

  onFilterChange(): void {
    this.store.loadPayrollRuns({
      year: this.yearFilter ? +this.yearFilter : undefined,
      status: this.statusFilter as PayrollStatus,
    });
  }

  createNewRun(): void {
    const month = new Date().getMonth() + 1;
    const year = new Date().getFullYear();
    if (confirm(`Create payroll run for ${this.getMonthName(month)} ${year}?`)) {
      this.store.createRun(month, year).subscribe({
        next: (response) => {
          if (response.success) {
            alert('Payroll run created successfully');
          }
        },
      });
    }
  }

  viewDetails(run: PayrollRun): void {
    this.router.navigate(['/payroll', run.id]);
  }

  processRun(run: PayrollRun): void {
    if (confirm(`Process payroll for ${this.getMonthName(run.month)} ${run.year}?`)) {
      this.store.processRun(run.id).subscribe();
    }
  }

  approveRun(run: PayrollRun): void {
    if (confirm(`Approve payroll for ${this.getMonthName(run.month)} ${run.year}?`)) {
      this.store.approveRun(run.id).subscribe();
    }
  }

  markAsPaid(run: PayrollRun): void {
    if (confirm(`Mark payroll as paid for ${this.getMonthName(run.month)} ${run.year}?`)) {
      this.store.markAsPaid(run.id).subscribe();
    }
  }
}
