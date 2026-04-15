import { Component, OnInit, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { TimesheetStore } from '../../services/timesheet.store';
import { Timesheet, TimesheetStatus, getTimesheetStatusLabel } from '../../models/timesheet.model';
import { Permission } from '../../../../core/models/rbac.models';

@Component({
  selector: 'app-timesheet-list',
  standalone: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="container-fluid">
      <div class="row mb-4">
        <div class="col">
          <h2 class="page-title">
            <i class="fas fa-clock me-2"></i>
            Timesheet Management
          </h2>
        </div>
        <div class="col-auto">
          @if (store.canSubmit()) {
            <button class="btn btn-primary" (click)="navigateToCreate()">
              <i class="fas fa-plus me-2"></i>
              New Timesheet
            </button>
          }
        </div>
      </div>

      <!-- Filters -->
      <div class="row mb-3">
        <div class="col-md-4">
          <div class="input-group">
            <span class="input-group-text"><i class="fas fa-search"></i></span>
            <input
              type="text"
              class="form-control"
              placeholder="Search by employee..."
              [(ngModel)]="searchTerm"
              (ngModelChange)="onSearch()"
            />
          </div>
        </div>
        <div class="col-md-3">
          <select class="form-select" [(ngModel)]="statusFilter" (ngModelChange)="onFilterChange()">
            <option value="">All Status</option>
            <option value="draft">Draft</option>
            <option value="submitted">Submitted</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
        <div class="col-md-3">
          <input
            type="date"
            class="form-control"
            [(ngModel)]="weekFilter"
            (ngModelChange)="onFilterChange()"
            placeholder="Week Start Date"
          />
        </div>
      </div>

      <!-- Timesheets Table -->
      @if (store.loading()) {
        <div class="text-center py-5">
          <div class="spinner-border text-primary"></div>
        </div>
      } @else {
        <div class="card shadow-sm">
          <div class="card-body">
            <div class="table-responsive">
              <table class="table table-hover">
                <thead>
                  <tr>
                    <th>Employee</th>
                    <th>Week</th>
                    <th>Total Hours</th>
                    <th>Status</th>
                    <th>Submitted</th>
                    <th>Approved By</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  @for (timesheet of store.timesheets(); track timesheet.id) {
                    <tr>
                      <td>{{ timesheet.employeeName || 'N/A' }}</td>
                      <td>
                        <div>{{ timesheet.weekStartDate | date: 'dd MMM' }}</div>
                        <small class="text-muted"
                          >{{ timesheet.entries.length || 0 }} entries</small
                        >
                      </td>
                      <td>
                        <strong>{{ timesheet.totalHours }}</strong>
                        <small class="text-muted"> hrs</small>
                      </td>
                      <td>
                        <span
                          class="badge"
                          [class.bg-secondary]="timesheet.status === 'draft'"
                          [class.bg-warning]="timesheet.status === 'submitted'"
                          [class.bg-success]="timesheet.status === 'approved'"
                          [class.bg-danger]="timesheet.status === 'rejected'"
                        >
                          {{ getStatusLabel(timesheet.status) }}
                        </span>
                      </td>
                      <td>
                        @if (timesheet.submittedAt) {
                          {{ timesheet.submittedAt | date: 'dd MMM yyyy' }}
                        } @else {
                          <span class="text-muted">-</span>
                        }
                      </td>
                      <td>
                        {{ timesheet.approvedByName || '-' }}
                      </td>
                      <td>
                        <div class="btn-group btn-group-sm">
                          <button
                            class="btn btn-outline-primary"
                            (click)="viewDetails(timesheet)"
                            title="View"
                          >
                            <i class="fas fa-eye"></i>
                          </button>
                          @if (timesheet.status === 'draft' && store.canSubmit()) {
                            <button
                              class="btn btn-outline-success"
                              (click)="submitTimesheet(timesheet)"
                              title="Submit"
                            >
                              <i class="fas fa-paper-plane"></i>
                            </button>
                          }
                          @if (store.canApprove() && timesheet.status === 'submitted') {
                            <button
                              class="btn btn-success"
                              (click)="approveTimesheet(timesheet)"
                              title="Approve"
                            >
                              <i class="fas fa-check"></i>
                            </button>
                            <button
                              class="btn btn-danger"
                              (click)="rejectTimesheet(timesheet)"
                              title="Reject"
                            >
                              <i class="fas fa-times"></i>
                            </button>
                          }
                        </div>
                      </td>
                    </tr>
                  } @empty {
                    <tr>
                      <td colspan="7" class="text-center py-4">
                        <div class="text-muted">
                          <i class="fas fa-clock fa-2x mb-2 d-block"></i>
                          No timesheets found
                        </div>
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          </div>
        </div>
      }
    </div>
  `,
})
export class TimesheetListComponent implements OnInit {
  readonly store = inject(TimesheetStore);
  private router = inject(Router);
  private destroy$ = new Subject<void>();

  searchTerm = '';
  statusFilter = '';
  weekFilter = '';

  readonly Permission = Permission;
  readonly getStatusLabel = getTimesheetStatusLabel;

  ngOnInit(): void {
    this.store.loadTimesheets();
  }

  onSearch(): void {
    this.store.loadTimesheets({ page: 1 });
  }

  onFilterChange(): void {
    this.store.loadTimesheets({
      status: this.statusFilter as TimesheetStatus,
      weekStartDate: this.weekFilter || undefined,
      page: 1,
    });
  }

  navigateToCreate(): void {
    this.router.navigate(['/timesheet/create']);
  }

  viewDetails(timesheet: Timesheet): void {
    this.router.navigate(['/timesheet', timesheet.id]);
  }

  submitTimesheet(timesheet: Timesheet): void {
    if (confirm('Submit this timesheet for approval?')) {
      this.store.submitTimesheet(timesheet.id).subscribe();
    }
  }

  approveTimesheet(timesheet: Timesheet): void {
    if (confirm('Approve this timesheet?')) {
      this.store.approveTimesheet(timesheet.id).subscribe();
    }
  }

  rejectTimesheet(timesheet: Timesheet): void {
    const comments = prompt('Enter rejection reason:');
    if (comments) {
      this.store.rejectTimesheet(timesheet.id, comments).subscribe();
    }
  }
}
