import { Component, OnInit, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AttendanceStore } from '../../services/attendance.store';
import {
  AttendanceRecord,
  AttendanceStatus,
  getAttendanceStatusLabel,
  getAttendanceStatusColor,
} from '../../models/attendance.model';
import { Permission } from '../../../../core/models/rbac.models';

@Component({
  selector: 'app-attendance-list',
  standalone: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="container-fluid">
      <div class="row mb-4">
        <div class="col">
          <h2 class="page-title">
            <i class="fas fa-clock me-2"></i>
            Attendance Management
          </h2>
        </div>
        <div class="col-auto">
          <button class="btn btn-outline-primary me-2" (click)="navigateToCalendar()">
            <i class="fas fa-calendar-alt me-2"></i>
            Calendar View
          </button>
          @if (store.canMarkAttendance()) {
            <button class="btn btn-primary" (click)="markAttendance()">
              <i class="fas fa-plus me-2"></i>
              Mark Attendance
            </button>
          }
        </div>
      </div>

      <!-- Filters -->
      <div class="row mb-3">
        <div class="col-md-3">
          <input
            type="date"
            class="form-control"
            [(ngModel)]="fromDate"
            (ngModelChange)="onFilterChange()"
            placeholder="From Date"
          />
        </div>
        <div class="col-md-3">
          <input
            type="date"
            class="form-control"
            [(ngModel)]="toDate"
            (ngModelChange)="onFilterChange()"
            placeholder="To Date"
          />
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

      <!-- Attendance Table -->
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
                    <th>Date</th>
                    <th>Check In</th>
                    <th>Check Out</th>
                    <th>Work Hours</th>
                    <th>Status</th>
                    <th>Remarks</th>
                  </tr>
                </thead>
                <tbody>
                  @for (record of store.items(); track record.id) {
                    <tr>
                      <td>{{ record.employeeName || 'N/A' }}</td>
                      <td>{{ record.date | date: 'dd MMM yyyy' }}</td>
                      <td>{{ record.checkIn || '-' }}</td>
                      <td>{{ record.checkOut || '-' }}</td>
                      <td>{{ record.workHours || 0 }} hrs</td>
                      <td>
                        <span class="badge" [class]="'bg-' + getStatusColor(record.status)">
                          {{ getStatusLabel(record.status) }}
                        </span>
                      </td>
                      <td>{{ record.remarks || '-' }}</td>
                    </tr>
                  } @empty {
                    <tr>
                      <td colspan="7" class="text-center py-4">
                        <div class="text-muted">
                          <i class="fas fa-clock fa-2x mb-2 d-block"></i>
                          No attendance records found
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
export class AttendanceListComponent implements OnInit {
  readonly store = inject(AttendanceStore);
  private router = inject(Router);

  fromDate = '';
  toDate = '';
  statusFilter = '';
  statusList = Object.values(AttendanceStatus);

  readonly Permission = Permission;
  readonly getStatusLabel = getAttendanceStatusLabel;
  readonly getStatusColor = getAttendanceStatusColor;

  ngOnInit(): void {
    this.store.loadRecords();
  }

  onFilterChange(): void {
    this.store.loadRecords({
      fromDate: this.fromDate || undefined,
      toDate: this.toDate || undefined,
      status: this.statusFilter as AttendanceStatus,
    });
  }

  navigateToCalendar(): void {
    this.router.navigate(['/attendance/calendar']);
  }

  markAttendance(): void {
    alert('Mark attendance dialog - to be implemented');
  }
}
