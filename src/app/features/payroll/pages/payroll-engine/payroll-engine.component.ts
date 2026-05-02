import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatMenuModule } from '@angular/material/menu';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatGridListModule } from '@angular/material/grid-list';
import { PayrollRun, PayrollRunEmployee, PayrollStatus } from '../../models/payroll.model';

@Component({
  selector: 'app-payroll-engine',
  standalone: false,
  template: `
    <div class="payroll-engine-container">
      <mat-card>
        <mat-card-header>
          <mat-card-title>
            <mat-icon>precision_manufacturing</mat-icon>
            Payroll Engine
          </mat-card-title>
          <div class="header-actions">
            <button mat-raised-button color="primary" (click)="createPayrollRun()">
              <mat-icon>add</mat-icon> New Payroll Run
            </button>
          </div>
        </mat-card-header>
        <mat-card-content>
          <div class="summary-cards">
            <mat-card class="summary-card">
              <mat-card-content>
                <div class="summary-icon employees">
                  <mat-icon>people</mat-icon>
                </div>
                <div class="summary-details">
                  <span class="summary-value">{{ selectedRun?.totalEmployees || 0 }}</span>
                  <span class="summary-label">Employees</span>
                </div>
              </mat-card-content>
            </mat-card>
            <mat-card class="summary-card">
              <mat-card-content>
                <div class="summary-icon gross">
                  <mat-icon>account_balance</mat-icon>
                </div>
                <div class="summary-details">
                  <span class="summary-value">{{
                    selectedRun?.totalGross || 0 | currency: 'USD'
                  }}</span>
                  <span class="summary-label">Gross Salary</span>
                </div>
              </mat-card-content>
            </mat-card>
            <mat-card class="summary-card">
              <mat-card-content>
                <div class="summary-icon deductions">
                  <mat-icon>remove_circle</mat-icon>
                </div>
                <div class="summary-details">
                  <span class="summary-value">{{
                    selectedRun?.totalDeductions || 0 | currency: 'USD'
                  }}</span>
                  <span class="summary-label">Deductions</span>
                </div>
              </mat-card-content>
            </mat-card>
            <mat-card class="summary-card">
              <mat-card-content>
                <div class="summary-icon net">
                  <mat-icon>payments</mat-icon>
                </div>
                <div class="summary-details">
                  <span class="summary-value">{{
                    selectedRun?.totalNet || 0 | currency: 'USD'
                  }}</span>
                  <span class="summary-label">Net Pay</span>
                </div>
              </mat-card-content>
            </mat-card>
          </div>

          <div class="runs-section">
            <h3>Payroll Runs</h3>
            <div class="runs-list">
              <mat-card
                *ngFor="let run of payrollRuns"
                class="run-card"
                [class.selected]="selectedRun?.id === run.id"
                (click)="selectRun(run)"
              >
                <mat-card-content>
                  <div class="run-header">
                    <span class="run-period">{{ getPeriodLabel(run) }}</span>
                    <mat-chip [color]="getStatusColor(run.status)" selected>{{
                      run.status | titlecase
                    }}</mat-chip>
                  </div>
                  <div class="run-progress" *ngIf="run.status === 'processing'">
                    <mat-progress-bar mode="indeterminate"></mat-progress-bar>
                    <span class="progress-text"
                      >{{ run.processedEmployees }}/{{ run.totalEmployees }} processed</span
                    >
                  </div>
                  <div class="run-actions">
                    <button
                      mat-button
                      color="primary"
                      (click)="processRun(run); $event.stopPropagation()"
                      [disabled]="run.status !== 'draft'"
                    >
                      <mat-icon>play_arrow</mat-icon> Process
                    </button>
                    <button
                      mat-button
                      color="accent"
                      (click)="previewRun(run); $event.stopPropagation()"
                      [disabled]="run.status !== 'processing'"
                    >
                      <mat-icon>visibility</mat-icon> Preview
                    </button>
                    <button
                      mat-button
                      color="warn"
                      (click)="approveRun(run); $event.stopPropagation()"
                      [disabled]="run.status !== 'preview'"
                    >
                      <mat-icon>check_circle</mat-icon> Approve
                    </button>
                    <button
                      mat-button
                      color="primary"
                      (click)="releaseRun(run); $event.stopPropagation()"
                      [disabled]="run.status !== 'approved'"
                    >
                      <mat-icon>lock_open</mat-icon> Release
                    </button>
                  </div>
                </mat-card-content>
              </mat-card>
            </div>
          </div>

          <div class="employees-section" *ngIf="selectedRun">
            <h3>Employees in Run - {{ getPeriodLabel(selectedRun) }}</h3>
            <table mat-table [dataSource]="runEmployees" class="full-width-table">
              <ng-container matColumnDef="employeeCode">
                <th mat-header-cell *matHeaderCellDef>Code</th>
                <td mat-cell *matCellDef="let row">{{ row.employeeCode }}</td>
              </ng-container>
              <ng-container matColumnDef="employeeName">
                <th mat-header-cell *matHeaderCellDef>Name</th>
                <td mat-cell *matCellDef="let row">{{ row.employeeName }}</td>
              </ng-container>
              <ng-container matColumnDef="departmentName">
                <th mat-header-cell *matHeaderCellDef>Department</th>
                <td mat-cell *matCellDef="let row">{{ row.departmentName }}</td>
              </ng-container>
              <ng-container matColumnDef="grossSalary">
                <th mat-header-cell *matHeaderCellDef>Gross</th>
                <td mat-cell *matCellDef="let row">{{ row.grossSalary | currency: 'USD' }}</td>
              </ng-container>
              <ng-container matColumnDef="deductions">
                <th mat-header-cell *matHeaderCellDef>Deductions</th>
                <td mat-cell *matCellDef="let row">{{ row.deductions | currency: 'USD' }}</td>
              </ng-container>
              <ng-container matColumnDef="netSalary">
                <th mat-header-cell *matHeaderCellDef>Net Pay</th>
                <td mat-cell *matCellDef="let row">{{ row.netSalary | currency: 'USD' }}</td>
              </ng-container>
              <ng-container matColumnDef="status">
                <th mat-header-cell *matHeaderCellDef>Status</th>
                <td mat-cell *matCellDef="let row">
                  <mat-chip
                    [color]="
                      row.status === 'processed'
                        ? 'primary'
                        : row.status === 'error'
                          ? 'warn'
                          : 'accent'
                    "
                    selected
                  >
                    {{ row.status | titlecase }}
                  </mat-chip>
                </td>
              </ng-container>
              <tr mat-header-row *matHeaderRowDef="employeeColumns"></tr>
              <tr mat-row *matRowDef="let row; columns: employeeColumns"></tr>
            </table>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styleUrls: ['./payroll-engine.component.scss'],
})
export class PayrollEngineComponent implements OnInit {
  payrollRuns: PayrollRun[] = [];
  selectedRun: PayrollRun | null = null;
  runEmployees: PayrollRunEmployee[] = [];
  employeeColumns: string[] = [
    'employeeCode',
    'employeeName',
    'departmentName',
    'grossSalary',
    'deductions',
    'netSalary',
    'status',
  ];

  constructor(
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
  ) {}

  ngOnInit() {
    this.loadPayrollRuns();
  }

  loadPayrollRuns() {
    this.payrollRuns = [
      {
        id: 1,
        payCycleId: 1,
        payCycleName: 'Monthly',
        period: { month: 4, year: 2026, startDate: '2026-04-01', endDate: '2026-04-30' },
        month: 4,
        year: 2026,
        status: PayrollStatus.DRAFT,
        totalEmployees: 50,
        processedEmployees: 0,
        totalGross: 500000,
        totalDeductions: 50000,
        totalNet: 450000,
        totalEarnings: 500000,
        netPay: 450000,
      },
      {
        id: 2,
        payCycleId: 1,
        payCycleName: 'Monthly',
        period: { month: 3, year: 2026, startDate: '2026-03-01', endDate: '2026-03-31' },
        month: 3,
        year: 2026,
        status: PayrollStatus.PROCESSING,
        totalEmployees: 48,
        processedEmployees: 30,
        totalGross: 480000,
        totalDeductions: 48000,
        totalNet: 432000,
        totalEarnings: 480000,
        netPay: 432000,
      },
      {
        id: 3,
        payCycleId: 1,
        payCycleName: 'Monthly',
        period: { month: 2, year: 2026, startDate: '2026-02-01', endDate: '2026-02-28' },
        month: 2,
        year: 2026,
        status: PayrollStatus.APPROVED,
        totalEmployees: 45,
        processedEmployees: 45,
        totalGross: 450000,
        totalDeductions: 45000,
        totalNet: 405000,
        totalEarnings: 450000,
        netPay: 405000,
        approvedBy: 1,
        approvedByName: 'Admin',
        approvedAt: '2026-02-25',
      },
    ];
    if (this.payrollRuns.length > 0) {
      this.selectRun(this.payrollRuns[0]);
    }
  }

  selectRun(run: PayrollRun) {
    this.selectedRun = run;
    this.loadRunEmployees(run.id);
  }

  loadRunEmployees(runId: number) {
    this.runEmployees = [
      {
        id: 1,
        payrollRunId: runId,
        employeeId: 1,
        employeeCode: 'EMP001',
        employeeName: 'John Doe',
        departmentName: 'IT',
        grossSalary: 10000,
        deductions: 1000,
        netSalary: 9000,
        status: 'processed',
        earnings: [{ component: 'Basic', amount: 5000 }],
        deductionDetails: [{ component: 'PF', amount: 500 }],
      },
      {
        id: 2,
        payrollRunId: runId,
        employeeId: 2,
        employeeCode: 'EMP002',
        employeeName: 'Jane Smith',
        departmentName: 'HR',
        grossSalary: 12000,
        deductions: 1200,
        netSalary: 10800,
        status: 'processed',
        earnings: [{ component: 'Basic', amount: 6000 }],
        deductionDetails: [{ component: 'PF', amount: 600 }],
      },
      {
        id: 3,
        payrollRunId: runId,
        employeeId: 3,
        employeeCode: 'EMP003',
        employeeName: 'Bob Wilson',
        departmentName: 'Finance',
        grossSalary: 8000,
        deductions: 800,
        netSalary: 7200,
        status: 'pending',
        earnings: [{ component: 'Basic', amount: 4000 }],
        deductionDetails: [{ component: 'PF', amount: 400 }],
      },
    ];
  }

  getPeriodLabel(run: PayrollRun): string {
    const months = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ];
    return `${months[run.period.month - 1]} ${run.period.year}`;
  }

  getStatusColor(status: string): string {
    const colors: Record<string, string> = {
      draft: 'accent',
      processing: 'warn',
      preview: 'primary',
      approved: 'primary',
      released: 'accent',
      locked: 'warn',
    };
    return colors[status] || 'primary';
  }

  createPayrollRun() {
    this.snackBar.open('Create payroll run dialog - to be implemented', 'Close', {
      duration: 3000,
    });
  }

  processRun(run: PayrollRun) {
    run.status = PayrollStatus.PROCESSING;
    this.snackBar.open('Processing payroll run...', 'Close', { duration: 3000 });
  }

  previewRun(run: PayrollRun) {
    run.status = PayrollStatus.PREVIEW;
    this.snackBar.open('Payroll run ready for preview', 'Close', { duration: 3000 });
  }

  approveRun(run: PayrollRun) {
    run.status = PayrollStatus.APPROVED;
    run.approvedBy = 1;
    run.approvedByName = 'Admin';
    run.approvedAt = new Date().toISOString();
    this.snackBar.open('Payroll run approved (Maker-Checker flow)', 'Close', { duration: 3000 });
  }

  releaseRun(run: PayrollRun) {
    run.status = PayrollStatus.RELEASED;
    run.releasedBy = 1;
    run.releasedByName = 'Admin';
    run.releasedAt = new Date().toISOString();
    this.snackBar.open('Payroll run released', 'Close', { duration: 3000 });
  }
}
