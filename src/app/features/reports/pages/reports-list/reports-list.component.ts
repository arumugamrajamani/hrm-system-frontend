import { Component, OnInit, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ReportsStore } from '../../services/reports.store';
import { ReportType, getReportTypeLabel, ReportFormat } from '../../models/report.model';
import { Permission } from '../../../../core/models/rbac.models';

@Component({
  selector: 'app-reports-list',
  standalone: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="container-fluid">
      <div class="row mb-4">
        <div class="col">
          <h2 class="page-title">
            <i class="fas fa-chart-bar me-2"></i>
            Reports
          </h2>
        </div>
      </div>

      <!-- Quick Summary Cards -->
      <div class="row mb-4">
        <div class="col-md-3">
          <div class="card shadow-sm">
            <div class="card-body text-center">
              <h6 class="text-muted mb-2">Employee Reports</h6>
              <h3 class="mb-0 text-primary">{{ employeeReports.length }}</h3>
              <small class="text-muted">Available</small>
            </div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="card shadow-sm">
            <div class="card-body text-center">
              <h6 class="text-muted mb-2">Attendance Reports</h6>
              <h3 class="mb-0 text-success">{{ attendanceReports.length }}</h3>
              <small class="text-muted">Available</small>
            </div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="card shadow-sm">
            <div class="card-body text-center">
              <h6 class="text-muted mb-2">Leave Reports</h6>
              <h3 class="mb-0 text-warning">{{ leaveReports.length }}</h3>
              <small class="text-muted">Available</small>
            </div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="card shadow-sm">
            <div class="card-body text-center">
              <h6 class="text-muted mb-2">Payroll Reports</h6>
              <h3 class="mb-0 text-info">{{ payrollReports.length }}</h3>
              <small class="text-muted">Available</small>
            </div>
          </div>
        </div>
      </div>

      <!-- Report Categories -->
      <div class="row">
        <!-- Employee Reports -->
        <div class="col-md-6 mb-4">
          <div class="card shadow-sm h-100">
            <div class="card-header bg-white">
              <h5 class="mb-0"><i class="fas fa-users me-2"></i>Employee Reports</h5>
            </div>
            <div class="card-body p-0">
              <div class="list-group list-group-flush">
                @for (report of employeeReports; track report.id) {
                  <div class="list-group-item d-flex justify-content-between align-items-center">
                    <div>
                      <div class="fw-bold">{{ report.name }}</div>
                      <small class="text-muted">{{ report.description }}</small>
                    </div>
                    <button class="btn btn-sm btn-outline-primary" (click)="generateReport(report)">
                      <i class="fas fa-download"></i>
                    </button>
                  </div>
                }
              </div>
            </div>
          </div>
        </div>

        <!-- Attendance Reports -->
        <div class="col-md-6 mb-4">
          <div class="card shadow-sm h-100">
            <div class="card-header bg-white">
              <h5 class="mb-0"><i class="fas fa-clock me-2"></i>Attendance Reports</h5>
            </div>
            <div class="card-body p-0">
              <div class="list-group list-group-flush">
                @for (report of attendanceReports; track report.id) {
                  <div class="list-group-item d-flex justify-content-between align-items-center">
                    <div>
                      <div class="fw-bold">{{ report.name }}</div>
                      <small class="text-muted">{{ report.description }}</small>
                    </div>
                    <button class="btn btn-sm btn-outline-primary" (click)="generateReport(report)">
                      <i class="fas fa-download"></i>
                    </button>
                  </div>
                }
              </div>
            </div>
          </div>
        </div>

        <!-- Leave Reports -->
        <div class="col-md-6 mb-4">
          <div class="card shadow-sm h-100">
            <div class="card-header bg-white">
              <h5 class="mb-0"><i class="fas fa-calendar-minus me-2"></i>Leave Reports</h5>
            </div>
            <div class="card-body p-0">
              <div class="list-group list-group-flush">
                @for (report of leaveReports; track report.id) {
                  <div class="list-group-item d-flex justify-content-between align-items-center">
                    <div>
                      <div class="fw-bold">{{ report.name }}</div>
                      <small class="text-muted">{{ report.description }}</small>
                    </div>
                    <button class="btn btn-sm btn-outline-primary" (click)="generateReport(report)">
                      <i class="fas fa-download"></i>
                    </button>
                  </div>
                }
              </div>
            </div>
          </div>
        </div>

        <!-- Payroll Reports -->
        <div class="col-md-6 mb-4">
          <div class="card shadow-sm h-100">
            <div class="card-header bg-white">
              <h5 class="mb-0"><i class="fas fa-money-bill-wave me-2"></i>Payroll Reports</h5>
            </div>
            <div class="card-body p-0">
              <div class="list-group list-group-flush">
                @for (report of payrollReports; track report.id) {
                  <div class="list-group-item d-flex justify-content-between align-items-center">
                    <div>
                      <div class="fw-bold">{{ report.name }}</div>
                      <small class="text-muted">{{ report.description }}</small>
                    </div>
                    <button class="btn btn-sm btn-outline-primary" (click)="generateReport(report)">
                      <i class="fas fa-download"></i>
                    </button>
                  </div>
                }
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class ReportsListComponent implements OnInit {
  readonly store = inject(ReportsStore);
  private router = inject(Router);

  reports = [
    {
      id: 1,
      name: 'Employee Directory',
      description: 'Complete list of all employees',
      type: ReportType.EMPLOYEE,
    },
    {
      id: 2,
      name: 'Employee Profile',
      description: 'Detailed employee information',
      type: ReportType.EMPLOYEE,
    },
    {
      id: 3,
      name: 'New Joinings',
      description: 'Employees joined in period',
      type: ReportType.EMPLOYEE,
    },
    {
      id: 4,
      name: 'Employee Birthdays',
      description: 'Upcoming birthdays',
      type: ReportType.EMPLOYEE,
    },
    {
      id: 5,
      name: 'Attendance Summary',
      description: 'Monthly attendance overview',
      type: ReportType.ATTENDANCE,
    },
    {
      id: 6,
      name: 'Late Arrivals',
      description: 'Employees with late entries',
      type: ReportType.ATTENDANCE,
    },
    {
      id: 7,
      name: 'Attendance Calendar',
      description: 'Day-wise attendance',
      type: ReportType.ATTENDANCE,
    },
    { id: 8, name: 'Leave Balance', description: 'Leave balance report', type: ReportType.LEAVE },
    {
      id: 9,
      name: 'Leave Request',
      description: 'Leave requests in period',
      type: ReportType.LEAVE,
    },
    { id: 10, name: 'Leave Usage', description: 'Leave usage by type', type: ReportType.LEAVE },
    {
      id: 11,
      name: 'Payroll Register',
      description: 'Monthly payroll details',
      type: ReportType.PAYROLL,
    },
    {
      id: 12,
      name: 'Salary Slips',
      description: 'Individual salary slips',
      type: ReportType.PAYROLL,
    },
    { id: 13, name: 'Tax Report', description: 'Tax deductions report', type: ReportType.PAYROLL },
  ];

  get employeeReports() {
    return this.reports.filter((r) => r.type === ReportType.EMPLOYEE);
  }
  get attendanceReports() {
    return this.reports.filter((r) => r.type === ReportType.ATTENDANCE);
  }
  get leaveReports() {
    return this.reports.filter((r) => r.type === ReportType.LEAVE);
  }
  get payrollReports() {
    return this.reports.filter((r) => r.type === ReportType.PAYROLL);
  }

  readonly Permission = Permission;
  readonly getReportTypeLabel = getReportTypeLabel;

  ngOnInit(): void {
    this.store.loadReports();
  }

  generateReport(report: any): void {
    const format = prompt('Select format (pdf/excel/csv):', 'pdf');
    if (format && ['pdf', 'excel', 'csv'].includes(format.toLowerCase())) {
      this.store.generateReport(report.id, { format: format as ReportFormat });
    }
  }
}
