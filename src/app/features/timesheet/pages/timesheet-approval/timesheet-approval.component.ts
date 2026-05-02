import { Component, OnInit, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { TimesheetStore } from '../../services/timesheet.store';
import { TimesheetApiService } from '../../services/timesheet-api.service';
import {
  TimesheetApproval,
  TimesheetEntry,
  getTimesheetApprovalStatusLabel,
} from '../../models/timesheet.model';
import { RbacService } from '../../../../core/services/rbac.service';
import { Permission } from '../../../../core/models/rbac.models';

@Component({
  selector: 'app-timesheet-approval',
  standalone: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './timesheet-approval.component.html',
  styleUrls: ['./timesheet-approval.component.scss'],
})
export class TimesheetApprovalComponent implements OnInit {
  readonly store = inject(TimesheetStore);
  private api = inject(TimesheetApiService);
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private rbacService = inject(RbacService);
  private destroy$ = new Subject<void>();

  approvals = signal<TimesheetApproval[]>([]);
  expandedRows = signal<number[]>([]);
  showRejectModal = false;
  selectedApproval: TimesheetApproval | null = null;
  timesheetEntriesMap = new Map<number, TimesheetEntry[]>();

  readonly getStatusLabel = getTimesheetApprovalStatusLabel;

  rejectForm: FormGroup = this.fb.group({
    reason: ['', Validators.required],
  });

  ngOnInit(): void {
    this.loadApprovals();
  }

  private loadApprovals(): void {
    this.api.getPendingApprovals().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.approvals.set(response.data);
          this.loadTimesheetDetails(response.data);
        }
      },
    });
  }

  private loadTimesheetDetails(approvals: TimesheetApproval[]): void {
    approvals.forEach((approval) => {
      this.api.getTimesheetDetails(approval.timesheetId).subscribe({
        next: (response) => {
          if (response.success && response.data?.entries) {
            this.timesheetEntriesMap.set(approval.timesheetId, response.data.entries);
          }
        },
      });
    });
  }

  getTimesheetEntries(timesheetId: number): TimesheetEntry[] {
    return this.timesheetEntriesMap.get(timesheetId) || [];
  }

  toggleDetails(approvalId: number): void {
    const current = this.expandedRows();
    if (current.includes(approvalId)) {
      this.expandedRows.set(current.filter((id) => id !== approvalId));
    } else {
      this.expandedRows.set([...current, approvalId]);
    }
  }

  showDetails(approvalId: number): boolean {
    return this.expandedRows().includes(approvalId);
  }

  getStatusBadgeClass(status: string): string {
    const classMap: Record<string, string> = {
      draft: 'badge bg-secondary',
      submitted: 'badge bg-warning',
      approved: 'badge bg-success',
      rejected: 'badge bg-danger',
      returned: 'badge bg-info',
    };
    return classMap[status] || 'badge bg-secondary';
  }

  approveTimesheet(approval: TimesheetApproval): void {
    if (!confirm(`Approve timesheet for ${approval.employeeName}?`)) return;

    this.store.approveTimesheet(approval.timesheetId, '').subscribe({
      next: (response) => {
        if (response.success) {
          alert('Timesheet approved successfully');
          this.loadApprovals();
        }
      },
    });
  }

  rejectTimesheet(approval: TimesheetApproval): void {
    this.selectedApproval = approval;
    this.showRejectModal = true;
  }

  confirmReject(): void {
    if (this.rejectForm.invalid || !this.selectedApproval) return;

    const reason = this.rejectForm.value.reason;
    this.store.rejectTimesheet(this.selectedApproval.timesheetId, reason).subscribe({
      next: (response) => {
        if (response.success) {
          alert('Timesheet rejected successfully');
          this.closeRejectModal();
          this.loadApprovals();
        }
      },
    });
  }

  closeRejectModal(): void {
    this.showRejectModal = false;
    this.selectedApproval = null;
    this.rejectForm.reset();
  }

  goBack(): void {
    this.router.navigate(['/timesheet']);
  }
}
