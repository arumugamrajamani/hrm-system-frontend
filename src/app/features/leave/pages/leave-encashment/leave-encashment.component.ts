import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { LeaveStore } from '../../services/leave.store';
import { LeaveEncashment } from '../../models/leave.model';
import { SharedModule } from '../../../../shared/shared.module';

@Component({
  selector: 'app-leave-encashment',
  standalone: false,
  template: `
    <div class="encashment-container">
      <div class="page-header">
        <h2>Leave Encashment</h2>
        <button class="btn btn-primary" (click)="requestEncashment()">
          New Encashment Request
        </button>
      </div>

      <div class="filters-card card">
        <div class="card-body">
          <form [formGroup]="filterForm" class="row g-3 align-items-end">
            <div class="col-md-3">
              <label class="form-label">Employee</label>
              <input
                type="text"
                class="form-control"
                formControlName="employeeSearch"
                placeholder="Search employee..."
              />
            </div>
            <div class="col-md-3">
              <label class="form-label">Leave Type</label>
              <select class="form-control" formControlName="leaveTypeId">
                <option value="">All</option>
                <option *ngFor="let enc of encashments()" [value]="enc.leaveTypeId">
                  {{ enc.leaveTypeName || 'Type ' + enc.leaveTypeId }}
                </option>
              </select>
            </div>
            <div class="col-md-3">
              <label class="form-label">Status</label>
              <select class="form-control" formControlName="status">
                <option value="">All</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
                <option value="processed">Processed</option>
              </select>
            </div>
            <div class="col-md-3">
              <button class="btn btn-secondary w-100" (click)="applyFilters()">Filter</button>
            </div>
          </form>
        </div>
      </div>

      <div class="card mt-3">
        <div class="card-body">
          <div *ngIf="store.loading()" class="text-center p-4">
            <div class="spinner-border" role="status"></div>
          </div>

          <div *ngIf="store.error()" class="alert alert-danger">{{ store.error() }}</div>

          <div
            *ngIf="!store.loading() && filteredEncashments().length === 0"
            class="empty-state text-center p-5"
          >
            <i class="fas fa-money-bill-wave fa-3x text-muted mb-3"></i>
            <p class="text-muted">No encashment records found.</p>
          </div>

          <div
            *ngIf="!store.loading() && filteredEncashments().length > 0"
            class="table-responsive"
          >
            <table class="table table-hover">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Leave Type</th>
                  <th>Days Encashed</th>
                  <th>Rate/Day</th>
                  <th>Total Amount</th>
                  <th>Requested Date</th>
                  <th>Processed Date</th>
                  <th>Status</th>
                  <th>Remarks</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let enc of filteredEncashments()">
                  <td>{{ enc.employeeName || 'Emp #' + enc.employeeId }}</td>
                  <td>{{ enc.leaveTypeName || 'Type ' + enc.leaveTypeId }}</td>
                  <td>{{ enc.encashedDays }}</td>
                  <td>{{ enc.ratePerDay | currency: 'INR' : 'symbol' : '1.2-2' }}</td>
                  <td>{{ enc.totalAmount | currency: 'INR' : 'symbol' : '1.2-2' }}</td>
                  <td>{{ enc.requestedDate }}</td>
                  <td>{{ enc.processedDate || '-' }}</td>
                  <td>
                    <span class="badge" [ngClass]="getStatusBadgeClass(enc.status)">
                      {{ enc.status | titlecase }}
                    </span>
                  </td>
                  <td>{{ enc.remarks || '-' }}</td>
                  <td>
                    <div class="btn-group btn-group-sm" *ngIf="enc.status === 'pending'">
                      <button class="btn btn-success" (click)="approve(enc)" title="Approve">
                        <i class="fas fa-check"></i>
                      </button>
                      <button class="btn btn-danger" (click)="reject(enc)" title="Reject">
                        <i class="fas fa-times"></i>
                      </button>
                    </div>
                    <span *ngIf="enc.status !== 'pending'" class="text-muted">-</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .encashment-container {
        padding: 20px;
      }
      .page-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20px;
      }
      .filters-card {
        background: #f8f9fa;
      }
      .table th {
        font-weight: 600;
        font-size: 13px;
      }
      .btn-group-sm .btn {
        padding: 4px 8px;
      }
      .badge {
        font-size: 12px;
        padding: 4px 8px;
      }
    `,
  ],
})
export class LeaveEncashmentComponent implements OnInit {
  readonly store = inject(LeaveStore);
  private fb = inject(FormBuilder);

  filterForm: FormGroup = this.fb.group({
    employeeSearch: [''],
    leaveTypeId: [''],
    status: [''],
  });

  encashments = this.store.encashments;

  ngOnInit(): void {
    this.store.loadEncashments();
  }

  get filteredEncashments(): () => LeaveEncashment[] {
    return () => {
      const form = this.filterForm.value;
      return this.store.encashments().filter((enc) => {
        if (
          form.employeeSearch &&
          !(enc.employeeName || '').toLowerCase().includes(form.employeeSearch.toLowerCase())
        )
          return false;
        if (form.leaveTypeId && enc.leaveTypeId !== +form.leaveTypeId) return false;
        if (form.status && enc.status !== form.status) return false;
        return true;
      });
    };
  }

  applyFilters(): void {
    const form = this.filterForm.value;
    this.store.loadEncashments({
      employeeId: form.employeeSearch ? undefined : undefined,
      leaveTypeId: form.leaveTypeId ? +form.leaveTypeId : undefined,
      status: form.status || undefined,
    });
  }

  getStatusBadgeClass(status: string): string {
    const map: Record<string, string> = {
      pending: 'bg-warning',
      approved: 'bg-success',
      rejected: 'bg-danger',
      processed: 'bg-info',
    };
    return map[status] || 'bg-secondary';
  }

  approve(enc: LeaveEncashment): void {
    const remarks = prompt('Enter approval remarks (optional):');
    this.store.approveEncashment(enc.id, remarks || undefined).subscribe();
  }

  reject(enc: LeaveEncashment): void {
    const remarks = prompt('Enter rejection remarks:');
    if (remarks) {
      this.store.rejectEncashment(enc.id, remarks).subscribe();
    }
  }

  requestEncashment(): void {
    // Navigate to encashment request form or open modal
    alert('Encashment request form - to be implemented');
  }
}
