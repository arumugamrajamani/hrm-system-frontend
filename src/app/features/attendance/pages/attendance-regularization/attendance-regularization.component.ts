import { Component, OnInit, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormsModule,
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { AttendanceRegularization } from '../../models/attendance.model';

@Component({
  selector: 'app-attendance-regularization',
  standalone: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="container-fluid">
      <div class="row mb-4">
        <div class="col">
          <h2 class="page-title">
            <i class="fas fa-clipboard-check me-2"></i>
            Attendance Regularization
          </h2>
        </div>
        <div class="col-auto">
          <button class="btn btn-primary" (click)="showRequestForm.set(!showRequestForm())">
            <i
              class="fas"
              [class.fa-plus]="!showRequestForm()"
              [class.fa-times]="showRequestForm()"
            ></i>
            {{ showRequestForm() ? 'Cancel' : 'New Request' }}
          </button>
        </div>
      </div>

      <!-- Request Form -->
      @if (showRequestForm()) {
        <div class="card shadow-sm mb-4">
          <div class="card-header">
            <h5 class="mb-0">Request Regularization</h5>
          </div>
          <div class="card-body">
            <form [formGroup]="requestForm" (ngSubmit)="submitRequest()">
              <div class="row g-3">
                <div class="col-md-6">
                  <label class="form-label">Employee ID</label>
                  <input
                    type="number"
                    class="form-control"
                    formControlName="employeeId"
                    placeholder="Enter employee ID"
                  />
                </div>
                <div class="col-md-6">
                  <label class="form-label">Date</label>
                  <input type="date" class="form-control" formControlName="date" />
                </div>
                <div class="col-md-6">
                  <label class="form-label">Type</label>
                  <select class="form-select" formControlName="type">
                    <option value="">Select type</option>
                    <option value="missing_check_in">Missing Check In</option>
                    <option value="missing_check_out">Missing Check Out</option>
                    <option value="incorrect_hours">Incorrect Hours</option>
                    <option value="forgot_punch">Forgot Punch</option>
                    <option value="work_from_home">Work From Home</option>
                  </select>
                </div>
                <div class="col-md-6">
                  <label class="form-label">Reason</label>
                  <textarea
                    class="form-control"
                    formControlName="reason"
                    rows="3"
                    placeholder="Enter reason"
                  ></textarea>
                </div>
                @if (
                  requestForm.get('type')?.value === 'missing_check_in' ||
                  requestForm.get('type')?.value === 'incorrect_hours'
                ) {
                  <div class="col-md-6">
                    <label class="form-label">Requested Check In</label>
                    <input type="time" class="form-control" formControlName="requestedCheckIn" />
                  </div>
                }
                @if (
                  requestForm.get('type')?.value === 'missing_check_out' ||
                  requestForm.get('type')?.value === 'incorrect_hours'
                ) {
                  <div class="col-md-6">
                    <label class="form-label">Requested Check Out</label>
                    <input type="time" class="form-control" formControlName="requestedCheckOut" />
                  </div>
                }
                <div class="col-12">
                  <button type="submit" class="btn btn-primary" [disabled]="requestForm.invalid">
                    Submit Request
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      }

      <!-- Filter -->
      <div class="card shadow-sm mb-4">
        <div class="card-body">
          <div class="row g-3">
            <div class="col-md-3">
              <label class="form-label">Status Filter</label>
              <select
                class="form-select"
                [value]="statusFilter()"
                (change)="onStatusFilterChange($event)"
              >
                <option value="">All</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <!-- Regularization Requests Table -->
      <div class="card shadow-sm">
        <div class="card-body p-0">
          @if (loading()) {
            <div class="text-center py-5">
              <div class="spinner-border text-primary"></div>
            </div>
          } @else {
            <div class="table-responsive">
              <table class="table table-hover mb-0">
                <thead>
                  <tr>
                    <th>Employee</th>
                    <th>Date</th>
                    <th>Type</th>
                    <th>Reason</th>
                    <th>Status</th>
                    <th>Requested At</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  @for (req of filteredRequests(); track req.id) {
                    <tr>
                      <td>{{ req.employeeName || 'EMP-' + req.employeeId }}</td>
                      <td>{{ req.date | date: 'mediumDate' }}</td>
                      <td>
                        <span class="badge bg-info">{{ getTypeLabel(req.type) }}</span>
                      </td>
                      <td>{{ req.reason }}</td>
                      <td>
                        <span class="badge" [class]="getStatusBadgeClass(req.status)">
                          {{ req.status | titlecase }}
                        </span>
                      </td>
                      <td>{{ req.requestedAt | date: 'medium' }}</td>
                      <td>
                        @if (req.status === 'pending') {
                          <div class="btn-group btn-group-sm">
                            <button
                              class="btn btn-success"
                              (click)="approveRequest(req)"
                              title="Approve"
                            >
                              <i class="fas fa-check"></i>
                            </button>
                            <button
                              class="btn btn-danger"
                              (click)="rejectRequest(req)"
                              title="Reject"
                            >
                              <i class="fas fa-times"></i>
                            </button>
                          </div>
                        } @else {
                          <span class="text-muted">-</span>
                        }
                      </td>
                    </tr>
                  } @empty {
                    <tr>
                      <td colspan="7" class="text-center py-4 text-muted">
                        No regularization requests found
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          }
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .page-title {
        font-size: 1.5rem;
        font-weight: 600;
        color: #2c3e50;
      }
    `,
  ],
})
export class AttendanceRegularizationComponent implements OnInit {
  private fb = inject(FormBuilder);

  showRequestForm = signal(false);
  loading = signal(false);
  statusFilter = signal('');

  requests = signal<AttendanceRegularization[]>([
    {
      id: 1,
      employeeId: 101,
      employeeName: 'John Doe',
      date: '2026-04-28',
      type: 'missing_check_in',
      reason: 'Forgot to punch in due to system issue',
      status: 'pending',
      requestedAt: '2026-04-28T10:30:00',
      requestedCheckIn: '09:00',
    },
    {
      id: 2,
      employeeId: 102,
      employeeName: 'Jane Smith',
      date: '2026-04-27',
      type: 'incorrect_hours',
      reason: 'Worked extra hours but not reflected',
      status: 'approved',
      requestedAt: '2026-04-27T16:45:00',
      requestedCheckIn: '09:00',
      requestedCheckOut: '19:00',
      approvedAt: '2026-04-28T09:00:00',
      approvedByName: 'Manager',
    },
    {
      id: 3,
      employeeId: 103,
      employeeName: 'Bob Wilson',
      date: '2026-04-26',
      type: 'forgot_punch',
      reason: 'Forgot to punch out',
      status: 'pending',
      requestedAt: '2026-04-27T08:15:00',
      requestedCheckOut: '18:00',
    },
  ]);

  requestForm: FormGroup;

  constructor() {
    this.requestForm = this.fb.group({
      employeeId: ['', Validators.required],
      date: ['', Validators.required],
      type: ['', Validators.required],
      reason: ['', [Validators.required, Validators.minLength(10)]],
      requestedCheckIn: [''],
      requestedCheckOut: [''],
    });
  }

  ngOnInit(): void {}

  onStatusFilterChange(event: Event): void {
    this.statusFilter.set((event.target as HTMLSelectElement).value);
  }

  filteredRequests() {
    const filter = this.statusFilter();
    if (!filter) return this.requests();
    return this.requests().filter((r) => r.status === filter);
  }

  getTypeLabel(type: string): string {
    const labels: Record<string, string> = {
      missing_check_in: 'Missing Check In',
      missing_check_out: 'Missing Check Out',
      incorrect_hours: 'Incorrect Hours',
      forgot_punch: 'Forgot Punch',
      work_from_home: 'Work From Home',
    };
    return labels[type] || type;
  }

  getStatusBadgeClass(status: string): string {
    const classes: Record<string, string> = {
      pending: 'bg-warning',
      approved: 'bg-success',
      rejected: 'bg-danger',
    };
    return classes[status] || 'bg-secondary';
  }

  submitRequest(): void {
    if (this.requestForm.invalid) return;

    const formValue = this.requestForm.value;
    const newRequest: AttendanceRegularization = {
      id: this.requests().length + 1,
      employeeId: formValue.employeeId,
      date: formValue.date,
      type: formValue.type,
      reason: formValue.reason,
      status: 'pending',
      requestedAt: new Date().toISOString(),
      requestedCheckIn: formValue.requestedCheckIn,
      requestedCheckOut: formValue.requestedCheckOut,
    };

    this.requests.set([newRequest, ...this.requests()]);
    this.requestForm.reset();
    this.showRequestForm.set(false);
  }

  approveRequest(req: AttendanceRegularization): void {
    const updated = this.requests().map((r) =>
      r.id === req.id
        ? {
            ...r,
            status: 'approved' as const,
            approvedAt: new Date().toISOString(),
            approvedByName: 'Current User',
          }
        : r,
    );
    this.requests.set(updated);
  }

  rejectRequest(req: AttendanceRegularization): void {
    const updated = this.requests().map((r) =>
      r.id === req.id
        ? {
            ...r,
            status: 'rejected' as const,
            approvedAt: new Date().toISOString(),
            approvedByName: 'Current User',
          }
        : r,
    );
    this.requests.set(updated);
  }
}
