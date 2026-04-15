import { Component, OnInit, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ReportsStore } from '../../services/reports.store';
import { Permission } from '../../../../core/models/rbac.models';

@Component({
  selector: 'app-dashboard-widgets',
  standalone: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="container-fluid">
      <div class="row mb-4">
        <div class="col">
          <h2 class="page-title">
            <i class="fas fa-chart-line me-2"></i>
            Analytics Dashboard
          </h2>
        </div>
        <div class="col-auto">
          <select class="form-select" [(ngModel)]="selectedYear" (ngModelChange)="loadData()">
            <option [value]="2026">2026</option>
            <option [value]="2025">2025</option>
            <option [value]="2024">2024</option>
          </select>
        </div>
      </div>

      @if (store.loading()) {
        <div class="text-center py-5">
          <div class="spinner-border text-primary"></div>
        </div>
      } @else {
        <!-- Key Metrics -->
        <div class="row mb-4">
          <div class="col-md-3">
            <div class="card shadow-sm border-primary">
              <div class="card-body">
                <div class="d-flex justify-content-between align-items-center">
                  <div>
                    <h6 class="text-muted mb-2">Total Employees</h6>
                    <h3 class="mb-0">{{ employeeStats.total }}</h3>
                  </div>
                  <div class="text-primary">
                    <i class="fas fa-users fa-2x"></i>
                  </div>
                </div>
                <small class="text-success">{{ employeeStats.active }} active</small>
              </div>
            </div>
          </div>
          <div class="col-md-3">
            <div class="card shadow-sm border-success">
              <div class="card-body">
                <div class="d-flex justify-content-between align-items-center">
                  <div>
                    <h6 class="text-muted mb-2">Attendance Rate</h6>
                    <h3 class="mb-0">{{ attendanceRate }}%</h3>
                  </div>
                  <div class="text-success">
                    <i class="fas fa-check-circle fa-2x"></i>
                  </div>
                </div>
                <small class="text-muted">This month</small>
              </div>
            </div>
          </div>
          <div class="col-md-3">
            <div class="card shadow-sm border-warning">
              <div class="card-body">
                <div class="d-flex justify-content-between align-items-center">
                  <div>
                    <h6 class="text-muted mb-2">Pending Leaves</h6>
                    <h3 class="mb-0">{{ leaveStats.pending }}</h3>
                  </div>
                  <div class="text-warning">
                    <i class="fas fa-clock fa-2x"></i>
                  </div>
                </div>
                <small class="text-muted">Awaiting approval</small>
              </div>
            </div>
          </div>
          <div class="col-md-3">
            <div class="card shadow-sm border-info">
              <div class="card-body">
                <div class="d-flex justify-content-between align-items-center">
                  <div>
                    <h6 class="text-muted mb-2">Total Payroll</h6>
                    <h3 class="mb-0">{{ payrollStats.total | number: '1.0-0' }}</h3>
                  </div>
                  <div class="text-info">
                    <i class="fas fa-money-bill-wave fa-2x"></i>
                  </div>
                </div>
                <small class="text-muted">This month</small>
              </div>
            </div>
          </div>
        </div>

        <!-- Charts Row -->
        <div class="row mb-4">
          <!-- Department Distribution -->
          <div class="col-md-6 mb-4">
            <div class="card shadow-sm h-100">
              <div class="card-header bg-white">
                <h5 class="mb-0">Employees by Department</h5>
              </div>
              <div class="card-body">
                <div class="table-responsive">
                  <table class="table table-sm">
                    <thead>
                      <tr>
                        <th>Department</th>
                        <th class="text-center">Count</th>
                        <th class="text-center">%</th>
                      </tr>
                    </thead>
                    <tbody>
                      @for (dept of departmentData; track dept.name) {
                        <tr>
                          <td>{{ dept.name }}</td>
                          <td class="text-center">{{ dept.count }}</td>
                          <td class="text-center">
                            <div class="progress" style="height: 20px;">
                              <div class="progress-bar" [style.width.%]="dept.percentage">
                                {{ dept.percentage }}%
                              </div>
                            </div>
                          </td>
                        </tr>
                      }
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

          <!-- Leave Statistics -->
          <div class="col-md-6 mb-4">
            <div class="card shadow-sm h-100">
              <div class="card-header bg-white">
                <h5 class="mb-0">Leave by Type</h5>
              </div>
              <div class="card-body">
                <div class="table-responsive">
                  <table class="table table-sm">
                    <thead>
                      <tr>
                        <th>Leave Type</th>
                        <th class="text-center">Used</th>
                        <th class="text-center">Available</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>Casual Leave</td>
                        <td class="text-center">3</td>
                        <td class="text-center">7</td>
                      </tr>
                      <tr>
                        <td>Sick Leave</td>
                        <td class="text-center">2</td>
                        <td class="text-center">8</td>
                      </tr>
                      <tr>
                        <td>Privileged Leave</td>
                        <td class="text-center">1</td>
                        <td class="text-center">9</td>
                      </tr>
                      <tr>
                        <td>Work From Home</td>
                        <td class="text-center">4</td>
                        <td class="text-center">6</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Recent Activity -->
        <div class="row">
          <div class="col-md-4 mb-4">
            <div class="card shadow-sm h-100">
              <div class="card-header bg-white">
                <h5 class="mb-0">Recent Joinings</h5>
              </div>
              <div class="card-body p-0">
                <div class="list-group list-group-flush">
                  <div class="list-group-item">
                    <div class="d-flex justify-content-between">
                      <div>
                        <div class="fw-bold">John Doe</div>
                        <small class="text-muted">Software Engineer</small>
                      </div>
                      <small class="text-muted">Mar 15, 2026</small>
                    </div>
                  </div>
                  <div class="list-group-item">
                    <div class="d-flex justify-content-between">
                      <div>
                        <div class="fw-bold">Jane Smith</div>
                        <small class="text-muted">UI Designer</small>
                      </div>
                      <small class="text-muted">Mar 10, 2026</small>
                    </div>
                  </div>
                  <div class="list-group-item">
                    <div class="d-flex justify-content-between">
                      <div>
                        <div class="fw-bold">Mike Johnson</div>
                        <small class="text-muted">QA Engineer</small>
                      </div>
                      <small class="text-muted">Mar 5, 2026</small>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="col-md-4 mb-4">
            <div class="card shadow-sm h-100">
              <div class="card-header bg-white">
                <h5 class="mb-0">Pending Approvals</h5>
              </div>
              <div class="card-body p-0">
                <div class="list-group list-group-flush">
                  <div class="list-group-item">
                    <div class="d-flex justify-content-between">
                      <div>
                        <div class="fw-bold">Leave Request</div>
                        <small class="text-muted">John Doe - 2 days</small>
                      </div>
                      <span class="badge bg-warning">Pending</span>
                    </div>
                  </div>
                  <div class="list-group-item">
                    <div class="d-flex justify-content-between">
                      <div>
                        <div class="fw-bold">Timesheet</div>
                        <small class="text-muted">Jane Smith - Week 12</small>
                      </div>
                      <span class="badge bg-warning">Pending</span>
                    </div>
                  </div>
                  <div class="list-group-item">
                    <div class="d-flex justify-content-between">
                      <div>
                        <div class="fw-bold">Expense Claim</div>
                        <small class="text-muted">Mike Johnson - $250</small>
                      </div>
                      <span class="badge bg-warning">Pending</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="col-md-4 mb-4">
            <div class="card shadow-sm h-100">
              <div class="card-header bg-white">
                <h5 class="mb-0">Upcoming Events</h5>
              </div>
              <div class="card-body p-0">
                <div class="list-group list-group-flush">
                  <div class="list-group-item">
                    <div class="d-flex justify-content-between">
                      <div>
                        <div class="fw-bold">Team Meeting</div>
                        <small class="text-muted">Apr 1, 2026 - 10:00 AM</small>
                      </div>
                    </div>
                  </div>
                  <div class="list-group-item">
                    <div class="d-flex justify-content-between">
                      <div>
                        <div class="fw-bold">Performance Review</div>
                        <small class="text-muted">Apr 5, 2026 - 2:00 PM</small>
                      </div>
                    </div>
                  </div>
                  <div class="list-group-item">
                    <div class="d-flex justify-content-between">
                      <div>
                        <div class="fw-bold">Office Holiday</div>
                        <small class="text-muted">Apr 14, 2026</small>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      }
    </div>
  `,
})
export class DashboardWidgetsComponent implements OnInit {
  readonly store = inject(ReportsStore);
  private router = inject(Router);

  selectedYear = 2026;

  employeeStats = { total: 45, active: 42 };
  attendanceRate = 94;
  leaveStats = { pending: 5 };
  payrollStats = { total: 185000 };

  departmentData = [
    { name: 'Engineering', count: 20, percentage: 44 },
    { name: 'Design', count: 8, percentage: 18 },
    { name: 'Marketing', count: 7, percentage: 16 },
    { name: 'Sales', count: 6, percentage: 13 },
    { name: 'HR', count: 4, percentage: 9 },
  ];

  readonly Permission = Permission;

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.store.loadEmployeeReport();
  }
}
