import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { LeaveStore } from '../../services/leave.store';
import {
  LeaveRequest,
  LeaveStatus,
  LeaveType,
  getLeaveStatusLabel,
  getLeaveTypeLabel,
} from '../../models/leave.model';
import { Permission } from '../../../../core/models/rbac.models';
import { LoadingSkeletonComponent } from '../../../../shared/components/loading-skeleton/loading-skeleton.component';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';

@Component({
  selector: 'app-leave-list',
  standalone: false,
  template: `
    <div class="container-fluid">
      <div class="row mb-4">
        <div class="col">
          <h2 class="page-title">
            <i class="fas fa-calendar-minus me-2"></i>
            Leave Management
          </h2>
        </div>
        <div class="col-auto">
          <div class="btn-group me-2">
            <button class="btn btn-outline-secondary" (click)="navigateToBalances()">
              <i class="fas fa-coins me-1"></i>
              Balances
            </button>
            <button class="btn btn-outline-secondary" (click)="navigateToPolicies()">
              <i class="fas fa-cog me-1"></i>
              Policies
            </button>
          </div>
          @if (store.canCreate()) {
            <button class="btn btn-primary" (click)="navigateToApply()">
              <i class="fas fa-plus me-2"></i>
              Apply Leave
            </button>
          }
        </div>
      </div>

      <!-- Leave Balance Cards -->
      @if (store.leaveBalances().length > 0) {
        <div class="row mb-4">
          @for (balance of store.leaveBalances(); track balance.id) {
            <div class="col-md-3 mb-3">
              <div class="card shadow-sm">
                <div class="card-body">
                  <h6 class="text-muted mb-2">{{ getLeaveTypeLabel(balance.leaveType) }}</h6>
                  <div class="d-flex justify-content-between align-items-center">
                    <div>
                      <h4 class="mb-0">{{ balance.available }}</h4>
                      <small class="text-muted">Available</small>
                    </div>
                    <div class="text-end">
                      <small class="text-muted">Total: {{ balance.totalAllocated }}</small
                      ><br />
                      <small class="text-muted">Used: {{ balance.totalAvailed }}</small>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          }
        </div>
      }

      <!-- Filters -->
      <div class="row mb-3">
        <div class="col-md-4">
          <div class="input-group">
            <span class="input-group-text"><i class="fas fa-search"></i></span>
            <input
              type="text"
              class="form-control"
              placeholder="Search..."
              [(ngModel)]="searchTerm"
              (ngModelChange)="onSearch()"
            />
          </div>
        </div>
        <div class="col-md-3">
          <select class="form-select" [(ngModel)]="statusFilter" (ngModelChange)="onFilterChange()">
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
        <div class="col-md-3">
          <select
            class="form-select"
            [(ngModel)]="leaveTypeFilter"
            (ngModelChange)="onFilterChange()"
          >
            <option value="">All Types</option>
            <option value="casual">Casual Leave</option>
            <option value="sick">Sick Leave</option>
            <option value="privileged">Privileged Leave</option>
            <option value="work_from_home">Work From Home</option>
          </select>
        </div>
      </div>

      <!-- Leave Requests Table -->
      @if (store.loading()) {
        <div class="card shadow-sm">
          <div class="card-body">
            @for (row of skeletonRows; track $index) {
              <app-loading-skeleton
                type="table-row"
                [columns]="['150px', '120px', '180px', '60px', '100px', '120px', '150px']"
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
            @if (store.items().length === 0) {
              <app-empty-state
                icon="event_busy"
                title="No Leave Requests"
                message="There are no leave requests matching your criteria."
                actionLabel="Apply Leave"
                actionIcon="add"
                (action)="navigateToApply()"
              ></app-empty-state>
            } @else {
              <div class="table-responsive">
                <table class="table table-hover">
                  <thead>
                    <tr>
                      <th>Employee</th>
                      <th>Leave Type</th>
                      <th>Duration</th>
                      <th>Days</th>
                      <th>Status</th>
                      <th>Applied On</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    @for (request of store.items(); track request.id) {
                      <tr>
                        <td>{{ request.employeeName || 'N/A' }}</td>
                        <td>{{ getLeaveTypeLabel(request.leaveType) }}</td>
                        <td>
                          <div>{{ request.startDate | date: 'dd MMM' }}</div>
                          <small class="text-muted"
                            >to {{ request.endDate | date: 'dd MMM yyyy' }}</small
                          >
                        </td>
                        <td>{{ request.totalDays }}</td>
                        <td>
                          <span
                            class="badge"
                            [class.bg-warning]="request.status === 'pending'"
                            [class.bg-success]="request.status === 'approved'"
                            [class.bg-danger]="request.status === 'rejected'"
                            [class.bg-secondary]="request.status === 'cancelled'"
                          >
                            {{ getLeaveStatusLabel(request.status) }}
                          </span>
                        </td>
                        <td>{{ request.createdAt | date: 'dd MMM yyyy' }}</td>
                        <td>
                          <div class="btn-group btn-group-sm">
                            <button
                              class="btn btn-outline-primary"
                              (click)="viewRequest(request)"
                              title="View"
                            >
                              <i class="fas fa-eye"></i>
                            </button>
                            @if (store.canApprove() && request.status === 'pending') {
                              <button
                                class="btn btn-success"
                                (click)="onApprove(request)"
                                title="Approve"
                              >
                                <i class="fas fa-check"></i>
                              </button>
                              <button
                                class="btn btn-danger"
                                (click)="onReject(request)"
                                title="Reject"
                              >
                                <i class="fas fa-times"></i>
                              </button>
                            }
                            @if (request.status === 'pending' && !store.canApprove()) {
                              <button
                                class="btn btn-outline-danger"
                                (click)="onCancel(request)"
                                title="Cancel"
                              >
                                <i class="fas fa-times-circle"></i>
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
export class LeaveListComponent implements OnInit {
  readonly store = inject(LeaveStore);
  private router = inject(Router);
  private destroy$ = new Subject<void>();

  searchTerm = '';
  statusFilter = '';
  leaveTypeFilter = '';
  skeletonRows = Array(5).fill(0);

  readonly Permission = Permission;
  readonly getLeaveStatusLabel = getLeaveStatusLabel;
  readonly getLeaveTypeLabel = getLeaveTypeLabel;

  ngOnInit(): void {
    this.store.loadLeaveRequests();
    this.store.loadLeaveBalances();
  }

  onSearch(): void {
    this.store.loadLeaveRequests({ search: this.searchTerm, page: 1 });
  }

  onFilterChange(): void {
    this.store.loadLeaveRequests({
      status: this.statusFilter as LeaveStatus,
      leaveType: this.leaveTypeFilter as LeaveType,
      page: 1,
    });
  }

  reload(): void {
    this.store.loadLeaveRequests();
    this.store.loadLeaveBalances();
  }

  navigateToApply(): void {
    this.router.navigate(['/leave/apply']);
  }

  navigateToBalances(): void {
    this.router.navigate(['/leave/balances']);
  }

  navigateToPolicies(): void {
    this.router.navigate(['/leave/policies']);
  }

  viewRequest(request: LeaveRequest): void {
    this.router.navigate(['/leave', request.id]);
  }

  onApprove(request: LeaveRequest): void {
    if (confirm(`Approve leave request for ${request.employeeName}?`)) {
      this.store.approveRequest(request.id).subscribe();
    }
  }

  onReject(request: LeaveRequest): void {
    const comments = prompt('Enter rejection reason:');
    if (comments) {
      this.store.rejectRequest(request.id, comments).subscribe();
    }
  }

  onCancel(request: LeaveRequest): void {
    if (confirm('Cancel this leave request?')) {
      this.store.cancelRequest(request.id).subscribe();
    }
  }
}
