export enum TimesheetStatus {
  DRAFT = 'draft',
  SUBMITTED = 'submitted',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  REVISION_REQUESTED = 'revision_requested',
}

export interface TimesheetEntry {
  id: number;
  date: string;
  hours: number;
  projectId?: number;
  projectName?: string;
  taskDescription?: string;
  isBillable: boolean;
}

export interface Timesheet {
  id: number;
  employeeId: number;
  employeeName?: string;
  weekStartDate: string;
  status: TimesheetStatus;
  totalHours: number;
  entries: TimesheetEntry[];
  submittedAt?: string;
  approvedAt?: string;
  approvedBy?: number;
  approvedByName?: string;
}

export interface TimesheetFilter {
  employeeId?: number;
  weekStartDate?: string;
  status?: TimesheetStatus;
  search?: string;
  page?: number;
  limit?: number;
}

export function getTimesheetStatusLabel(status: TimesheetStatus): string {
  const labels: Record<TimesheetStatus, string> = {
    [TimesheetStatus.DRAFT]: 'Draft',
    [TimesheetStatus.SUBMITTED]: 'Submitted',
    [TimesheetStatus.APPROVED]: 'Approved',
    [TimesheetStatus.REJECTED]: 'Rejected',
    [TimesheetStatus.REVISION_REQUESTED]: 'Revision Requested',
  };
  return labels[status] || status;
}

// Project/Task Tagging
export interface TimesheetProject {
  id: number;
  name: string;
  code: string;
  description?: string;
  clientId?: number;
  clientName?: string;
  isBillable: boolean;
  budgetHours?: number;
  loggedHours?: number;
  status: 'active' | 'on_hold' | 'completed' | 'cancelled';
  startDate?: string;
  endDate?: string;
}

export interface TimesheetTask {
  id: number;
  projectId: number;
  projectName?: string;
  name: string;
  description?: string;
  assignedTo?: number;
  assignedToName?: string;
  estimatedHours?: number;
  loggedHours?: number;
  status: 'open' | 'in_progress' | 'completed' | 'on_hold';
}

export interface TimesheetEntryWithDetails extends TimesheetEntry {
  projectId?: number;
  projectName?: string;
  taskId?: number;
  taskName?: string;
  isBillable: boolean;
  clientName?: string;
}

export type TimesheetApprovalStatus = 'draft' | 'submitted' | 'approved' | 'rejected' | 'returned';

// Timesheet Approval
export interface TimesheetApproval {
  id: number;
  timesheetId: number;
  employeeId: number;
  employeeName?: string;
  weekStart: string;
  weekEnd: string;
  totalHours: number;
  billableHours?: number;
  status: TimesheetApprovalStatus;
  submittedAt?: string;
  approvedBy?: number;
  approvedByName?: string;
  approvedAt?: string;
  rejectionReason?: string;
}

export function getTimesheetApprovalStatusLabel(status: TimesheetApprovalStatus): string {
  const labels: Record<TimesheetApprovalStatus, string> = {
    draft: 'Draft',
    submitted: 'Submitted',
    approved: 'Approved',
    rejected: 'Rejected',
    returned: 'Returned',
  };
  return labels[status] || status;
}

export interface TimesheetWeeklySummary {
  weekStart: string;
  weekEnd: string;
  totalHours: number;
  billableHours: number;
  nonBillableHours: number;
  projects: {
    projectId: number;
    projectName: string;
    hours: number;
    tasks: {
      taskId: number;
      taskName: string;
      hours: number;
    }[];
  }[];
}

// Lock Period
export interface TimesheetLockPeriod {
  id: number;
  fromDate: string;
  toDate: string;
  isLocked: boolean;
  lockedBy?: number;
  lockedByName?: string;
  lockedAt?: string;
  reason?: string;
}
