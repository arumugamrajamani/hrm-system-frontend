import { Component, OnInit, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { PayrollStore } from '../../services/payroll.store';
import {
  PayrollRecord,
  PayrollRun,
  PayrollStatus,
  getPayrollStatusLabel,
} from '../../models/payroll.model';
import { Permission } from '../../../../core/models/rbac.models';

@Component({
  selector: 'app-payroll-run',
  standalone: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="container-fluid">
      <div class="row mb-4">
        <div class="col">
          <button class="btn btn-outline-secondary mb-2" (click)="goBack()">
            <i class="fas fa-arrow-left me-2"></i>
            Back to Payroll
          </button>
          <h2 class="page-title">
            <i class="fas fa-money-bill-wave me-2"></i>
            {{ getMonthName(run()?.month || 0) }} {{ run()?.year }} Payroll
          </h2>
        </div>
        <div class="col-auto">
          <span class="badge fs-6" [class]="getStatusClass(run()?.status)">
            {{ getStatusLabel(run()?.status) }}
          </span>
        </div>
      </div>

      @if (run()) {
        <div class="row mb-4">
          <div class="col-md-3">
            <div class="card shadow-sm">
              <div class="card-body text-center">
                <h6 class="text-muted mb-2">Total Employees</h6>
                <h3 class="mb-0">{{ run()?.totalEmployees }}</h3>
              </div>
            </div>
          </div>
          <div class="col-md-3">
            <div class="card shadow-sm">
              <div class="card-body text-center">
                <h6 class="text-muted mb-2">Total Earnings</h6>
                <h3 class="mb-0 text-success">{{ run()?.totalEarnings | number: '1.2-2' }}</h3>
              </div>
            </div>
          </div>
          <div class="col-md-3">
            <div class="card shadow-sm">
              <div class="card-body text-center">
                <h6 class="text-muted mb-2">Total Deductions</h6>
                <h3 class="mb-0 text-danger">{{ run()?.totalDeductions | number: '1.2-2' }}</h3>
              </div>
            </div>
          </div>
          <div class="col-md-3">
            <div class="card shadow-sm">
              <div class="card-body text-center">
                <h6 class="text-muted mb-2">Net Pay</h6>
                <h3 class="mb-0 text-primary">{{ run()?.netPay | number: '1.2-2' }}</h3>
              </div>
            </div>
          </div>
        </div>

        @if (store.loading()) {
          <div class="text-center py-5">
            <div class="spinner-border text-primary"></div>
          </div>
        } @else {
          <div class="card shadow-sm">
            <div class="card-header bg-white">
              <h5 class="mb-0">Employee Payroll Records</h5>
            </div>
            <div class="card-body">
              <div class="table-responsive">
                <table class="table table-hover">
                  <thead>
                    <tr>
                      <th>Employee</th>
                      <th>Department</th>
                      <th>Basic Salary</th>
                      <th>Gross Earnings</th>
                      <th>Deductions</th>
                      <th>Net Pay</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    @for (record of store.runRecords(); track record.id) {
                      <tr>
                        <td>
                          <strong>{{ record.employeeName }}</strong>
                        </td>
                        <td>{{ record.departmentName || '-' }}</td>
                        <td>{{ record.basicSalary | number: '1.2-2' }}</td>
                        <td class="text-success">{{ record.grossEarnings | number: '1.2-2' }}</td>
                        <td class="text-danger">{{ record.totalDeductions | number: '1.2-2' }}</td>
                        <td>
                          <strong>{{ record.netPay | number: '1.2-2' }}</strong>
                        </td>
                        <td>
                          <button
                            class="btn btn-sm btn-outline-primary"
                            (click)="downloadSlip(record)"
                          >
                            <i class="fas fa-download"></i>
                          </button>
                        </td>
                      </tr>
                    } @empty {
                      <tr>
                        <td colspan="7" class="text-center py-4 text-muted">No records found</td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        }
      }
    </div>
  `,
})
export class PayrollRunComponent implements OnInit {
  readonly store = inject(PayrollStore);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  runId: number | null = null;
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

  run = () => this.store.currentRun();
  readonly getStatusLabel = getPayrollStatusLabel;
  readonly Permission = Permission;

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      if (params['id']) {
        this.runId = +params['id'];
        this.store.loadRunDetails(this.runId);
        this.store.loadRunRecords(this.runId);
      }
    });
  }

  getMonthName(month: number): string {
    return this.monthNames[month - 1];
  }

  getStatusClass(status: PayrollStatus | undefined): string {
    const classes: Record<string, string> = {
      [PayrollStatus.DRAFT]: 'bg-secondary',
      [PayrollStatus.PROCESSING]: 'bg-warning',
      [PayrollStatus.APPROVED]: 'bg-success',
      [PayrollStatus.PAID]: 'bg-primary',
    };
    return classes[status || ''] || 'bg-secondary';
  }

  downloadSlip(record: PayrollRecord): void {
    if (this.runId) {
      this.store.generateSlip(this.runId, record.employeeId);
    }
  }

  goBack(): void {
    this.router.navigate(['/payroll']);
  }
}
